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
  Languages,
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
  VALID_CATEGORY_IDS,
  VALID_EVENT_IDS,
  classificationLabel,
  contentFor,
  coverageLabel,
  evidenceLabel,
  observationNote,
  queryText,
} from "./content";
import {
  getInitialLocale,
  localizeMeteorite,
  LOCALES,
  uiFor,
} from "./i18n";

const GlobeScene = lazy(() => import("./GlobeScene"));
const rawMeteorites = meteoriteData.meteorites;
const rawMeteoriteById = new Map(rawMeteorites.map((meteorite) => [meteorite.id, meteorite]));
const approvedImages = wikimediaData.images.filter(
  (image) => image.reviewStatus === "approved",
);
const imageById = new Map(approvedImages.map((image) => [image.id, image]));
const getUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("meteorite");
  const category = params.get("category");
  const eventKind = params.get("event");

  return {
    selectedId: rawMeteoriteById.has(selectedId) ? selectedId : "fukang",
    category: VALID_CATEGORY_IDS.has(category) ? category : "all",
    eventKind: VALID_EVENT_IDS.has(eventKind) ? eventKind : "all",
    query: params.get("q") ?? "",
    locale: getInitialLocale(),
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

function MeteoriteImage({ meteorite, t, compact = false }) {
  const image = imageById.get(meteorite.id);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [meteorite.id]);

  if (!image || failed) {
    return (
      <div className={`image-placeholder ${meteorite.category} ${compact ? "compact" : ""}`}>
        <ImageOff size={25} strokeWidth={1.5} />
        <span>{failed ? t.imageLoadFailed : t.imagePending}</span>
      </div>
    );
  }

  return (
    <figure className={`meteorite-image ${compact ? "compact" : ""}`}>
      <img
        src={`${import.meta.env.BASE_URL}${image.localPath.replace(/^\//, "")}`}
        alt={t.imageAlt(meteorite.displayName)}
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

function DetailPanel({ meteorite, locale, t, onFocus, onCompare, onShare, shareStatus }) {
  const image = imageById.get(meteorite.id);
  const coverage = meteorite.map.coverage;

  return (
    <aside className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-header">
        <div>
          <p className="eyebrow">
            {meteorite.category === "pallasite"
              ? t.pallasiteLong
              : t.ironMeteorite}
          </p>
          <h2 id="detail-title">{meteorite.displayName}</h2>
          <p className="english-name">{meteorite.secondaryName}</p>
        </div>
        <div className="detail-actions">
          <button className="icon-button" type="button" onClick={onShare} aria-label={t.shareCurrent} data-tooltip={t.share}>
            {shareStatus ? <Check size={18} /> : <Share2 size={18} />}
          </button>
          <button className="icon-button" type="button" onClick={onFocus} aria-label={t.locate(meteorite.displayName)} data-tooltip={t.locateMap}>
            <LocateFixed size={18} />
          </button>
        </div>
      </div>

      <MeteoriteImage meteorite={meteorite} t={t} />

      <p className="detail-summary">
        {meteorite.displaySummary}
        <span className="inline-citations" aria-label={t.paragraphSources}>
          {meteorite.sources.map((source, index) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" aria-label={t.source(index + 1)}>
              [{index + 1}]
            </a>
          ))}
        </span>
      </p>

      <dl className="facts-grid">
        <div className="fact-wide">
          <dt>{t.scientificClass}</dt>
          <dd>
            <strong>{classificationLabel(meteorite.classification, locale)}</strong>
            {locale !== "en" && <small>{meteorite.classification}</small>}
          </dd>
        </div>
        <div>
          <dt>{t.eventType}</dt>
          <dd>{meteorite.event.kind === "observed_fall" ? t.observedFall : t.laterFind}</dd>
        </div>
        <div>
          <dt>{t.eventTime}</dt>
          <dd>{meteorite.displayEventLabel}</dd>
        </div>
        <div>
          <dt>{t.location}</dt>
          <dd>{meteorite.displayRegion}</dd>
        </div>
        <div>
          <dt>{t.coordinateRole}</dt>
          <dd>{meteorite.displayCoordinateRole}</dd>
        </div>
        <div>
          <dt>{t.referenceCoordinates}</dt>
          <dd>{coordinateText(meteorite.location.coordinates)}</dd>
        </div>
        <div>
          <dt>{t.mapEvidence}</dt>
          <dd>{evidenceLabel(coverage.confidence, locale)}</dd>
        </div>
      </dl>

      <section className="observation-note" aria-labelledby="observation-title">
        <Sparkles size={16} />
        <div>
          <h3 id="observation-title">{t.observationTitle}</h3>
          <p>{observationNote(meteorite, locale)}</p>
        </div>
      </section>

      <section className="coverage-note" aria-labelledby="coverage-title">
        <Layers3 size={16} />
        <div>
          <h3 id="coverage-title">{coverageLabel(coverage, locale)}</h3>
          <p>{meteorite.displayCoverageDescription}</p>
        </div>
      </section>

      <button className="compare-button" type="button" onClick={() => onCompare(meteorite)}>
        <Columns2 size={16} />
        {t.compareAnother}
      </button>

      {image && (
        <p className="image-credit">
          {t.imageCredit}: {image.author},{" "}
          {image.licenseUrl ? (
            <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a>
          ) : image.license}
          <span> · {t.imageReviewed}</span>
        </p>
      )}

      <div className="source-list" aria-label={t.sources}>
        {meteorite.sources.map((source, index) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span className="source-index">{index + 1}</span>
            <span>{source.title}</span>
            <ExternalLink size={13} />
          </a>
        ))}
      </div>
      <p className="record-provenance">{t.provenance(meteoriteData.updatedAt)}</p>
    </aside>
  );
}

