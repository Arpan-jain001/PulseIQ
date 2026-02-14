import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const askAI = async ({ prompt }) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY missing");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // default openai
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices?.[0]?.message?.content || "";
};
