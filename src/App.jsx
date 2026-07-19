import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Columns2,
  ExternalLink,
  FileText,
  Globe2,
  ImageOff,
  Layers3,
  List,
  LocateFixed,
  Map as MapIcon,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import meteoriteData from "../data/meteorites.json";
import wikimediaData from "../data/wikimedia-images.json";
import {
  categoryOptions,
  classificationZh,
  coverageLabel,
  eventOptions,
  evidenceLabel,
  glossary,
  learningPaths,
  observationNote,
  queryText,
  sortOptions,
} from "./content";

const GlobeScene = lazy(() => import("./GlobeScene"));
const meteorites = meteoriteData.meteorites;
const meteoriteById = new Map(meteorites.map((meteorite) => [meteorite.id, meteorite]));
const approvedImages = wikimediaData.images.filter(
  (image) => image.reviewStatus === "approved",
);
const imageById = new Map(approvedImages.map((image) => [image.id, image]));
const validCategories = new Set(categoryOptions.map((option) => option.id));
const validEvents = new Set(eventOptions.map((option) => option.id));

const getUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("meteorite");
  const category = params.get("category");
  const eventKind = params.get("event");

  return {
    selectedId: meteoriteById.has(selectedId) ? selectedId : "fukang",
    category: validCategories.has(category) ? category : "all",
    eventKind: validEvents.has(eventKind) ? eventKind : "all",
    query: params.get("q") ?? "",
  };
};

const coordinateText = ([longitude, latitude]) =>
  `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "N" : "S"}  ${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "E" : "W"}`;

const useDialogFocus = () => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (!dialog) return undefined;
    dialog.focus();

    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", trapFocus);
    return () => {
      dialog.removeEventListener("keydown", trapFocus);
      previousFocus?.focus?.();
    };
  }, []);

  return dialogRef;
};

function MeteoriteImage({ meteorite, compact = false }) {
  const image = imageById.get(meteorite.id);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [meteorite.id]);

  if (!image || failed) {
    return (
      <div className={`image-placeholder ${meteorite.category} ${compact ? "compact" : ""}`}>
        <ImageOff size={25} strokeWidth={1.5} />
        <span>{failed ? "图像加载失败" : "经核验图像待补"}</span>
      </div>
    );
  }

  return (
    <figure className={`meteorite-image ${compact ? "compact" : ""}`}>
      <img
        src={`${import.meta.env.BASE_URL}${image.localPath.replace(/^\//, "")}`}
        alt={`${meteorite.name.zh}陨石标本`}
        loading="eager"
        decoding="async"
        onError={() => setFailed(true)}
      />
      {!compact && (
        <figcaption>
          <a href={image.filePageUrl} target="_blank" rel="noreferrer">
            Wikimedia Commons <ExternalLink size={12} />
          </a>
          <span>{image.license}</span>
        </figcaption>
      )}
    </figure>
  );
}

function DetailPanel({ meteorite, onFocus, onCompare, onShare, shareStatus }) {
  const image = imageById.get(meteorite.id);
  const coverage = meteorite.map.coverage;

  return (
    <aside className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-header">
        <div>
          <p className="eyebrow">
            {meteorite.category === "pallasite"
              ? "橄榄陨铁 · 石铁陨石的一类"
              : meteorite.categoryZh}
          </p>
          <h2 id="detail-title">{meteorite.name.zh}</h2>
          <p className="english-name">{meteorite.name.en}</p>
        </div>
        <div className="detail-actions">
          <button className="icon-button" type="button" onClick={onShare} aria-label="分享当前陨石" data-tooltip="分享">
            {shareStatus ? <Check size={18} /> : <Share2 size={18} />}
          </button>
          <button className="icon-button" type="button" onClick={onFocus} aria-label={`定位 ${meteorite.name.zh}`} data-tooltip="定位到地图">
            <LocateFixed size={18} />
          </button>
        </div>
      </div>

      <MeteoriteImage meteorite={meteorite} />

      <p className="detail-summary">
        {meteorite.summaryZh}
        <span className="inline-citations" aria-label="本段来源">
          {meteorite.sources.map((source, index) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" aria-label={`来源 ${index + 1}`}>
              [{index + 1}]
            </a>
          ))}
        </span>
      </p>

      <dl className="facts-grid">
        <div className="fact-wide">
          <dt>科学分类</dt>
          <dd>
            <strong>{classificationZh(meteorite.classification)}</strong>
            <small>{meteorite.classification}</small>
          </dd>
        </div>
        <div>
          <dt>记录方式</dt>
          <dd>{meteorite.event.kind === "observed_fall" ? "目击坠落" : "后来发现"}</dd>
        </div>
        <div>
          <dt>时间记录</dt>
          <dd>{meteorite.event.labelZh}</dd>
        </div>
        <div>
          <dt>地点</dt>
          <dd>{meteorite.location.regionZh}</dd>
        </div>
        <div>
          <dt>坐标角色</dt>
          <dd>{meteorite.location.coordinateRole}</dd>
        </div>
        <div>
          <dt>参考坐标</dt>
          <dd>{coordinateText(meteorite.location.coordinates)}</dd>
        </div>
        <div>
          <dt>地图证据</dt>
          <dd>{evidenceLabel(coverage.confidence)}</dd>
        </div>
      </dl>

      <section className="observation-note" aria-labelledby="observation-title">
        <Sparkles size={16} />
        <div>
          <h3 id="observation-title">看图时留意</h3>
          <p>{observationNote(meteorite)}</p>
        </div>
      </section>

      <section className="coverage-note" aria-labelledby="coverage-title">
        <Layers3 size={16} />
        <div>
          <h3 id="coverage-title">{coverageLabel(coverage)}</h3>
          <p>{coverage.descriptionZh}</p>
        </div>
      </section>

      <button className="compare-button" type="button" onClick={() => onCompare(meteorite)}>
        <Columns2 size={16} />
        与另一颗陨石对比
      </button>

      {image && (
        <p className="image-credit">
          图片：{image.author}，
          {image.licenseUrl ? (
            <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a>
          ) : image.license}
          <span> · 已人工核验主题</span>
        </p>
      )}

      <div className="source-list" aria-label="资料来源">
        {meteorite.sources.map((source, index) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span className="source-index">{index + 1}</span>
            <span>{source.title}</span>
            <ExternalLink size={13} />
          </a>
        ))}
      </div>
      <p className="record-provenance">数据集更新于 {meteoriteData.updatedAt} · 正式名称与坐标优先采用 MBDB</p>
    </aside>
  );
}