function LearningPanel({ t, learningPaths, glossary, onClose, onStartPath }) {
  const dialogRef = useDialogFocus();
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="learning-dialog" role="dialog" aria-modal="true" aria-labelledby="learning-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">{t.guideEyebrow}</p>
            <h2 id="learning-title">{t.guideTitle}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t.closeGuide}><X size={19} /></button>
        </header>
        <p className="dialog-intro">{t.guideIntro}</p>
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
          <h3 id="glossary-title">{t.glossary}</h3>
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

function ComparePanel({ records, locale, t, onClose, onSelect }) {
  const dialogRef = useDialogFocus();
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">{t.compareEyebrow}</p>
            <h2 id="compare-title">{t.compareTitle}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t.closeCompare}><X size={19} /></button>
        </header>
        <div className="compare-grid">
          {records.map((meteorite) => (
            <article key={meteorite.id} className={`compare-record ${meteorite.category}`}>
              <MeteoriteImage meteorite={meteorite} t={t} compact />
              <p className="eyebrow">{meteorite.category === "pallasite" ? t.pallasite : t.ironMeteorite}</p>
              <h3>{meteorite.displayName}</h3>
              <p className="english-name">{meteorite.secondaryName}</p>
              <dl>
                <div><dt>{t.classification}</dt><dd>{classificationLabel(meteorite.classification, locale)}</dd></div>
                <div><dt>{t.record}</dt><dd>{meteorite.event.kind === "observed_fall" ? t.observedFall : t.laterFind}</dd></div>
                <div><dt>{t.map}</dt><dd>{evidenceLabel(meteorite.map.coverage.confidence, locale)}</dd></div>
              </dl>
              <p>{meteorite.displaySummary}</p>
              <button type="button" onClick={() => onSelect(meteorite)}>{t.viewInAtlas} <ChevronRight size={15} /></button>
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
  const [locale, setLocale] = useState(initialUrlState.locale);
  const [category, setCategory] = useState(initialUrlState.category);
  const [eventKind, setEventKind] = useState(initialUrlState.eventKind);
  const [query, setQuery] = useState(initialUrlState.query);
  const [sort, setSort] = useState("curated");
  const [showCoverage, setShowCoverage] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedId, setSelectedId] = useState(initialUrlState.selectedId);
  const [mobilePanel, setMobilePanel] = useState("map");
  const [guideOpen, setGuideOpen] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  const t = uiFor(locale);
  const { categoryOptions, eventOptions, sortOptions, learningPaths, glossary } = contentFor(locale);
  const meteorites = useMemo(
    () => rawMeteorites.map((meteorite) => localizeMeteorite(meteorite, locale)),
    [locale],
  );
  const meteoriteById = useMemo(
    () => new Map(meteorites.map((meteorite) => [meteorite.id, meteorite])),
    [meteorites],
  );

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
    if (sort === "name") {
      return records.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, locale === "en" ? "en" : "zh-CN"));
    }
    return records;
  }, [category, eventKind, locale, meteorites, query, sort]);

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
  }, [selectedId]);

  useEffect(() => {
    document.documentElement.lang = LOCALES[locale];
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.pageDescription);
    window.localStorage.setItem("meteorite-atlas-locale", locale);
  }, [locale, t.pageDescription, t.pageTitle]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("meteorite", selectedId);
    if (category !== "all") params.set("category", category);
    if (eventKind !== "all") params.set("event", eventKind);
    if (query) params.set("q", query);
    if (locale === "en") params.set("lang", "en");
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  }, [category, eventKind, locale, query, selectedId]);

  useEffect(() => {
    const restoreUrlState = () => {
      const nextState = getUrlState();
      setCategory(nextState.category);
      setEventKind(nextState.eventKind);
      setQuery(nextState.query);
      setSelectedId(nextState.selectedId);
      setLocale(nextState.locale);
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

  const toggleLocale = () => {
    setLocale((current) => current === "zh" ? "en" : "zh");
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
    <main className="app-shell" data-mobile-panel={mobilePanel} data-locale={locale}>
      <div className="globe-stage">
        <Suspense fallback={<div className="globe-loading"><Globe2 size={28} /><span>{t.globeLoading}</span></div>}>
          <GlobeScene
            ref={globeRef}
            meteorites={rawMeteorites}
            visibleIds={visibleIds}
            selectedId={selectedMeteorite.id}
            showCoverage={showCoverage}
            autoRotate={autoRotate}
            locale={locale}
            onSelect={selectMeteorite}
            onInteraction={() => setAutoRotate(false)}
          />
        </Suspense>
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <Globe2 size={22} strokeWidth={1.6} />
          <span>
            <small>METEORITE ATLAS</small>
            <h1>{t.brandName}</h1>
          </span>
        </div>

        <div className="topbar-actions">
          <button className="guide-button" type="button" onClick={() => setGuideOpen(true)}>
            <BookOpen size={17} />
            <span>{t.guide}</span>
          </button>
          <label className="toggle-control">
            <span>{t.coverageToggle}</span>
            <input type="checkbox" checked={showCoverage} onChange={(event) => setShowCoverage(event.target.checked)} />
            <span className="toggle-track" aria-hidden="true" />
          </label>
          <button className={`icon-button ${autoRotate ? "active" : ""}`} type="button" onClick={() => setAutoRotate((current) => !current)} aria-label={t.autoRotateLabel} aria-pressed={autoRotate} data-tooltip={t.autoRotate}>
            <RotateCcw size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => globeRef.current?.resetView()} aria-label={t.resetView} data-tooltip={t.resetView}>
            <LocateFixed size={18} />
          </button>
          <button className="language-button" type="button" onClick={toggleLocale} aria-label={t.languageSwitch} data-tooltip={t.languageSwitch}>
            <Languages size={16} />
            <span>{t.languageShort}</span>
          </button>
        </div>
      </header>

      <section className="catalog-panel" aria-label={t.catalogLabel}>
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">{t.curatedCollection}</p>
            <h2>{t.collectionTitle}</h2>
          </div>
          <span>{filteredMeteorites.length} / {meteorites.length}</span>
        </div>

        <div className="segmented-control" aria-label={t.categoryFilter}>
          {categoryOptions.map((option) => (
            <button key={option.id} type="button" className={category === option.id ? "active" : ""} onClick={() => setCategory(option.id)} aria-pressed={category === option.id}>
              {option.label}
            </button>
          ))}
        </div>

        <label className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchLabel} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={t.clearSearch}><X size={15} /></button>}
        </label>

        <div className="filter-row">
          <label>
            <span>{t.recordType}</span>
            <select value={eventKind} onChange={(event) => setEventKind(event.target.value)}>
              {eventOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>{t.sort}</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="legend" aria-label={t.legend}>
          <span><i className="iron-dot" />{t.ironMeteorite}</span>
          <span><i className="pallasite-dot" />{t.pallasite}</span>
          {hasFilters && <button type="button" onClick={resetFilters}>{t.resetFilters}</button>}
        </div>

        <div className="record-list">
          {filteredMeteorites.map((meteorite) => (
            <button key={meteorite.id} className={`record-row ${meteorite.id === selectedMeteorite.id ? "selected" : ""}`} type="button" onClick={() => selectMeteorite(meteorite)} aria-pressed={meteorite.id === selectedMeteorite.id}>
              <i className={meteorite.category === "iron" ? "iron-dot" : "pallasite-dot"} />
              <span className="record-main">
                <strong>{meteorite.displayName}</strong>
                <small>{meteorite.secondaryName}</small>
              </span>
              <span className="record-meta">
                <small>{meteorite.event.kind === "observed_fall" ? t.fallShort : t.findShort}</small>
                {meteorite.displayCountry}
              </span>
            </button>
          ))}
          {!filteredMeteorites.length && (
            <div className="empty-state">
              <p>{t.noResults}</p>
              <button type="button" onClick={resetFilters}>{t.clearAllFilters}</button>
            </div>
          )}
        </div>
      </section>

      <div className="scene-caption" aria-hidden="true">
        <Sparkles size={15} />
        <span>{showCoverage ? t.coverageCaption : t.pointCaption}</span>
      </div>

      <DetailPanel meteorite={selectedMeteorite} locale={locale} t={t} onFocus={focusSelected} onCompare={addToCompare} onShare={shareSelected} shareStatus={shareStatus} />

      {compareIds.length === 1 && (
        <button className="compare-tray" type="button" onClick={() => setMobilePanel("catalog")}>
          <Columns2 size={17} />
          {t.compareTray(meteoriteById.get(compareIds[0])?.displayName)}
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="mobile-nav" aria-label={t.mobileNavigation}>
        <button type="button" className={mobilePanel === "map" ? "active" : ""} onClick={() => setMobilePanel("map")} aria-pressed={mobilePanel === "map"}><MapIcon size={18} /><span>{t.map}</span></button>
        <button type="button" className={mobilePanel === "catalog" ? "active" : ""} onClick={() => setMobilePanel("catalog")} aria-pressed={mobilePanel === "catalog"}><List size={18} /><span>{t.catalog}</span></button>
        <button type="button" className={mobilePanel === "detail" ? "active" : ""} onClick={() => setMobilePanel("detail")} aria-pressed={mobilePanel === "detail"}><FileText size={18} /><span>{t.details}</span></button>
      </nav>

      <p className="sr-only" aria-live="polite">{t.selectedAnnouncement(selectedMeteorite.displayName)}</p>

      {guideOpen && <LearningPanel t={t} learningPaths={learningPaths} glossary={glossary} onClose={() => setGuideOpen(false)} onStartPath={startLearningPath} />}
      {compareOpen && compareRecords.length === 2 && <ComparePanel records={compareRecords} locale={locale} t={t} onClose={() => setCompareOpen(false)} onSelect={(meteorite) => { setCompareOpen(false); selectMeteorite(meteorite); }} />}
    </main>
  );
}

export default App;
