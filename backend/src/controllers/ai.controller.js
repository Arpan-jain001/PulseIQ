// backend/src/controllers/ai.controller.js — REPLACE existing
import { askAI } from "../services/ai.service.js";
import {
  buildAiContext,
  buildPageAiContext,
  buildProjectAiContext,
  getPageInsightFacts,
  overview,
  pageAnalytics,
  sessionJourney,
} from "../services/analytics.service.js";
import Project from "../models/Project.js";
import { getAccessibleProject } from "../services/projectAccess.service.js";

const getDateRange = (from, to) => ({
  toDate: to ? new Date(to) : new Date(),
  fromDate: from ? new Date(from) : new Date(Date.now() - 30 * 86400000),
});

const parseJsonResponse = (raw, fallback) => {
  try {
    const clean = String(raw || "").replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return fallback;
    }

    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return fallback;
  }
};

const normalizeHealthScore = (value, fallback = 50) => {
  const match = String(value ?? "").match(/\d+(\.\d+)?/);
  const numeric = Number(match ? match[0] : value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const getHealthLabel = (score, fallback = "Needs Attention") => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 45) return "Needs Attention";
  if (score >= 0) return "Critical";
  return fallback;
};

const normalizeProjectInsightResponse = (data) => {
  const healthScore = normalizeHealthScore(data?.health_score, 50);
  return {
    ...data,
    health_score: healthScore,
    health_label: data?.health_label || getHealthLabel(healthScore),
    insights: Array.isArray(data?.insights) ? data.insights : [],
    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
    predictions: Array.isArray(data?.predictions) ? data.predictions : [],
    page_insights: Array.isArray(data?.page_insights) ? data.page_insights : [],
    warnings: Array.isArray(data?.warnings) ? data.warnings : [],
  };
};

const PAGE_KIND_MAP = {
  auth: ["login", "signin", "sign-in", "signup", "register", "auth", "otp", "password"],
  checkout: ["checkout", "cart", "payment", "billing", "order"],
  exam: ["exam", "test", "question", "quiz", "assessment"],
};

const SUCCESS_EVENT_NAMES = [
  "identify",
  "login_success",
  "signup_success",
  "register_success",
  "checkout_complete",
  "payment_success",
  "purchase",
  "order_complete",
  "form_submit_success",
  "exam_start",
  "exam_submit",
  "booking_success",
];

const FAILURE_EVENT_NAMES = [
  "login_failed",
  "login_error",
  "signup_failed",
  "validation_error",
  "form_error",
  "checkout_error",
  "payment_failed",
  "exam_quit",
  "question_quit",
  "question_drop",
  "drop_off",
];

const countNamedEvents = (eventCounts = {}, names = []) =>
  names.reduce((sum, name) => sum + Number(eventCounts?.[name] || 0), 0);

const detectPageKind = (page = "") => {
  const normalized = String(page || "").toLowerCase();
  for (const [kind, keywords] of Object.entries(PAGE_KIND_MAP)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return kind;
    }
  }
  return "generic";
};

const getPageSpecificOpportunity = (page, pageKind) => {
  if (pageKind === "auth") {
    return "Introduce social login or simplify the form so returning users do not repeat the same authentication flow.";
  }
  if (pageKind === "checkout") {
    return "Add trust signals, payment reassurance, and a shorter checkout path to reduce purchase hesitation.";
  }
  if (pageKind === "exam") {
    return "Break the journey into clearer checkpoints so students understand progress before they quit.";
  }
  return `Place a clearer primary CTA and track its click state on ${page} so intent is visible before users leave.`;
};

