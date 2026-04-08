const stripProtocol = (value = "") =>
  String(value).trim().replace(/^https?:\/\//i, "");

const stripPath = (value = "") => stripProtocol(value).split("/")[0].split("?")[0].split("#")[0];

export const normalizeDomain = (value = "") => {
  const raw = stripPath(value).toLowerCase();
  if (!raw) return "";

  const hasWildcard = raw.startsWith("*.");
  const host = hasWildcard ? raw.slice(2) : raw;
  return host.replace(/:\d+$/, "");
};

export const normalizeDomainList = (domains = []) =>
  Array.from(
    new Set(
      (Array.isArray(domains) ? domains : [])
        .map((domain) => String(domain || "").trim())
        .filter(Boolean)
        .map((domain) => {
          const normalized = normalizeDomain(domain);
          if (!normalized) return "";
          return String(domain).trim().startsWith("*.") ? `*.${normalized}` : normalized;
        })
        .filter(Boolean)
    )
  );

const extractHost = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";

  try {
    const url = text.includes("://") ? new URL(text) : new URL(`https://${text}`);
    return normalizeDomain(url.host);
  } catch {
    return normalizeDomain(text);
  }
};

export const extractRequestHosts = (req, properties = {}) => {
  const candidates = [
    req.headers.origin,
    req.headers.referer,
    properties.origin,
    properties.referrer,
    properties.href,
    properties.url,
    properties.page,
    properties.host,
    properties.domain,
  ];

  return Array.from(
    new Set(
      candidates
        .map((candidate) => extractHost(candidate))
        .filter(Boolean)
    )
  );
};

const matchesRule = (host, rule) => {
  if (!host || !rule) return false;
  if (rule.startsWith("*.")) {
    const base = rule.slice(2);
    return host === base || host.endsWith(`.${base}`);
  }
  return host === rule;
};

export const isAllowedHost = (hosts = [], allowedDomains = []) => {
  const rules = normalizeDomainList(allowedDomains);
  if (!rules.length) return true;
  if (!hosts.length) return false;
  return hosts.some((host) => rules.some((rule) => matchesRule(host, rule)));
};
