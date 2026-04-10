import { GoogleGenAI } from "@google/genai";
import { OpenRouter } from "@openrouter/sdk";

const QUOTA_PATTERN = /RESOURCE_EXHAUSTED|quota exceeded|current quota|429/i;

const getErrorText = (error) =>
  [
    typeof error === "string" ? error : "",
    error?.message,
    error?.error?.message,
    error?.cause?.message,
    error?.response?.data?.message,
  ]
    .filter(Boolean)
    .join(" ");

const getRetrySeconds = (message = "") => {
  const match =
    message.match(/retry in\s+([\d.]+)s/i) ||
    message.match(/"retryDelay":"(\d+)s"/i) ||
    message.match(/retryDelay['"]?:['"]?(\d+)s/i);

  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.max(1, Math.ceil(value)) : null;
};

const createProviderError = (provider, error) => {
  const message = getErrorText(error);
  const retrySeconds = getRetrySeconds(message);

  if (QUOTA_PATTERN.test(message)) {
    const retryHint = retrySeconds ? ` Retry after about ${retrySeconds} seconds.` : "";
    const quotaError = new Error(
      `${provider} quota reached.${retryHint} PulseIQ will use the next configured provider if available.`
    );
    quotaError.statusCode = 429;
    return quotaError;
  }

  if (/API key not valid|API_KEY_INVALID|missing|permission denied|unauthorized|401|403/i.test(message)) {
    const authError = new Error(
      `${provider} API key is missing or invalid. Check backend AI environment variables and restart the server.`
    );
    authError.statusCode = 500;
    return authError;
  }

  const serviceError = new Error(
    `${provider} service is temporarily unavailable.${message ? ` ${message}` : " Please try again shortly."}`
  );
  serviceError.statusCode = 502;
  return serviceError;
};

const getProviderChain = () => {
  const primary = (process.env.AI_PROVIDER || "GEMINI").toUpperCase();
  const fallback = (process.env.AI_FALLBACK_PROVIDER || "GEMINI").toUpperCase();
  return [...new Set([primary, fallback])];
};

const getGeminiKeys = () =>
  [
    ...(process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean),
    ...(process.env.GOOGLE_API_KEY || "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean),
  ].filter((key, index, keys) => keys.indexOf(key) === index);

const getGeminiModels = () =>
  [
    ...(process.env.GEMINI_MODELS || "")
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean),
    process.env.GEMINI_MODEL || "gemini-3-flash-preview",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ].filter((model, index, models) => model && models.indexOf(model) === index);

const askGemini = async (prompt) => {
  const geminiKeys = getGeminiKeys();
  if (geminiKeys.length === 0) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const models = getGeminiModels();
  const failures = [];

  for (const [keyIndex, geminiKey] of geminiKeys.entries()) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        if (keyIndex > 0) {
          console.info(`[AI] Gemini key #${keyIndex + 1} served the request after earlier key fallback.`);
        }
        return response.text || "";
      } catch (error) {
        failures.push({ keyIndex, model, error });
        console.warn(
          `[AI] Gemini key #${keyIndex + 1} failed on ${model}: ${createProviderError("GEMINI", error).message}`
        );
      }
    }
  }

  const finalError = failures.at(-1)?.error || new Error("All Gemini keys failed.");
  throw finalError;
};

const askOpenRouter = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in .env");
  }

  const client = new OpenRouter({
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || process.env.FRONTEND_URL || "http://localhost:5173",
      "X-OpenRouter-Title": process.env.OPENROUTER_SITE_NAME || "PulseIQ",
    },
  });

  const completion = await client.chat.send({
    chatRequest: {
      model: process.env.OPENROUTER_MODEL || "openai/gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      maxTokens: Number(process.env.OPENROUTER_MAX_TOKENS || 1024),
      stream: false,
    },
  });

  return completion?.choices?.[0]?.message?.content || "";
};

const askOpenAI = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing in .env");
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices?.[0]?.message?.content || "";
};

const PROVIDER_HANDLERS = {
  GEMINI: askGemini,
  OPENROUTER: askOpenRouter,
  OPENAI: askOpenAI,
};

export const askAI = async ({ prompt }) => {
  const chain = getProviderChain();
  const failures = [];

  for (const provider of chain) {
    const handler = PROVIDER_HANDLERS[provider];
    if (!handler) {
      continue;
    }

    try {
      return await handler(prompt);
    } catch (error) {
      const wrappedError = createProviderError(provider, error);
      failures.push(wrappedError);
      console.warn(`[AI] ${provider} failed: ${wrappedError.message}`);
    }
  }

  if (failures.length > 0) {
    const finalError = failures[failures.length - 1];
    finalError.message = `All configured AI providers failed. ${failures
      .map((item) => item.message)
      .join(" ")}`;
    throw finalError;
  }

  throw new Error("No supported AI provider is configured.");
};