const buildHeuristicPageInsights = (facts) => {
  const { page, metrics, scroll, clickClusters, clickSamples, eventCounts, trend, sessions } = facts;
  const pageKind = detectPageKind(page);
  const successSignals = countNamedEvents(eventCounts, SUCCESS_EVENT_NAMES);
  const failureSignals = countNamedEvents(eventCounts, FAILURE_EVENT_NAMES);
  const trendTail = trend.slice(-3);
  const latestViews = trendTail.at(-1)?.pageViews || 0;
  const earliestViews = trendTail[0]?.pageViews || latestViews;
  const trendDirection =
    latestViews > earliestViews ? "up" : latestViews < earliestViews ? "down" : "stable";

  let severity = "good";
  if (
    metrics.viewsPerUser >= 4 ||
    (metrics.pageViews >= 10 && successSignals === 0) ||
    (metrics.totalEvents >= 10 && metrics.totalClicks === 0) ||
    failureSignals >= 2
  ) {
    severity = "critical";
  } else if (
    metrics.viewsPerUser >= 2.5 ||
    metrics.totalClicks === 0 ||
    scroll.samples === 0 ||
    metrics.uniqueUsers <= 2
  ) {
    severity = "warning";
  }

  const verdictTone =
    severity === "critical"
      ? "high"
      : severity === "warning"
        ? "medium"
        : "low";

  const authHint =
    pageKind === "auth"
      ? ` and only ${successSignals} success signal${successSignals === 1 ? "" : "s"} across the observed period`
      : "";
  const summary = `${page} recorded ${metrics.pageViews} page views from ${metrics.uniqueUsers} unique users and ${metrics.totalEvents} page-tagged events over the last ${facts.periodDays} days. The pattern of ${metrics.viewsPerUser} views per visitor, ${metrics.totalClicks} click/tap events, ${scroll.samples} scroll samples${authHint} suggests ${
    severity === "critical"
      ? "strong friction or a blocked journey on this page."
      : severity === "warning"
        ? "this page is under-instrumented or causing noticeable hesitation."
        : "the page is reasonably healthy, but there is still room to sharpen conversion visibility."
  }`;

  const problems = [];
  if (metrics.viewsPerUser >= 4) {
    problems.push({
      issue: `Excessive repeat visits (${metrics.viewsPerUser} views per user) suggest users may be stuck, retrying, or bouncing back to ${page}.`,
      severity: "high",
      fix:
        pageKind === "auth"
          ? "Review validation, redirect flow, and session persistence to confirm users can move past authentication cleanly."
          : "Inspect redirects, CTA flow, and form completion logic to confirm users can move forward without looping.",
    });
  }
  if (successSignals === 0 || (pageKind === "auth" && metrics.pageViews >= 8 && successSignals <= 1)) {
    problems.push({
      issue:
        pageKind === "auth"
          ? `Very weak conversion signal on ${page}; only ${successSignals} success event${successSignals === 1 ? "" : "s"} were captured.`
          : `This page is generating activity but almost no clear success signal (${successSignals} success events).`,
      severity: "high",
      fix:
        pageKind === "auth"
          ? "Audit the login/identify success event path and make sure successful sessions fire an identify or success event every time."
          : "Instrument and verify the success action on this page so conversions can be separated from casual traffic.",
    });
  }
  if (metrics.totalEvents >= 8 && metrics.totalClicks === 0) {
    problems.push({
      issue: `Users are producing ${metrics.totalEvents} events here, but no click or tap events are being captured.`,
      severity: "medium",
      fix: "Track CTA clicks, form submits, and validation states so the page reveals where intent actually breaks.",
    });
  }
  if (scroll.samples === 0) {
    problems.push({
      issue: "Scroll-depth coverage is missing, so PulseIQ cannot tell how far visitors actually explore this page.",
      severity: "medium",
      fix: "Enable scroll tracking on this route to separate quick exits from deep but non-converting sessions.",
    });
  }
  if (failureSignals >= 2) {
    problems.push({
      issue: `${failureSignals} failure-oriented events were recorded on this page, pointing to explicit user or technical friction.`,
      severity: "high",
      fix: "Break failure events by reason code and surface the dominant failure path inside the analytics panel.",
    });
  }

  const opportunities = [
    getPageSpecificOpportunity(page, pageKind),
    "Add error-specific event tracking so PulseIQ can distinguish technical failures from normal hesitation.",
    metrics.totalClicks === 0
      ? "Instrument the primary CTA, secondary CTA, and form submit button separately to reveal where attention actually goes."
      : `Use the ${clickSamples} captured interaction sample${clickSamples === 1 ? "" : "s"} to compare high-attention zones against the page's final conversion step.`,
  ];

  const recommendations = [
    {
      priority: severity === "critical" ? "high" : "medium",
      action:
        pageKind === "auth"
          ? "Test the complete sign-in flow from submit to redirect and confirm every successful login creates a persisted session."
          : "Review the primary conversion path on this page from first interaction to next-step completion.",
      impact: "This should reduce repeated visits and make successful journeys visible inside PulseIQ.",
    },
    {
      priority: metrics.totalClicks === 0 ? "high" : "medium",
      action: "Add richer instrumentation for CTA clicks, form validation, and success/failure events on this page.",
      impact: "You will be able to separate UX friction, data gaps, and actual conversion drop-off.",
    },
    {
      priority: scroll.samples === 0 ? "medium" : "low",
      action: "Capture scroll depth and above-the-fold engagement signals for this page.",
      impact: "This will show whether users are leaving immediately or exploring before abandoning.",
    },
  ];

  const predictions = [
    {
      metric: "Page friction",
      trend: severity === "critical" ? "down" : "stable",
      forecast:
        severity === "critical"
          ? "If this pattern continues for the next 7 days, repeat visits will stay elevated while page-level conversion remains muted."
          : "If traffic quality stays similar, this page should remain stable but will still hide root-cause signals without deeper event tracking.",
    },
    {
      metric: "Analytics clarity",
      trend: "up",
      forecast:
        "Adding CTA, failure, and success instrumentation here should materially improve the quality of AI recommendations within the next reporting window.",
    },
  ];

  return {
    page,
    health: severity,
    summary,
    verdict: `ai_insight -> ${page} -> ${verdictTone}: ${
      severity === "critical"
        ? `strong friction identified by ${metrics.viewsPerUser} views/user${pageKind === "auth" ? ` and only ${successSignals} success signal${successSignals === 1 ? "" : "s"}` : ""}.`
        : severity === "warning"
          ? `engagement signal is incomplete with ${metrics.totalClicks} click events and ${scroll.samples} scroll samples.`
          : `healthy interaction pattern with ${metrics.pageViews} views and ${metrics.totalEvents} tracked events.`
    }`,
    problems: problems.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    predictions,
    metrics: {
      ...metrics,
      successSignals,
      failureSignals,
      scrollSamples: scroll.samples,
      avgScrollDepth: scroll.avgScrollDepth,
      clickClusters,
      clickSamples,
    },
    trend,
    topEvents: facts.topEvents,
    sessions: sessions.slice(0, 3),
  };
};

