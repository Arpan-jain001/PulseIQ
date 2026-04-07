// backend/src/controllers/ai.controller.js — REPLACE existing
import { askAI }          from "../services/ai.service.js";
import { buildAiContext } from "../services/analytics.service.js";
import Project            from "../models/Project.js";

/* ── POST /api/ai/insights ── */
export const insights = async (req, res, next) => {
  try {
    const { projectId, from, to, projectName, page } = req.body;
    if (!projectId) return res.status(400).json({ success:false, message:"projectId required" });

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
export const chat = async (req, res, next) => {
  try {
    const { projectId, question, from, to, page } = req.body;
    if (!projectId || !question) {
      return res.status(400).json({ success:false, message:"projectId and question required" });
    }

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
export const pageInsights = async (req, res, next) => {
  try {
    const { projectId, page, from, to } = req.body;
    if (!projectId || !page) {
      return res.status(400).json({ success:false, message:"projectId and page required" });
    }

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