const CATEGORY_CONFIG = {
  ecommerce: {
    label: "E-commerce",
    journeysLabel: "Conversion journeys",
    signals: ["purchase", "checkout", "add_to_cart", "cart", "product", "order", "payment", "shop", "catalog"],
  },
  edtech: {
    label: "EdTech / Exam",
    journeysLabel: "Learning journeys",
    signals: ["exam", "question", "quiz", "lesson", "course", "student", "section", "attempt", "score"],
  },
  saas: {
    label: "SaaS",
    journeysLabel: "Activation journeys",
    signals: ["signup", "trial", "workspace", "invite", "onboarding", "subscription", "feature", "dashboard"],
  },
  content: {
    label: "Content / Media",
    journeysLabel: "Engagement journeys",
    signals: ["article", "blog", "read", "watch", "video", "content", "engagement", "newsletter"],
  },
  marketing: {
    label: "Marketing / Lead Gen",
    journeysLabel: "Lead journeys",
    signals: ["lead", "landing", "campaign", "form", "demo", "contact", "cta", "funnel"],
  },
  general: {
    label: "General Web App",
    journeysLabel: "User journeys",
    signals: [],
  },
};

const scoreText = (text = "", signals = []) => {
  const lower = String(text).toLowerCase();
  return signals.reduce((score, signal) => (lower.includes(signal) ? score + 1 : score), 0);
};

export const inferProjectCategory = ({ project, events = [] }) => {
  const projectText = [
    project?.name,
    ...(project?.allowedDomains || []),
    ...events.map((event) => event?.eventName),
    ...events.map((event) => event?.properties?.page),
  ]
    .filter(Boolean)
    .join(" ");

  let bestKey = "general";
  let bestScore = 0;

  Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
    if (key === "general") return;
    const score = scoreText(projectText, config.signals);
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  });

  const confidence = Math.min(bestScore * 18, 96);
  const key = bestScore > 0 ? bestKey : "general";

  return {
    key,
    confidence,
    ...CATEGORY_CONFIG[key],
  };
};

export const getCategoryConfig = (key = "general") => {
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG.general;
};
