import { askAI } from "../services/ai.service.js";

export const insights = async (req, res, next) => {
  try {
    const { context } = req.body; // send analytics summary from frontend/backend
    const prompt = `You are PulseIQ AI. Give 5 insights + 5 action items in simple bullet points.\n\nContext:\n${context}`;
    const text = await askAI({ prompt });
    res.json({ success: true, data: text });
  } catch (e) {
    next(e);
  }
};
