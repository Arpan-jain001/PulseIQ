const memoryStorage = new Map();

const hasWindow = () => typeof window !== "undefined";
const hasFetch = () => typeof fetch === "function";

const getStore = (type) => {
  if (hasWindow()) {
    if (type === "session" && window.sessionStorage) return window.sessionStorage;
    if (type === "local" && window.localStorage) return window.localStorage;
  }

  return {
    getItem: (key) => (memoryStorage.has(`${type}:${key}`) ? memoryStorage.get(`${type}:${key}`) : null),
    setItem: (key, value) => memoryStorage.set(`${type}:${key}`, String(value)),
    removeItem: (key) => memoryStorage.delete(`${type}:${key}`),
  };
};

const randomId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 11)}`;

const normalizeEndpoint = (endpoint) => endpoint.replace(/\/+$/, "");

export function createPulseIQ(config = {}) {
  const {
    apiKey,
    projectId,
    endpoint,
    autoTrackPageViews = false,
    autoTrackClicks = false,
    autoTrackScroll = false,
  } = config;

  if (!apiKey) throw new Error("PulseIQ: apiKey is required");
  if (!projectId) throw new Error("PulseIQ: projectId is required");
  if (!endpoint) throw new Error("PulseIQ: endpoint is required");

  const localStore = getStore("local");
  const sessionStore = getStore("session");
  const finalEndpoint = normalizeEndpoint(endpoint);
  let cleanupFns = [];

  const getAnonymousId = () => {
    let id = localStore.getItem("_piq_anon");
    if (!id) {
      id = randomId("anon");
      localStore.setItem("_piq_anon", id);
    }
    return id;
  };

  const getSessionId = () => {
    let id = sessionStore.getItem("_piq_session");
    if (!id) {
      id = randomId("sess");
      sessionStore.setItem("_piq_session", id);
    }
    return id;
  };

  const getUserId = () => localStore.getItem("_piq_user") || undefined;

  const buildDefaultProperties = () => {
    if (!hasWindow()) return {};

    return {
      page: window.location.pathname,
      href: window.location.href,
      referrer: document.referrer || "",
    };
  };

  const send = async (payload) => {
    if (!hasFetch()) return false;

    try {
      const response = await fetch(finalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const track = async (eventName, properties = {}, overrides = {}) => {
    if (!eventName) throw new Error("PulseIQ: eventName is required");

    return send({
      projectId,
      eventName,
      sessionId: overrides.sessionId || getSessionId(),
      userId: overrides.userId || getUserId(),
      anonymousId: overrides.anonymousId || getAnonymousId(),
      properties: {
        ...buildDefaultProperties(),
        ...properties,
      },
    });
  };

  const page = async (properties = {}) => track("page_view", properties);

  const identify = async (userId, traits = {}) => {
    if (!userId) throw new Error("PulseIQ: userId is required for identify()");
    localStore.setItem("_piq_user", String(userId));
    return track("identify", { userId, ...traits }, { userId: String(userId) });
  };

  const resetIdentity = () => {
    localStore.removeItem("_piq_user");
  };

  const attachAutoTracking = (options = {}) => {
    const clickTracking = options.click ?? autoTrackClicks;
    const scrollTracking = options.scroll ?? autoTrackScroll;

    const nextCleanup = [];

    if (hasWindow() && clickTracking) {
      const onClick = (event) => {
        track("button_click", {
          x: event.clientX,
          y: event.clientY,
          tag: event.target?.tagName || "unknown",
          text: (event.target?.innerText || "").slice(0, 80),
        });
      };

      window.addEventListener("click", onClick);
      nextCleanup.push(() => window.removeEventListener("click", onClick));
    }

    if (hasWindow() && scrollTracking) {
      const onScroll = () => {
        const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const depth = Math.round((window.scrollY / total) * 100);
        track("scroll_depth", { scrollDepth: depth });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      nextCleanup.push(() => window.removeEventListener("scroll", onScroll));
    }

    cleanupFns = [...cleanupFns, ...nextCleanup];

    return () => {
      nextCleanup.forEach((cleanup) => cleanup());
      cleanupFns = cleanupFns.filter((cleanup) => !nextCleanup.includes(cleanup));
    };
  };

  const start = () => {
    if (autoTrackPageViews) page();
    if (autoTrackClicks || autoTrackScroll) attachAutoTracking();
  };

  const stop = () => {
    cleanupFns.forEach((cleanup) => cleanup());
    cleanupFns = [];
  };

  return {
    track,
    page,
    identify,
    resetIdentity,
    attachAutoTracking,
    start,
    stop,
    getAnonymousId,
    getSessionId,
  };
}

export default createPulseIQ;
