import { expect, test } from "@playwright/test";

test("renders a nonblank globe and filters the curated catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "陨石图谱" })).toBeVisible();
  await expect(page.locator(".globe-canvas[data-ready='true'][data-texture-ready='true']")).toBeVisible();

  const canvasStats = await page.locator(".globe-canvas").evaluate((globe) => {
    const canvas = globe.querySelector("canvas");
    return {
      width: canvas.width,
      height: canvas.height,
      brightPixels: Number(globe.dataset.pixelSample),
    };
  });

  expect(canvasStats).not.toBeNull();
  expect(canvasStats.width).toBeGreaterThan(300);
  expect(canvasStats.height).toBeGreaterThan(300);
  expect(canvasStats.brightPixels).toBeGreaterThan(50);

  await page.getByRole("button", { name: "铁陨石", exact: true }).click();
  await expect(page.locator(".record-row")).toHaveCount(13);
  await page.getByRole("button", { name: /霍巴 Hoba/ }).click();
  await expect(page.locator("#detail-title")).toHaveText("霍巴");
  await expect(page.getByRole("button", { name: "切换地球自动旋转" })).toHaveAttribute("aria-pressed", "false");
});

test("uses one panel at a time on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileGlobe = page.locator(
    ".globe-canvas[data-ready='true'][data-texture-ready='true']",
  );
  await expect(mobileGlobe).toBeVisible();
  expect(Number(await mobileGlobe.getAttribute("data-pixel-sample"))).toBeGreaterThan(50);
  await expect(page.locator(".catalog-panel")).not.toBeVisible();
  await expect(page.locator(".detail-panel")).not.toBeVisible();

  await page.getByRole("button", { name: "目录" }).click();
  await expect(page.locator(".catalog-panel")).toBeVisible();
  await expect(page.locator(".detail-panel")).not.toBeVisible();

  await page.getByRole("button", { name: /阿勒泰 Aletai/ }).click();
  await expect(page.locator("#detail-title")).toHaveText("阿勒泰");
  await expect(page.locator(".detail-panel")).toBeVisible();
  await expect(page.locator(".catalog-panel")).not.toBeVisible();
});

test("keeps the English 320px toolbar and content within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/?lang=en");

  const layout = await page.evaluate(() => {
    const brand = document.querySelector(".brand-lockup").getBoundingClientRect();
    const actions = document.querySelector(".topbar-actions").getBoundingClientRect();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      toolbarGap: actions.left - brand.right,
    };
  });
  expect(layout.scrollWidth).toBe(layout.viewportWidth);
  expect(layout.toolbarGap).toBeGreaterThanOrEqual(4);

  await page.getByRole("button", { name: "Details" }).click();
  await expect(page.locator(".detail-panel")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile views" })).toBeVisible();
});

test("opens a guided comparison and returns to a selected record", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /新手导览/ }).click();
  await expect(page.getByRole("heading", { name: "从三个问题开始" })).toBeVisible();

  await page.getByRole("button", { name: /铁陨石与橄榄陨铁/ }).click();
  await expect(page.getByRole("heading", { name: "并排看差异" })).toBeVisible();
  await expect(page.locator(".compare-record")).toHaveCount(2);
  await expect(page.locator(".compare-record")).toContainText(["霍巴", "阜康"]);

  await page.locator(".compare-record").filter({ hasText: "霍巴" }).getByRole("button", { name: /在图谱中查看/ }).click();
  await expect(page.locator("#detail-title")).toHaveText("霍巴");
});

test("supports shareable state and browser history", async ({ page }) => {
  await page.goto("/?meteorite=hoba&event=find");
  await expect(page.locator("#detail-title")).toHaveText("霍巴");
  await page.getByRole("button", { name: /阿勒泰 Aletai/ }).click();
  await expect(page).toHaveURL(/meteorite=aletai/);

  await page.goBack();
  await expect(page.locator("#detail-title")).toHaveText("霍巴");
  await expect(page).toHaveURL(/meteorite=hoba/);
});

test("switches the complete interface and Sericho record between languages", async ({ page }) => {
  await page.goto("/?meteorite=sericho&lang=en");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Meteorite Atlas" })).toBeVisible();
  await expect(page.locator("#detail-title")).toHaveText("Sericho");
  await expect(page.locator(".detail-summary")).toContainText("northeastern Kenya");
  await expect(page.locator(".meteorite-image img")).toHaveAttribute("src", /assets\/meteorites\/sericho\.jpg$/);
  await expect(page.getByRole("button", { name: "Toggle globe auto-rotation" })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("#detail-title")).toHaveText("塞里乔");
  await expect(page).not.toHaveURL(/lang=en/);
});

test("keeps the globe centered and stops auto-rotation on manual input", async ({ page }) => {
  await page.goto("/?meteorite=sericho");
  const globe = page.locator(".globe-canvas");
  await expect(globe).toHaveAttribute("data-controls-target-distance", "0.0000");

  const rotateButton = page.getByRole("button", { name: "切换地球自动旋转" });
  await rotateButton.click();
  await expect(rotateButton).toHaveAttribute("aria-pressed", "true");

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.36, { steps: 6 });
  await page.mouse.up();

  await expect(rotateButton).toHaveAttribute("aria-pressed", "false");
  await expect(globe).toHaveAttribute("data-controls-target-distance", "0.0000");
});

test("respects reduced motion and loads approved images locally", async ({ page }) => {
  const remoteRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("upload.wikimedia.org")) remoteRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?meteorite=fukang");

  await expect(page.getByRole("button", { name: "切换地球自动旋转" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".meteorite-image img")).toHaveAttribute("src", /assets\/meteorites\/fukang\.jpg$/);
  await expect(page.locator(".meteorite-image img")).toBeVisible();
  expect(remoteRequests).toEqual([]);
});
