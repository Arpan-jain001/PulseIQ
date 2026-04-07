import { GoogleGenAI } from "@google/genai";

export const askAI = async ({ prompt }) => {
  const provider = (process.env.AI_PROVIDER || "GEMINI").toUpperCase();

  // --- GEMINI 3 LOGIC ---
  if (provider === "GEMINI") {
    // Note: Nayi library automatically `process.env.GEMINI_API_KEY` ko read kar leti hai
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!geminiKey) throw new Error("GEMINI_API_KEY is missing in .env");

    try {
      // Library initialization
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      // Documentation ke mutabiq model name "gemini-3-flash-preview" use karein
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      return response.text;
    } catch (e) {
      console.error("Gemini 3 Error:", e.message);
      
      // Fallback: Agar preview model busy ho toh standard flash try karein
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash", 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        return response.text;
      } catch (e2) {
        throw new Error(`Gemini Service Failed: ${e.message}`);
      }
    }
  }

  // --- OPENAI LOGIC ---
  if (provider === "OPENAI") {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices?.[0]?.message?.content || "";
  }
};