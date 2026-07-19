import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const GLOBE_RADIUS = 2.12;
const EARTH_RADIUS_KM = 6371;
const ORIGIN = new Vector3();
const SURFACE_AXIS = new Vector3(0, 0, 1);
const publicAssetUrl = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const sceneCopy = {
  zh: {
    webgl: "当前浏览器无法启动 WebGL。仍可使用目录和详情浏览全部记录。",
    texture: "地球表面纹理未能加载。请检查静态资源路径后重试。",
    ariaLabel: "可旋转的全球陨石分布地图",
    boundaryWarning: "部分辅助地图资源未加载",
  },
  en: {
    webgl: "WebGL could not start in this browser. The catalog and record details remain available.",
    texture: "The Earth texture could not load. Check the static asset path and try again.",
    ariaLabel: "Rotatable global meteorite distribution map",
    boundaryWarning: "Some supporting map resources did not load",
  },
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;

const latLonToVector = ([longitude, latitude], radius = GLOBE_RADIUS) => {
  const latitudeRadians = toRadians(latitude);
  const longitudeRadians = toRadians(longitude);
  const latitudeCosine = Math.cos(latitudeRadians);

  return new Vector3(
    radius * latitudeCosine * Math.cos(longitudeRadians),
    radius * Math.sin(latitudeRadians),
    -radius * latitudeCosine * Math.sin(longitudeRadians),
  );
};

const destinationPoint = ([longitude, latitude], bearingDegrees, distanceKm) => {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearing = toRadians(bearingDegrees);
  const latitudeRadians = toRadians(latitude);
  const longitudeRadians = toRadians(longitude);

  const nextLatitude = Math.asin(
    Math.sin(latitudeRadians) * Math.cos(angularDistance) +
      Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const nextLongitude =
    longitudeRadians +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitudeRadians),
      Math.cos(angularDistance) -
        Math.sin(latitudeRadians) * Math.sin(nextLatitude),
    );

  return [
    ((toDegrees(nextLongitude) + 540) % 360) - 180,
    toDegrees(nextLatitude),
  ];
};

const makeLine = (points, color, dashed = false, opacity = 0.78) => {
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = dashed
    ? new LineDashedMaterial({
        color,
        transparent: true,
        opacity,
        dashSize: 0.06,
        gapSize: 0.04,
      })
    : new LineBasicMaterial({ color, transparent: true, opacity });
  const line = new Line(geometry, material);

  if (dashed) {
    line.computeLineDistances();
  }

  return line;
};

const makeGrid = () => {
  const grid = new Group();
  const gridColor = new Color("#6a98a3");

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points = [];
    for (let longitude = -180; longitude <= 180; longitude += 3) {
      points.push(latLonToVector([longitude, latitude], GLOBE_RADIUS + 0.012));
    }
    grid.add(makeLine(points, gridColor, false, 0.12));
  }

  for (let longitude = -150; longitude <= 180; longitude += 30) {
    const points = [];
    for (let latitude = -90; latitude <= 90; latitude += 3) {
      points.push(latLonToVector([longitude, latitude], GLOBE_RADIUS + 0.012));
    }
    grid.add(makeLine(points, gridColor, false, 0.12));
  }

  return grid;
};

const makeStarfield = () => {
  let seed = 7547;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const positions = [];
  for (let index = 0; index < 950; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 16 + random() * 17;
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return new Points(
    geometry,
    new PointsMaterial({
      color: "#dcecff",
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.66,
    }),
  );
};

const categoryColor = (category) =>
  category === "iron" ? new Color("#f1aa56") : new Color("#8de2ac");

const makeSurfaceDisc = ({
  normal,
  color,
  radius,
  offset,
  opacity = 1,
  innerRadius = 0,
  renderOrder = 4,
}) => {
  const geometry = innerRadius
    ? new RingGeometry(innerRadius, radius, 32)
    : new CircleGeometry(radius, 32);
  const material = new MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
  const disc = new Mesh(geometry, material);
  disc.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS + offset));
  disc.quaternion.setFromUnitVectors(SURFACE_AXIS, normal);
  disc.renderOrder = renderOrder;
  return disc;
};

