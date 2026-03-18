import { askAI } from "../services/ai.service.js";

export const runInsightsJob = async () => {
  try {
    const prompt = `
    Analyze user activity and give:
    - 3 insights
    - 3 improvements
    `;

    const result = await askAI({ prompt });

    console.log("🧠 AI Insights:\n", result);
  } catch (error) {
    console.error("❌ Insights job error:", error.message);
  }
};