const mergePageInsights = (heuristic, parsed, page) => ({
  ...heuristic,
  ...parsed,
  page,
  metrics: heuristic.metrics,
  trend: heuristic.trend,
  topEvents: heuristic.topEvents,
  sessions: heuristic.sessions,
  summary:
    typeof parsed?.summary === "string" && parsed.summary.trim().length >= 80
      ? parsed.summary.trim()
      : heuristic.summary,
  verdict:
    typeof parsed?.verdict === "string" && parsed.verdict.trim().length >= 24
      ? parsed.verdict.trim()
      : heuristic.verdict,
  problems:
    Array.isArray(parsed?.problems) && parsed.problems.length
      ? parsed.problems.slice(0, 3)
      : heuristic.problems,
  opportunities:
    Array.isArray(parsed?.opportunities) && parsed.opportunities.length
      ? parsed.opportunities.slice(0, 3)
      : heuristic.opportunities,
  recommendations:
    Array.isArray(parsed?.recommendations) && parsed.recommendations.length
      ? parsed.recommendations.slice(0, 3)
      : heuristic.recommendations,
  predictions:
    Array.isArray(parsed?.predictions) && parsed.predictions.length
      ? parsed.predictions.slice(0, 2)
      : heuristic.predictions,
});

const buildFallbackProjectInsights = async ({ projectId, from, to, projectName, reason }) => {
  const [ov, pages, sessions] = await Promise.all([
    overview({ projectId, from, to }),
    pageAnalytics({ projectId, from, to }),
    sessionJourney({ projectId, from, to }),
  ]);

  const totalEvents = ov.totalEvents || 0;
  const uniqueUsers = ov.uniqueUsers || 0;
  const bounceRate = ov.bounceRate || 0;
  const topPages = pages?.pages || [];
  const topEvents = ov.topEvents || [];
  const firstPage = topPages[0];
  const noConversionEvents = !topEvents.some((event) =>
    /purchase|checkout|payment|signup|login_success|identify|submit|complete/i.test(event._id || "")
  );

  let score = 78;
  if (uniqueUsers <= 2) score -= 25;
  if (totalEvents <= 10) score -= 18;
  if (bounceRate >= 70) score -= 15;
  if (topPages.length === 0) score -= 12;
  if (noConversionEvents) score -= 12;
  score = Math.max(10, Math.min(92, score));

  const healthLabel =
    score >= 75 ? "Good" : score >= 50 ? "Needs Attention" : "Critical";

  return {
    summary: `${projectName || "This project"} has ${totalEvents} events from ${uniqueUsers} unique users with ${bounceRate}% bounce rate in the selected range. Gemini is temporarily unavailable, so PulseIQ generated this fallback analysis from stored analytics; the main risk is ${
      noConversionEvents ? "missing or weak conversion instrumentation" : "traffic quality and retention consistency"
    }.`,
    health_score: score,
    health_label: healthLabel,
    insights: [
      {
        type: uniqueUsers <= 2 ? "warning" : "growth",
        title: uniqueUsers <= 2 ? "Low User Volume" : "Traffic Signal Available",
        description: `${uniqueUsers} unique users generated ${totalEvents} events, so decision confidence is ${
          uniqueUsers <= 2 ? "limited until more traffic arrives" : "strong enough for directional analysis"
        }.`,
        impact: uniqueUsers <= 2 ? "high" : "medium",
      },
      {
        type: bounceRate >= 60 ? "warning" : "opportunity",
        title: "Bounce Rate Watch",
        description: `The website bounce rate is ${bounceRate}%, which ${
          bounceRate >= 60 ? "suggests users may not be finding the next step quickly" : "is manageable but should still be monitored by page"
        }.`,
        impact: bounceRate >= 60 ? "high" : "medium",
      },
      {
        type: noConversionEvents ? "anomaly" : "growth",
        title: noConversionEvents ? "Conversion Events Missing" : "Conversion Events Present",
        description: noConversionEvents
          ? "No clear purchase, checkout, identify, submit, or completion events were detected in the top event stream."
          : "The event stream includes conversion-like signals that can be used for funnel optimization.",
        impact: noConversionEvents ? "high" : "medium",
      },
      {
        type: "opportunity",
        title: "Page Prioritization",
        description: firstPage
          ? `${firstPage._id || "/"} leads page traffic with ${firstPage.totalViews} views and ${firstPage.uniqueUsers} users.`
          : "No page_view route is dominant yet, so ensure page tracking is active on all important routes.",
        impact: "medium",
      },
      {
        type: "opportunity",
        title: "Journey Depth",
        description: `${sessions?.summary?.totalSessions || 0} sessions average ${
          sessions?.summary?.avgEventsPerSession || 0
        } events per session, useful for understanding whether visitors explore or leave quickly.`,
        impact: "low",
      },
    ],
    recommendations: [
      {
        priority: noConversionEvents ? "critical" : "high",
        action: "Verify conversion event tracking",
        expected_impact: "Ensures AI can detect funnel success and not just page traffic.",
        effort: "low",
      },
      {
        priority: bounceRate >= 60 ? "high" : "medium",
        action: "Improve top landing page clarity",
        expected_impact: "Reduces early exits by making the next action visible above the fold.",
        effort: "medium",
      },
      {
        priority: "high",
        action: "Add failure and validation events",
        expected_impact: "Separates technical bugs from user hesitation on login, checkout, forms, or exam flows.",
        effort: "low",
      },
      {
        priority: "medium",
        action: "Increase traffic sample size",
        expected_impact: "Makes predictions and retention analysis more reliable.",
        effort: "medium",
      },
      {
        priority: "medium",
        action: "Review recent session paths",
        expected_impact: "Shows the exact sequence users follow before dropping off.",
        effort: "low",
      },
    ],
    predictions: [
      {
        metric: "DAU",
        trend: uniqueUsers <= 2 ? "stable" : "up",
        forecast:
          uniqueUsers <= 2
            ? "DAU will likely remain low until acquisition or test traffic increases."
            : "DAU may improve if current traffic sources continue.",
      },
      {
        metric: "Conversion clarity",
        trend: noConversionEvents ? "down" : "stable",
        forecast: noConversionEvents
          ? "Without conversion events, AI will continue flagging funnel uncertainty."
          : "Conversion analysis should remain usable with the current event stream.",
      },
      {
        metric: "Bounce risk",
        trend: bounceRate >= 60 ? "up" : "stable",
        forecast: bounceRate >= 60
          ? "Bounce risk can stay elevated unless landing page CTAs and routing are improved."
          : "Bounce risk appears stable for the next window.",
      },
    ],
    page_insights: topPages.slice(0, 3).map((pageItem, index) => ({
      page: pageItem._id || "/",
      issue:
        index === 0
          ? `${pageItem.totalViews} views from ${pageItem.uniqueUsers} users make this the highest-impact route to inspect first.`
          : `${pageItem._id || "/"} has enough activity to compare against the main page journey.`,
      recommendation: "Check CTA visibility, success-event tracking, and session continuation from this route.",
      priority: index === 0 ? "high" : "medium",
    })),
    warnings: reason ? [`Gemini fallback used: ${reason}`] : [],
  };
};

