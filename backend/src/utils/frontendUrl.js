const DEFAULT_FRONTEND_URL = "https://pulseiqai.netlify.app";
const KNOWN_BACKEND_HOSTS = new Set(["pulseiq-ffio.onrender.com"]);

const parseUrlCandidate = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
  const shouldUseHttp = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(trimmed);

  try {
    return new URL(hasProtocol ? trimmed : `${shouldUseHttp ? "http" : "https"}://${trimmed}`);
  } catch {
    return null;
  }
};

const normalizeUrl = (parsedUrl) => {
  const pathname = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");
  return `${parsedUrl.origin}${pathname}`;
};

const isBackendUrl = (parsedUrl) => {
  const pathname = parsedUrl.pathname.replace(/\/+$/, "");
  return KNOWN_BACKEND_HOSTS.has(parsedUrl.hostname) || pathname.startsWith("/api");
};

export const getFrontendUrl = () => {
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    DEFAULT_FRONTEND_URL,
  ];

  for (const candidate of candidates) {
    const parsedUrl = parseUrlCandidate(candidate);
    if (!parsedUrl || isBackendUrl(parsedUrl)) continue;
    return normalizeUrl(parsedUrl);
  }

  return DEFAULT_FRONTEND_URL;
};