function LearningPanel({ onClose, onStartPath }) {
  const dialogRef = useDialogFocus();
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="learning-dialog" role="dialog" aria-modal="true" aria-labelledby="learning-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">BEGINNER GUIDE</p>
            <h2 id="learning-title">从三个问题开始</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭新手导览"><X size={19} /></button>
        </header>
        <p className="dialog-intro">这是一份精选学习图谱，不是完整陨石数据库。先建立分类、记录方式和地图证据三个概念，再浏览具体名称。</p>
        <div className="learning-paths">
          {learningPaths.map((path, index) => (
            <button key={path.id} type="button" className="learning-path" onClick={() => onStartPath(path)}>
              <span className="path-index">0{index + 1}</span>
              <span>
                <small>{path.kicker}</small>
                <strong>{path.title}</strong>
                <p>{path.body}</p>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <section className="glossary-section" aria-labelledby="glossary-title">
          <h3 id="glossary-title">常用术语</h3>
          <dl className="glossary-grid">
            {glossary.map((entry) => (
              <div key={entry.term}>
                <dt>{entry.term}</dt>
                <dd>{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>
    </div>
  );
}

function ComparePanel({ records, onClose, onSelect }) {
  const dialogRef = useDialogFocus();
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">COMPARE</p>
            <h2 id="compare-title">并排看差异</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭对比"><X size={19} /></button>
        </header>
        <div className="compare-grid">
          {records.map((meteorite) => (
            <article key={meteorite.id} className={`compare-record ${meteorite.category}`}>
              <MeteoriteImage meteorite={meteorite} compact />
              <p className="eyebrow">{meteorite.category === "pallasite" ? "橄榄陨铁" : "铁陨石"}</p>
              <h3>{meteorite.name.zh}</h3>
              <p className="english-name">{meteorite.name.en}</p>
              <dl>
                <div><dt>分类</dt><dd>{classificationZh(meteorite.classification)}</dd></div>
                <div><dt>记录</dt><dd>{meteorite.event.kind === "observed_fall" ? "目击坠落" : "后来发现"}</dd></div>
                <div><dt>地图</dt><dd>{evidenceLabel(meteorite.map.coverage.confidence)}</dd></div>
              </dl>
              <p>{meteorite.summaryZh}</p>
              <button type="button" onClick={() => onSelect(meteorite)}>在图谱中查看 <ChevronRight size={15} /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const initialUrlState = useRef(getUrlState()).current;
  const globeRef = useRef(null);
  const [category, setCategory] = useState(initialUrlState.category);
  const [eventKind, setEventKind] = useState(initialUrlState.eventKind);
  const [query, setQuery] = useState(initialUrlState.query);
  const [sort, setSort] = useState("curated");
  const [showCoverage, setShowCoverage] = useState(false);
  const [autoRotate, setAutoRotate] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [selectedId, setSelectedId] = useState(initialUrlState.selectedId);
  const [mobilePanel, setMobilePanel] = useState("map");
  const [guideOpen, setGuideOpen] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const filteredMeteorites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const records = meteorites.filter((meteorite) => {
      const matchesCategory = category === "all" || meteorite.category === category;
      const matchesEvent = eventKind === "all" || meteorite.event.kind === eventKind;
      const matchesQuery = !normalizedQuery || queryText(meteorite).includes(normalizedQuery);
      return matchesCategory && matchesEvent && matchesQuery;
    });

    if (sort === "year-desc") return records.sort((a, b) => (b.event.year ?? -Infinity) - (a.event.year ?? -Infinity));
    if (sort === "year-asc") return records.sort((a, b) => (a.event.year ?? Infinity) - (b.event.year ?? Infinity));
    if (sort === "name") return records.sort((a, b) => a.name.zh.localeCompare(b.name.zh, "zh-CN"));
    return records;
  }, [category, eventKind, query, sort]);

  const visibleIds = useMemo(
    () => new Set(filteredMeteorites.map((meteorite) => meteorite.id)),
    [filteredMeteorites],
  );
  const selectedMeteorite = meteoriteById.get(selectedId) ?? meteorites[0];
  const compareRecords = compareIds.map((id) => meteoriteById.get(id)).filter(Boolean);
  const hasFilters = category !== "all" || eventKind !== "all" || Boolean(query);

  useEffect(() => {
    if (filteredMeteorites.length && !visibleIds.has(selectedId)) {
      setSelectedId(filteredMeteorites[0].id);
    }
  }, [filteredMeteorites, selectedId, visibleIds]);

  useEffect(() => {
    globeRef.current?.focusOn(selectedMeteorite);
  }, [selectedMeteorite]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("meteorite", selectedId);
    if (category !== "all") params.set("category", category);
    if (eventKind !== "all") params.set("event", eventKind);
    if (query) params.set("q", query);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  }, [category, eventKind, query, selectedId]);

  useEffect(() => {
    const restoreUrlState = () => {
      const nextState = getUrlState();
      setCategory(nextState.category);
      setEventKind(nextState.eventKind);
      setQuery(nextState.query);
      setSelectedId(nextState.selectedId);
    };
    window.addEventListener("popstate", restoreUrlState);
    return () => window.removeEventListener("popstate", restoreUrlState);
  }, []);

  useEffect(() => {
    const closeDialogs = (event) => {
      if (event.key === "Escape") {
        setGuideOpen(false);
        setCompareOpen(false);
      }
    };
    window.addEventListener("keydown", closeDialogs);
    return () => window.removeEventListener("keydown", closeDialogs);
  }, []);

  const selectMeteorite = (meteorite) => {
    if (meteorite.id !== selectedId) {
      window.history.pushState(null, "", window.location.href);
    }
    setAutoRotate(false);
    setSelectedId(meteorite.id);
    setMobilePanel("detail");
    globeRef.current?.focusOn(meteorite);
  };

  const focusSelected = () => {
    setAutoRotate(false);
    globeRef.current?.focusOn(selectedMeteorite);
  };

  const resetFilters = () => {
    setCategory("all");
    setEventKind("all");
    setQuery("");
  };

  const addToCompare = (meteorite) => {
    if (compareIds.includes(meteorite.id)) {
      if (compareIds.length === 2) setCompareOpen(true);
      return;
    }
    const nextIds = compareIds.length < 2
      ? [...compareIds, meteorite.id]
      : [compareIds[1], meteorite.id];
    setCompareIds(nextIds);
    if (nextIds.length === 2) setCompareOpen(true);
  };

  const startLearningPath = (path) => {
    setCompareIds(path.meteoriteIds);
    setGuideOpen(false);
    setCompareOpen(true);
  };

  const shareSelected = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus(true);
      window.setTimeout(() => setShareStatus(false), 1600);
    } catch {
      setShareStatus(false);
    }
  };

  return (
    <main className="app-shell" data-mobile-panel={mobilePanel}>
      <div className="globe-stage">
        <Suspense fallback={<div className="globe-loading"><Globe2 size={28} /><span>正在加载地球仪</span></div>}>
          <GlobeScene
            ref={globeRef}
            meteorites={meteorites}
            visibleIds={visibleIds}
            selectedId={selectedMeteorite.id}
            showCoverage={showCoverage}
            autoRotate={autoRotate}
            onSelect={selectMeteorite}
          />
        </Suspense>
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <Globe2 size={22} strokeWidth={1.6} />
          <span>
            <small>METEORITE ATLAS</small>
            <h1>陨石图谱</h1>
          </span>
        </div>

        <div className="topbar-actions">
          <button className="guide-button" type="button" onClick={() => setGuideOpen(true)}>
            <BookOpen size={17} />
            <span>新手导览</span>
          </button>
          <label className="toggle-control">
            <span>散布区</span>
            <input type="checkbox" checked={showCoverage} onChange={(event) => setShowCoverage(event.target.checked)} />
            <span className="toggle-track" aria-hidden="true" />
          </label>
          <button className={`icon-button ${autoRotate ? "active" : ""}`} type="button" onClick={() => setAutoRotate((current) => !current)} aria-label="切换地球自动旋转" aria-pressed={autoRotate} data-tooltip="自动旋转">
            <RotateCcw size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => globeRef.current?.resetView()} aria-label="重置地图视角" data-tooltip="重置视角">
            <LocateFixed size={18} />
          </button>
        </div>
      </header>

      <section className="catalog-panel" aria-label="陨石目录">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">CURATED COLLECTION</p>
            <h2>全球精选记录</h2>
          </div>
          <span>{filteredMeteorites.length} / {meteorites.length}</span>
        </div>

        <div className="segmented-control" aria-label="陨石类别筛选">
          {categoryOptions.map((option) => (
            <button key={option.id} type="button" className={category === option.id ? "active" : ""} onClick={() => setCategory(option.id)} aria-pressed={category === option.id}>
              {option.label}
            </button>
          ))}
        </div>

        <label className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、地区、术语或故事" aria-label="搜索陨石" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜索"><X size={15} /></button>}
        </label>

        <div className="filter-row">
          <label>
            <span>记录方式</span>
            <select value={eventKind} onChange={(event) => setEventKind(event.target.value)}>
              {eventOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>排序</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="legend" aria-label="分类图例">
          <span><i className="iron-dot" />铁陨石</span>
          <span><i className="pallasite-dot" />橄榄陨铁</span>
          {hasFilters && <button type="button" onClick={resetFilters}>重置筛选</button>}
        </div>

        <div className="record-list">
          {filteredMeteorites.map((meteorite) => (
            <button key={meteorite.id} className={`record-row ${meteorite.id === selectedMeteorite.id ? "selected" : ""}`} type="button" onClick={() => selectMeteorite(meteorite)} aria-pressed={meteorite.id === selectedMeteorite.id}>
              <i className={meteorite.category === "iron" ? "iron-dot" : "pallasite-dot"} />
              <span className="record-main">
                <strong>{meteorite.name.zh}</strong>
                <small>{meteorite.name.en}</small>
              </span>
              <span className="record-meta">
                <small>{meteorite.event.kind === "observed_fall" ? "坠落" : "发现"}</small>
                {meteorite.location.countryZh}
              </span>
            </button>
          ))}
          {!filteredMeteorites.length && (
            <div className="empty-state">
              <p>没有符合条件的记录</p>
              <button type="button" onClick={resetFilters}>清除全部筛选</button>
            </div>
          )}
        </div>
      </section>

      <div className="scene-caption" aria-hidden="true">
        <Sparkles size={15} />
        <span>{showCoverage ? "范围线表示证据，不等于精确边界" : "当前仅显示代表点"}</span>
      </div>

      <DetailPanel meteorite={selectedMeteorite} onFocus={focusSelected} onCompare={addToCompare} onShare={shareSelected} shareStatus={shareStatus} />

      {compareIds.length === 1 && (
        <button className="compare-tray" type="button" onClick={() => setMobilePanel("catalog")}>
          <Columns2 size={17} />
          已选择 {meteoriteById.get(compareIds[0])?.name.zh}，再选一颗进行对比
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="mobile-nav" aria-label="移动端视图">
        <button type="button" className={mobilePanel === "map" ? "active" : ""} onClick={() => setMobilePanel("map")} aria-pressed={mobilePanel === "map"}><MapIcon size={18} /><span>地图</span></button>
        <button type="button" className={mobilePanel === "catalog" ? "active" : ""} onClick={() => setMobilePanel("catalog")} aria-pressed={mobilePanel === "catalog"}><List size={18} /><span>目录</span></button>
        <button type="button" className={mobilePanel === "detail" ? "active" : ""} onClick={() => setMobilePanel("detail")} aria-pressed={mobilePanel === "detail"}><FileText size={18} /><span>详情</span></button>
      </nav>

      <p className="sr-only" aria-live="polite">已选择 {selectedMeteorite.name.zh}</p>

      {guideOpen && <LearningPanel onClose={() => setGuideOpen(false)} onStartPath={startLearningPath} />}
      {compareOpen && compareRecords.length === 2 && <ComparePanel records={compareRecords} onClose={() => setCompareOpen(false)} onSelect={(meteorite) => { setCompareOpen(false); selectMeteorite(meteorite); }} />}
    </main>
  );
}

export default App;