/* ── POST /api/ai/insights ── */
const legacyInsights = async (req, res, next) => {
  try {
    const { projectId, from, to, projectName, page } = req.body;
    if (!projectId) return res.status(400).json({ success:false, message:"projectId required" });
    await getAccessibleProject({ projectId, user: req.user });

    const toDate   = to   ? new Date(to)   : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);

    const context = await buildAiContext({ projectId, from:fromDate, to:toDate, projectName, page });

    const pageContext = page
      ? `\nFocus specifically on the page "${page}" and provide page-specific analysis.`
      : "";

    const prompt = `
You are PulseIQ AI — an expert SaaS product analytics assistant for EdTech, E-commerce, and SaaS platforms. Analyze this real analytics data.

${context}
${pageContext}

Respond ONLY with valid JSON (no markdown, no backticks, no preamble) in EXACTLY this format:
{
  "summary": "2-3 sentence executive summary with specific numbers",
  "health_score": <0-100>,
  "health_label": "<Excellent|Good|Needs Attention|Critical>",
  "insights": [
    {
      "type": "<growth|warning|opportunity|anomaly>",
      "title": "Short insight title",
      "description": "Specific insight with numbers from the data",
      "impact": "<high|medium|low>"
    }
  ],
  "recommendations": [
    {
      "priority": "<critical|high|medium>",
      "action": "Specific actionable recommendation",
      "expected_impact": "What improvement this will drive",
      "effort": "<low|medium|high>"
    }
  ],
  "predictions": [
    {
      "metric": "Metric name",
      "trend": "<up|down|stable>",
      "forecast": "Specific prediction for next 7 days based on current trend"
    }
  ],
  "page_insights": [
    {
      "page": "/page-path",
      "issue": "Problem detected on this page",
      "recommendation": "Fix recommendation",
      "priority": "<critical|high|medium>"
    }
  ],
  "warnings": []
}

Rules:
- Provide exactly 5 insights, 5 recommendations, 3 predictions, 3 page_insights
- Be data-driven — use specific numbers from the context
- For EdTech context: mention exam attempts, question difficulty, completion rates
- For E-commerce: mention cart abandonment, checkout flow, conversion
- warnings array: add critical issues only (empty array if none)
`.trim();

    const raw = await askAI({ prompt });

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g,"").trim();
      // Find JSON object
      const jsonStart = clean.indexOf("{");
      const jsonEnd   = clean.lastIndexOf("}");
      parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
    } catch {
      parsed = {
        summary:       "Analysis complete. Review the data below.",
        health_score:  50,
        health_label:  "Needs Attention",
        insights:      [{ type:"anomaly", title:"Raw Analysis", description:raw.slice(0,300), impact:"medium" }],
        recommendations: [],
        predictions:   [],
        page_insights: [],
        warnings:      [],
      };
    }

    res.json({ success:true, data:parsed, context });
  } catch (e) { next(e); }
};