const getGeometryRings = (geometry) => {
  if (geometry?.type === "Polygon") return geometry.coordinates;
  if (geometry?.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
};

const makeCountryBorders = (countryData) => {
  const positions = [];

  for (const feature of countryData.features ?? []) {
    for (const ring of getGeometryRings(feature.geometry)) {
      for (let index = 1; index < ring.length; index += 1) {
        const start = ring[index - 1];
        const end = ring[index];
        if (!start || !end || Math.abs(start[0] - end[0]) > 180) continue;

        const startVector = latLonToVector(start, GLOBE_RADIUS + 0.018);
        const endVector = latLonToVector(end, GLOBE_RADIUS + 0.018);
        positions.push(
          startVector.x,
          startVector.y,
          startVector.z,
          endVector.x,
          endVector.y,
          endVector.z,
        );
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const borders = new LineSegments(
    geometry,
    new LineBasicMaterial({
      color: "#9ed3da",
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  borders.renderOrder = 2;
  return borders;
};

const makeEarthMaterial = (dayMap) =>
  new MeshBasicMaterial({
    map: dayMap,
    color: "#ffffff",
    toneMapped: false,
  });

const makeAtmosphere = (widthSegments = 96, heightSegments = 64) =>
  new Mesh(
    new SphereGeometry(GLOBE_RADIUS * 1.038, widthSegments, heightSegments),
    new ShaderMaterial({
      side: BackSide,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - max(dot(vWorldNormal, viewDirection), 0.0), 3.0);
          gl_FragColor = vec4(vec3(0.12, 0.55, 0.82), rim * 0.38);
        }
      `,
    }),
  );

const orbitDirection = (fromPosition, toPosition, progress) => {
  const from = fromPosition.clone().normalize();
  const to = toPosition.clone().normalize();
  const dot = Math.max(-1, Math.min(1, from.dot(to)));

  if (dot > 0.9995) {
    return from.lerp(to, progress).normalize();
  }

  const axis = new Vector3().crossVectors(from, to);
  if (axis.lengthSq() < 0.000001) {
    axis.crossVectors(from, new Vector3(0, 1, 0));
    if (axis.lengthSq() < 0.000001) axis.crossVectors(from, new Vector3(1, 0, 0));
  }

  return from.applyAxisAngle(axis.normalize(), Math.acos(dot) * progress);
};

const makeCoverage = (meteorite) => {
  const coverage = meteorite.map?.coverage;
  const center = meteorite.location.coordinates;
  const color = categoryColor(meteorite.category);
  const group = new Group();

  if (!coverage || coverage.kind === "point") {
    return group;
  }

  const isLowConfidence = coverage.boundaryConfidence === "low";
  const addEllipse = () => {
    const major = coverage.dimensions?.majorAxisKm;
    const minor = coverage.dimensions?.minorAxisKm;
    if (!major || !minor) return;

    const points = [];
    for (let index = 0; index <= 96; index += 1) {
      const angle = (index / 96) * Math.PI * 2;
      const east = (major / 2) * Math.cos(angle);
      const north = (minor / 2) * Math.sin(angle);
      const distance = Math.hypot(east, north);
      const bearing = toDegrees(Math.atan2(east, north));
      points.push(
        latLonToVector(
          destinationPoint(center, bearing, distance),
          GLOBE_RADIUS + 0.035,
        ),
      );
    }
    group.add(makeLine(points, color, isLowConfidence, 0.86));
  };

  if (coverage.kind === "ellipse") {
    addEllipse();
  }

  if (coverage.kind === "circle") {
    const radiusKm = coverage.dimensions?.radiusKm;
    if (radiusKm) {
      const points = [];
      for (let bearing = 0; bearing <= 360; bearing += 4) {
        points.push(
          latLonToVector(
            destinationPoint(center, bearing, radiusKm),
            GLOBE_RADIUS + 0.035,
          ),
        );
      }
      group.add(makeLine(points, color, true, 0.82));
    }
  }

  if (coverage.kind === "line" && coverage.points?.length > 1) {
    group.add(
      makeLine(
        coverage.points.map((point) => latLonToVector(point, GLOBE_RADIUS + 0.035)),
        color,
        true,
        0.9,
      ),
    );
  }

  if (coverage.kind === "multi-point" && coverage.points?.length) {
    for (const point of coverage.points) {
      const normal = latLonToVector(point, 1).normalize();
      group.add(
        makeSurfaceDisc({
          normal,
          color,
          radius: 0.026,
          offset: 0.032,
          opacity: 0.84,
        }),
      );
    }
  }

  if (coverage.kind === "polygon" && coverage.points?.length > 2) {
    const polygonPoints = [...coverage.points, coverage.points[0]];
    group.add(
      makeLine(
        polygonPoints.map((point) => latLonToVector(point, GLOBE_RADIUS + 0.035)),
        color,
        isLowConfidence,
        0.84,
      ),
    );
  }

  return group;
};

const GlobeScene = forwardRef(function GlobeScene(
  {
    meteorites,
    visibleIds,
    selectedId,
    showCoverage,
    autoRotate,
    locale,
    onSelect,
    onInteraction,
  },
  ref,
) {
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const onInteractionRef = useRef(onInteraction);
  const localeRef = useRef(locale);
  const tooltipRef = useRef(null);
  const [sceneError, setSceneError] = useState("");
  const [boundaryFailed, setBoundaryFailed] = useState(false);
  onSelectRef.current = onSelect;
  onInteractionRef.current = onInteraction;
  localeRef.current = locale;
  const labels = sceneCopy[locale] ?? sceneCopy.zh;

  useImperativeHandle(ref, () => ({
    focusOn(meteorite) {
      const state = sceneStateRef.current;
      if (!state || !meteorite) return;

      const normal = latLonToVector(meteorite.location.coordinates, 1).normalize();
      state.focusTransition = {
        startedAt: performance.now(),
        fromPosition: state.camera.position.clone(),
        toPosition: normal.clone().multiplyScalar(6.85),
        fromTarget: state.controls.target.clone(),
        toTarget: ORIGIN.clone(),
      };
      state.requestRender();
    },
    resetView() {
      const state = sceneStateRef.current;
      if (!state) return;
      state.focusTransition = {
        startedAt: performance.now(),
        fromPosition: state.camera.position.clone(),
        toPosition: new Vector3(0, 0.32, 6.8),
        fromTarget: state.controls.target.clone(),
        toTarget: ORIGIN.clone(),
      };
      state.requestRender();
    },
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new Scene();
    scene.background = new Color("#03070d");

    const camera = new PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.32, 6.8);

    const isCompact = mount.clientWidth <= 820;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new WebGLRenderer({
        antialias: !isCompact,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      });
    } catch {
      setSceneError("webgl");
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.25 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 4.1;
    controls.maxDistance = 10.5;
    controls.autoRotateSpeed = 0.62;
    controls.target.set(0, 0, 0);

    const textureLoader = new TextureLoader();
    const earthTexture = textureLoader.load(
      publicAssetUrl("assets/earth-surface.jpg"),
      () => {
        mount.dataset.textureReady = "true";
        delete mount.dataset.pixelSample;
        sceneStateRef.current?.requestRender?.();
      },
      undefined,
      () => setSceneError("texture"),
    );
    const cloudTexture = textureLoader.load(
      publicAssetUrl("assets/earth-clouds.png"),
      undefined,
      undefined,
      () => setBoundaryFailed(true),
    );
    for (const texture of [earthTexture, cloudTexture]) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }

    const sphereWidth = isCompact ? 64 : 96;
    const sphereHeight = isCompact ? 48 : 64;
    const globe = new Mesh(
      new SphereGeometry(GLOBE_RADIUS, sphereWidth, sphereHeight),
      makeEarthMaterial(earthTexture),
    );
    const clouds = new Mesh(
      new SphereGeometry(GLOBE_RADIUS * 1.009, sphereWidth, sphereHeight),
      new MeshBasicMaterial({
        map: cloudTexture,
        color: "#d9f2ff",
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    );
    const countryBorders = new Group();
    scene.add(
      globe,
      clouds,
      makeAtmosphere(sphereWidth, sphereHeight),
      makeGrid(),
      makeStarfield(),
      countryBorders,
    );

    let didDispose = false;
    fetch(publicAssetUrl("assets/countries-110m.geojson"))
      .then((response) => {
        if (!response.ok) throw new Error(`Country borders failed: ${response.status}`);
        return response.json();
      })
      .then((countryData) => {
        if (!didDispose) countryBorders.add(makeCountryBorders(countryData));
      })
      .catch(() => setBoundaryFailed(true));

    const markerGroup = new Group();
    const coverageGroup = new Group();
    const markerMeshes = [];
    const markersById = new Map();
    const coverageById = new Map();

    for (const meteorite of meteorites) {
      const color = categoryColor(meteorite.category);
      const normal = latLonToVector(meteorite.location.coordinates, 1).normalize();
      const outline = makeSurfaceDisc({
        normal,
        color: "#071018",
        radius: 0.061,
        innerRadius: 0.046,
        offset: 0.031,
        opacity: 0.98,
        renderOrder: 5,
      });
      const marker = makeSurfaceDisc({
        normal,
        color,
        radius: 0.034,
        offset: 0.034,
        renderOrder: 6,
      });
      const hitTarget = makeSurfaceDisc({
        normal,
        color,
        radius: 0.09,
        offset: 0.037,
        opacity: 0,
        renderOrder: 3,
      });
      const halo = makeSurfaceDisc({
        normal,
        color,
        radius: 0.096,
        innerRadius: 0.072,
        offset: 0.04,
        opacity: 0.88,
        renderOrder: 7,
      });
      hitTarget.userData.meteorite = meteorite;
      halo.visible = false;

      markerGroup.add(outline, marker, hitTarget, halo);
      markerMeshes.push(hitTarget);
      markersById.set(meteorite.id, { marker, outline, hitTarget, halo });

      const coverage = makeCoverage(meteorite);
      coverageGroup.add(coverage);
      coverageById.set(meteorite.id, coverage);
    }

    scene.add(coverageGroup, markerGroup);

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const updatePointer = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(markerMeshes.filter((mesh) => mesh.visible), false);
    };
    const onPointerMove = (event) => {
      const hit = updatePointer(event)[0];
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (hit?.object.userData.meteorite) {
        const bounds = renderer.domElement.getBoundingClientRect();
        tooltip.hidden = false;
        const meteorite = hit.object.userData.meteorite;
        tooltip.textContent = localeRef.current === "en" ? meteorite.name.en : meteorite.name.zh;
        tooltip.style.left = `${event.clientX - bounds.left}px`;
        tooltip.style.top = `${event.clientY - bounds.top}px`;
      } else {
        tooltip.hidden = true;
      }
    };
    const onPointerLeave = () => {
      renderer.domElement.style.cursor = "grab";
      if (tooltipRef.current) tooltipRef.current.hidden = true;
    };
    const onClick = (event) => {
      const hit = updatePointer(event)[0];
      if (hit?.object.userData.meteorite) {
        onSelectRef.current(hit.object.userData.meteorite);
      }
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    const state = {
      scene,
      camera,
      renderer,
      controls,
      markersById,
      coverageById,
      markerGroup,
      coverageGroup,
      focusTransition: null,
      animationFrame: null,
      requestRender: null,
    };
    sceneStateRef.current = state;

    const requestRender = () => {
      if (state.animationFrame !== null || document.hidden) return;
      state.animationFrame = requestAnimationFrame(render);
    };

    const render = (time) => {
      state.animationFrame = null;
      if (state.focusTransition) {
        const progress = Math.min((time - state.focusTransition.startedAt) / 640, 1);
        const eased = 1 - (1 - progress) ** 3;
        const direction = orbitDirection(
          state.focusTransition.fromPosition,
          state.focusTransition.toPosition,
          eased,
        );
        const distance =
          state.focusTransition.fromPosition.length() +
          (state.focusTransition.toPosition.length() - state.focusTransition.fromPosition.length()) * eased;
        camera.position.copy(direction.multiplyScalar(distance));
        controls.target.lerpVectors(
          state.focusTransition.fromTarget,
          state.focusTransition.toTarget,
          eased,
        );
        if (progress === 1) state.focusTransition = null;
      }
      if (state.controls.autoRotate && !reducedMotion) {
        clouds.rotation.y = time * 0.000006;
      }
      for (const { halo } of state.markersById.values()) {
        if (!halo.visible) continue;
        if (state.controls.autoRotate && !reducedMotion) {
          const pulse = 1 + (Math.sin(time * 0.008) + 1) * 0.055;
          halo.scale.setScalar(pulse);
          halo.material.opacity = 0.58 + (Math.sin(time * 0.008) + 1) * 0.13;
        } else {
          halo.scale.setScalar(1);
          halo.material.opacity = 0.72;
        }
      }
      const controlsChanged = controls.update();
      mount.dataset.controlsTargetDistance = controls.target.length().toFixed(4);
      renderer.render(scene, camera);
      if (import.meta.env.DEV && !mount.dataset.pixelSample) {
        const context = renderer.getContext();
        const width = Math.min(renderer.domElement.width, 96);
        const height = Math.min(renderer.domElement.height, 96);
        const pixels = new Uint8Array(width * height * 4);
        context.readPixels(
          Math.floor((renderer.domElement.width - width) / 2),
          Math.floor((renderer.domElement.height - height) / 2),
          width,
          height,
          context.RGBA,
          context.UNSIGNED_BYTE,
          pixels,
        );
        let brightPixels = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 35) {
            brightPixels += 1;
          }
        }
        mount.dataset.pixelSample = String(brightPixels);
      }
      mount.dataset.ready = "true";
      if (state.focusTransition || state.controls.autoRotate || controlsChanged) {
        requestRender();
      }
    };
    state.requestRender = requestRender;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const onVisibilityChange = () => {
      if (document.hidden && state.animationFrame !== null) {
        cancelAnimationFrame(state.animationFrame);
        state.animationFrame = null;
      } else if (!document.hidden) {
        requestRender();
      }
    };
    controls.addEventListener("change", requestRender);
    const onControlStart = () => onInteractionRef.current?.();
    controls.addEventListener("start", onControlStart);
    document.addEventListener("visibilitychange", onVisibilityChange);
    requestRender();

    return () => {
      didDispose = true;
      if (state.animationFrame !== null) cancelAnimationFrame(state.animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      controls.removeEventListener("change", requestRender);
      controls.removeEventListener("start", onControlStart);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      controls.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
      mount.removeChild(renderer.domElement);
      sceneStateRef.current = null;
    };
  }, [meteorites]);

  useEffect(() => {
    const state = sceneStateRef.current;
    const meteorite = meteorites.find((record) => record.id === selectedId);
    if (!state || !meteorite) return;

    const normal = latLonToVector(meteorite.location.coordinates, 1).normalize();
    state.focusTransition = {
      startedAt: performance.now(),
      fromPosition: state.camera.position.clone(),
      toPosition: normal.clone().multiplyScalar(6.85),
      fromTarget: state.controls.target.clone(),
      toTarget: ORIGIN.clone(),
    };
    state.requestRender();
  }, [meteorites, selectedId]);

  useEffect(() => {
    const state = sceneStateRef.current;
    if (!state) return;

    for (const [id, markerState] of state.markersById) {
      const visible = visibleIds.has(id);
      const selected = id === selectedId;
      markerState.marker.visible = visible;
      markerState.outline.visible = visible;
      markerState.hitTarget.visible = visible;
      markerState.halo.visible = visible && selected;
      markerState.marker.scale.setScalar(selected ? 1.12 : 1);
      markerState.outline.scale.setScalar(selected ? 1.12 : 1);
    }

    for (const [id, coverage] of state.coverageById) {
      coverage.visible = showCoverage && visibleIds.has(id);
    }
    state.requestRender();
  }, [selectedId, showCoverage, visibleIds]);

  useEffect(() => {
    const state = sceneStateRef.current;
    if (state) {
      state.controls.autoRotate = autoRotate;
      state.requestRender();
    }
  }, [autoRotate]);

  if (sceneError) {
    return <div className="globe-error" role="status"><span>{labels[sceneError]}</span></div>;
  }

  return (
    <div className="globe-canvas" ref={mountRef} role="img" aria-label={labels.ariaLabel}>
      <span className="marker-tooltip" ref={tooltipRef} hidden />
      {boundaryFailed && <span className="boundary-warning" role="status">{labels.boundaryWarning}</span>}
    </div>
  );
});

export default GlobeScene;
