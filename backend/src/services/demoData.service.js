import Event from "../models/Event.js";
import Project from "../models/Project.js";
import { getCategoryConfig } from "./projectCategory.service.js";

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;
const chance = (value) => Math.random() < value;

const CATEGORY_BLUEPRINTS = {
  ecommerce: {
    pages: ["/", "/collections", "/products", "/products/shoes", "/cart", "/checkout", "/thank-you"],
    events: ["page_view", "scroll", "click", "button_click", "add_to_cart", "checkout", "purchase"],
  },
  edtech: {
    pages: ["/", "/courses", "/course/javascript", "/exam/mock-1", "/exam/results", "/leaderboard"],
    events: ["page_view", "scroll", "click", "button_click", "exam_start", "question_retry", "question_quit", "exam_quit"],
  },
  saas: {
    pages: ["/", "/pricing", "/signup", "/dashboard", "/workspace", "/billing", "/settings"],
    events: ["page_view", "scroll", "click", "button_click", "signup", "invite_member", "feature_used", "upgrade_plan"],
  },
  content: {
    pages: ["/", "/blog", "/blog/ai-analytics", "/resources", "/newsletter", "/pricing"],
    events: ["page_view", "scroll", "click", "button_click", "article_read", "newsletter_signup", "cta_click"],
  },
  marketing: {
    pages: ["/", "/landing", "/demo", "/case-study", "/contact", "/pricing"],
    events: ["page_view", "scroll", "click", "button_click", "form_submit", "demo_request", "lead_capture"],
  },
  general: {
    pages: ["/", "/about", "/features", "/pricing", "/contact", "/dashboard"],
    events: ["page_view", "scroll", "click", "button_click", "signup", "feature_used"],
  },
};

const getBlueprint = (key) => CATEGORY_BLUEPRINTS[key] || CATEGORY_BLUEPRINTS.general;

const buildEvent = ({ projectId, ts, sessionId, anonymousId, userId = "", eventName, page, referrer = "", properties = {} }) => ({
  projectId,
  eventName,
  sessionId,
  anonymousId,
  userId,
  properties: {
    page,
    referrer,
    ...properties,
  },
  ts,
  ip: `10.0.${randomInt(1, 4)}.${randomInt(10, 240)}`,
  ua: pick([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 14) Chrome/123.0 Mobile",
  ]),
});

const addCommonSessionEvents = ({ projectId, pages, ts, dayIndex, sessionId, anonymousId, userId, bucket }) => {
  const landingPage = pick(pages);
  let cursor = new Date(ts);
  const pageCount = randomInt(2, 5);

  for (let index = 0; index < pageCount; index += 1) {
    const page = index === 0 ? landingPage : pick(pages);
    const referrer = index === 0 ? pick(["https://google.com", "https://linkedin.com", ""]) : landingPage;

    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(cursor),
        sessionId,
        anonymousId,
        userId,
        eventName: "page_view",
        page,
        referrer,
      })
    );

    cursor = new Date(cursor.getTime() + randomInt(10, 90) * 1000);

    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(cursor),
        sessionId,
        anonymousId,
        userId,
        eventName: "scroll",
        page,
        properties: {
          scrollDepth: randomInt(30, 100),
        },
      })
    );

    cursor = new Date(cursor.getTime() + randomInt(5, 35) * 1000);

    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(cursor),
        sessionId,
        anonymousId,
        userId,
        eventName: chance(0.55) ? "button_click" : "click",
        page,
        properties: {
          x: randomInt(20, 1180),
          y: randomInt(20, 2200),
          targetId: pick(["primary_cta", "nav_link", "pricing_card", "hero_button", "next_step"]),
        },
      })
    );

    cursor = new Date(cursor.getTime() + randomInt(5, 25) * 1000);
  }

  if (dayIndex < 3 && chance(0.22)) {
    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(cursor.getTime() + randomInt(5, 45) * 1000),
        sessionId,
        anonymousId,
        userId,
        eventName: "signup",
        page: pick(["/signup", "/pricing", "/"]),
        properties: { method: pick(["email", "google"]) },
      })
    );
  }
};