/* ── POST /api/ai/chat ── */
const legacyChat = async (req, res, next) => {
  try {
    const { projectId, question, from, to, page } = req.body;
    if (!projectId || !question) {
      return res.status(400).json({ success:false, message:"projectId and question required" });
    }
    await getAccessibleProject({ projectId, user: req.user });

    const toDate   = to   ? new Date(to)   : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);

    const project = await Project.findById(projectId).select("name");
    const context = await buildAiContext({ projectId, from:fromDate, to:toDate, projectName:project?.name, page });

    const prompt = `
You are PulseIQ AI assistant — an expert analytics chatbot for ${project?.name || "a SaaS platform"}.

REAL ANALYTICS DATA:
${context}

USER QUESTION: "${question}"

Answer concisely (2-4 sentences) using specific numbers from the data.
If you detect a problem, suggest a fix.
If you cannot answer from available data, say so clearly.
Format: Plain text, no markdown.
`.trim();

    const answer = await askAI({ prompt });
    res.json({ success:true, data:answer });
  } catch (e) { next(e); }
};

/* ── POST /api/ai/page-insights ── */
const legacyPageInsights = async (req, res, next) => {
  try {
    const { projectId, page, from, to } = req.body;
    if (!projectId || !page) {
      return res.status(400).json({ success:false, message:"projectId and page required" });
    }
    await getAccessibleProject({ projectId, user: req.user });

    const toDate   = to   ? new Date(to)   : new Date();
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);

    const project = await Project.findById(projectId).select("name");
    const context = await buildAiContext({ projectId, from:fromDate, to:toDate, projectName:project?.name, page });

    const prompt = `
You are PulseIQ AI. Analyze this specific page: "${page}"

${context}

Give a focused analysis for page "${page}". Respond ONLY with valid JSON:
{
  "page": "${page}",
  "health": "<good|warning|critical>",
  "summary": "One sentence about this page's performance",
  "problems": [
    {"issue": "Specific problem", "severity": "<high|medium|low>", "fix": "Specific fix recommendation"}
  ],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "verdict": "Single line verdict like: ai_insight → ${page} → <priority_level>: <key finding>"
}

Provide 2-3 problems and 2 opportunities. Be specific with numbers.
`.trim();

    const raw = await askAI({ prompt });
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g,"").trim();
      const s = clean.indexOf("{"); const e = clean.lastIndexOf("}");
      parsed = JSON.parse(clean.slice(s, e+1));
    } catch {
      parsed = { page, health:"warning", summary:raw.slice(0,200), problems:[], opportunities:[], verdict:"Analysis complete" };
    }

    res.json({ success:true, data:parsed });
  } catch (e) { next(e); }
};