const addCategoryEvents = ({ categoryKey, projectId, ts, sessionId, anonymousId, userId, bucket }) => {
  if (categoryKey === "ecommerce") {
    if (chance(0.65)) {
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(30, 160) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: "add_to_cart",
          page: "/products/shoes",
          properties: { productId: `sku-${randomInt(100, 999)}`, value: randomInt(799, 2499) },
        })
      );
    }
    if (chance(0.42)) {
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(120, 240) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: "checkout",
          page: "/checkout",
          properties: { step: pick(["address", "payment", "review"]) },
        })
      );
    }
    if (chance(0.24)) {
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(180, 320) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: "purchase",
          page: "/thank-you",
          properties: { amount: randomInt(1499, 6999), currency: "INR" },
        })
      );
    }
    return;
  }

  if (categoryKey === "edtech") {
    const examId = `exam-${randomInt(1, 4)}`;
    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(ts.getTime() + randomInt(20, 80) * 1000),
        sessionId,
        anonymousId,
        userId,
        eventName: "exam_start",
        page: "/exam/mock-1",
        properties: { examId, section: pick(["Math", "Reasoning", "Science"]) },
      })
    );

    const questionCount = randomInt(2, 6);
    for (let index = 0; index < questionCount; index += 1) {
      const section = pick(["Math", "Reasoning", "Science"]);
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(60, 220) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: chance(0.22) ? "question_quit" : chance(0.3) ? "question_retry" : "button_click",
          page: "/exam/mock-1",
          properties: {
            examId,
            section,
            questionId: `${section.toLowerCase()}-${randomInt(1, 20)}`,
            timeSpent: randomInt(20, 180),
          },
        })
      );
    }

    if (chance(0.18)) {
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(160, 320) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: "exam_quit",
          page: "/exam/mock-1",
          properties: { examId, section: pick(["Math", "Reasoning", "Science"]) },
        })
      );
    }
    return;
  }

  if (categoryKey === "saas") {
    const feature = pick(["dashboard_filters", "team_invite", "report_export", "insights_panel"]);
    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(ts.getTime() + randomInt(40, 120) * 1000),
        sessionId,
        anonymousId,
        userId,
        eventName: chance(0.4) ? "invite_member" : "feature_used",
        page: pick(["/dashboard", "/workspace", "/settings"]),
        properties: { feature },
      })
    );

    if (chance(0.16)) {
      bucket.push(
        buildEvent({
          projectId,
          ts: new Date(ts.getTime() + randomInt(140, 280) * 1000),
          sessionId,
          anonymousId,
          userId,
          eventName: "upgrade_plan",
          page: "/billing",
          properties: { plan: pick(["Starter", "Growth", "Scale"]) },
        })
      );
    }
    return;
  }

  if (categoryKey === "content") {
    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(ts.getTime() + randomInt(30, 140) * 1000),
        sessionId,
        anonymousId,
        userId,
        eventName: chance(0.4) ? "newsletter_signup" : "article_read",
        page: pick(["/blog", "/blog/ai-analytics", "/resources"]),
        properties: { readTime: randomInt(45, 420) },
      })
    );
    return;
  }

  if (categoryKey === "marketing") {
    bucket.push(
      buildEvent({
        projectId,
        ts: new Date(ts.getTime() + randomInt(35, 110) * 1000),
        sessionId,
        anonymousId,
        userId,
        eventName: chance(0.35) ? "demo_request" : "form_submit",
        page: pick(["/demo", "/contact", "/landing"]),
        properties: { source: pick(["organic", "ads", "linkedin", "newsletter"]) },
      })
    );
    return;
  }

  bucket.push(
    buildEvent({
      projectId,
      ts: new Date(ts.getTime() + randomInt(30, 120) * 1000),
      sessionId,
      anonymousId,
      userId,
      eventName: "feature_used",
      page: pick(["/dashboard", "/features", "/pricing"]),
      properties: { feature: pick(["analytics", "alerts", "exports"]) },
    })
  );
};

export const seedProjectDemoData = async ({ projectId, days = 21 }) => {
  const project = await Project.findById(projectId).select("categoryKey");
  if (!project) {
    throw new Error("Project not found");
  }

  const categoryKey = project.categoryKey || "general";
  const blueprint = getBlueprint(categoryKey);
  const events = [];
  const now = new Date();

  for (let dayIndex = days - 1; dayIndex >= 0; dayIndex -= 1) {
    const dailyUsers = randomInt(12, 28);
    const dayStart = new Date(now.getTime() - dayIndex * 86400000);

    for (let userIndex = 0; userIndex < dailyUsers; userIndex += 1) {
      const anonymousId = `anon_${dayIndex}_${userIndex}_${randomInt(100, 999)}`;
      const userId = chance(0.36) ? `user_${randomInt(1000, 9999)}` : "";
      const sessionCount = chance(0.2) ? 2 : 1;

      for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex += 1) {
        const sessionId = `sess_${dayIndex}_${userIndex}_${sessionIndex}_${randomInt(1000, 9999)}`;
        const sessionStart = new Date(dayStart);
        sessionStart.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59), 0);

        addCommonSessionEvents({
          projectId: project._id,
          pages: blueprint.pages,
          ts: sessionStart,
          dayIndex,
          sessionId,
          anonymousId,
          userId,
          bucket: events,
        });

        addCategoryEvents({
          categoryKey,
          projectId: project._id,
          ts: sessionStart,
          sessionId,
          anonymousId,
          userId,
          bucket: events,
        });
      }
    }
  }

  if (events.length > 0) {
    await Event.insertMany(events, { ordered: false });
  }

  const category = getCategoryConfig(categoryKey);
  const approxUsers = Math.max(1, Math.round(events.length / randomFloat(5.2, 7.6)));
  const healthScore = Math.min(96, Math.max(58, Math.round(72 + randomFloat(-12, 18))));

  await Project.findByIdAndUpdate(project._id, {
    sdkVerified: true,
    sdkVerifiedAt: new Date(),
    recentHealthScore: healthScore,
    recentHealthLabel: healthScore >= 75 ? "Healthy growth" : healthScore >= 60 ? "Needs attention" : "At risk",
    recentHealthSummary: `Demo ${category.label.toLowerCase()} data generated with ${events.length.toLocaleString()} live events across approximately ${approxUsers} visitors.`,
    lastHealthEvaluatedAt: new Date(),
  });

  return {
    generatedEvents: events.length,
    generatedUsers: approxUsers,
    category: category.label,
  };
};