export const insights = async (req, res, next) => {
  try {
    const { projectId, from, to, projectName } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, message: "projectId required" });
    }

    await getAccessibleProject({ projectId, user: req.user });

    const { fromDate, toDate } = getDateRange(from, to);
    const project = await Project.findById(projectId).select("name");
    const context = await buildProjectAiContext({
      projectId,
      from: fromDate,
      to: toDate,
      projectName: projectName || project?.name,
    });

    const prompt = `
You are PulseIQ AI, an expert analytics strategist for SaaS, EdTech, e-commerce, coaching portals, job portals, and business websites.
Analyze the FULL PROJECT / whole website only. Do not narrow the answer to one page unless the data explicitly says the whole site depends on it.
PulseIQ's goal is to convert raw behavior data into actionable intelligence: drop-off causes, weak pages, conversion friction, retention risk, and next best actions.
Do not give a bland metric recap. Explain what the numbers imply, what is likely broken, and what the organization should improve first.

${context}

Respond with valid JSON only:
{
  "summary": "2-3 sentence executive summary with specific numbers",
  "health_score": 0,
  "health_label": "Excellent",
  "insights": [
    {
      "type": "growth",
      "title": "Short title",
      "description": "Specific data-backed insight",
      "impact": "high"
    }
  ],
  "recommendations": [
    {
      "priority": "critical",
      "action": "Specific action",
      "expected_impact": "Expected result",
      "effort": "medium"
    }
  ],
  "predictions": [
    {
      "metric": "Metric name",
      "trend": "up",
      "forecast": "Specific 7-day forecast"
    }
  ],
  "page_insights": [
    {
      "page": "/page-path",
      "issue": "Page-level issue from the website-wide analysis",
      "recommendation": "Specific fix",
      "priority": "high"
    }
  ],
  "warnings": []
}

Rules:
- Use the whole website/project context only
- Provide exactly 5 insights, 5 recommendations, 3 predictions, and 3 page_insights
- Use concrete numbers from the context
- Be decisive and product-oriented: mention low traffic, broken funnels, missing tracking, weak retention, or strong engagement when the data supports it
- If events are missing for a funnel, call out the instrumentation gap and the business risk
- Keep warnings for critical issues only
- If data is limited, say so inside the fields but still return the required structure
`.trim();

    let parsed;
    try {
      const raw = await askAI({ prompt });
      parsed = parseJsonResponse(raw, {
        summary: "Project analysis completed, but structured parsing fell back to raw output.",
        health_score: 50,
        health_label: "Needs Attention",
        insights: [
          {
            type: "anomaly",
            title: "Raw AI output",
            description: String(raw || "").slice(0, 320),
            impact: "medium",
          },
        ],
        recommendations: [],
        predictions: [],
        page_insights: [],
        warnings: [],
      });
    } catch (aiError) {
      console.warn(`[AI] Project insights fallback used: ${aiError.message}`);
      parsed = await buildFallbackProjectInsights({
        projectId,
        from: fromDate,
        to: toDate,
        projectName: projectName || project?.name,
        reason: aiError.message,
      });
    }

    res.json({ success: true, data: normalizeProjectInsightResponse(parsed), context });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { projectId, question, from, to } = req.body;
    if (!projectId || !question) {
      return res.status(400).json({ success: false, message: "projectId and question required" });
    }

    await getAccessibleProject({ projectId, user: req.user });

    const { fromDate, toDate } = getDateRange(from, to);
    const project = await Project.findById(projectId).select("name");
    const context = await buildProjectAiContext({
      projectId,
      from: fromDate,
      to: toDate,
      projectName: project?.name,
    });

    const prompt = `
You are PulseIQ AI assistant for ${project?.name || "this project"}.

REAL PROJECT ANALYTICS:
${context}

USER QUESTION: "${question}"

Answer in plain text using 2-4 concise sentences.
Use numbers from the analytics when possible.
If there is an issue, include one clear improvement suggestion.
If the available analytics do not support the answer, say that clearly.
`.trim();

    let answer;
    try {
      answer = await askAI({ prompt });
    } catch (aiError) {
      console.warn(`[AI] Chat fallback used: ${aiError.message}`);
      answer = `Gemini is temporarily unavailable, but your selected range shows analytics data is still being collected. Open AI Insights again after a minute, or check the Overview/Pages tabs for the exact event, user, bounce, and page metrics while the Gemini key pool cools down.`;
    }
    res.json({ success: true, data: answer });
  } catch (error) {
    next(error);
  }
};

export const pageInsights = async (req, res, next) => {
  try {
    const { projectId, page, from, to } = req.body;
    if (!projectId || !page) {
      return res.status(400).json({ success: false, message: "projectId and page required" });
    }

    await getAccessibleProject({ projectId, user: req.user });

    const { fromDate, toDate } = getDateRange(from, to);
    const project = await Project.findById(projectId).select("name");
    const facts = await getPageInsightFacts({
      projectId,
      from: fromDate,
      to: toDate,
      projectName: project?.name,
      page,
    });
    const context = await buildPageAiContext({
      projectId,
      from: fromDate,
      to: toDate,
      projectName: project?.name,
      page,
    });
    const heuristic = buildHeuristicPageInsights(facts);

    const prompt = `
You are PulseIQ AI, acting like a senior product analyst and UX diagnostician.
Analyze ONLY this page and keep the answer page-specific.
Do not give a bland metric recap. Infer likely friction, likely causes, and what should be improved first.

${context}

Respond with valid JSON only:
{
  "page": "${page}",
  "health": "warning",
  "summary": "Two strong sentences with specific page numbers and a clear interpretation",
  "problems": [
    {
      "issue": "Specific page problem",
      "severity": "high",
      "fix": "Specific fix"
    }
  ],
  "opportunities": ["Specific opportunity", "Specific opportunity"],
  "recommendations": [
    {
      "priority": "high",
      "action": "Specific improvement action",
      "impact": "Expected page-level outcome"
    }
  ],
  "predictions": [
    {
      "metric": "Page metric",
      "trend": "up",
      "forecast": "Specific short forecast"
    }
  ],
  "verdict": "ai_insight -> ${page} -> high: short page verdict"
}

Rules:
- Focus only on this page, not the full website summary
- Mention concrete page numbers from the context
- Sound decisive and useful, like a real analytics consultant
- Do not simply repeat 'recorded X views' without explaining what that implies
- Provide exactly 3 problems, 3 opportunities, 3 recommendations, and 2 predictions
- Recommendations must be actionable for this page
`.trim();

    let parsed;
    try {
      const raw = await askAI({ prompt });
      parsed = parseJsonResponse(raw, heuristic);
    } catch (aiError) {
      console.warn(`[AI] Page insights fallback used for ${page}: ${aiError.message}`);
      parsed = {
        ...heuristic,
        summary: `${heuristic.summary} Gemini is temporarily unavailable, so this report is generated from PulseIQ's local analytics heuristics.`,
      };
    }
    const data = mergePageInsights(heuristic, parsed, page);

    res.json({ success: true, data, context });
  } catch (error) {
    next(error);
  }
};
