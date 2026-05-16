import { getSubscriptionPrompt, getHiddenFeePrompt } from "./prompts.js";
import DEMO_CHARGES from "./demoData.js";

const API_URL = "https://api.anthropic.com/v1/messages";

export const DEMO_MODE = !import.meta.env.VITE_ANTHROPIC_KEY;

class AnalysisError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type; // 'api' | 'parse' | 'empty'
  }
}

async function callClaude(prompt) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    throw new AnalysisError(`Network error: ${err.message}`, "api");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new AnalysisError(`Claude API error ${res.status}: ${body}`, "api");
  }

  const data = await res.json();
  const raw = data?.content?.[0]?.text;

  if (!raw) {
    throw new AnalysisError("Claude returned an empty response.", "empty");
  }

  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(stripped);
  } catch {
    console.error("[analyzeCharges] Raw response that failed to parse:\n", stripped);
    throw new AnalysisError(
      "Analysis incomplete — the model returned an unexpected format. Try uploading again.",
      "parse"
    );
  }
}

async function analyzeCharges(statementText) {
  if (!statementText || typeof statementText !== "string") {
    throw new AnalysisError("Statement text must be a non-empty string.", "api");
  }

  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    return DEMO_CHARGES;
  }

  const [subscriptions, hiddenFees] = await Promise.all([
    callClaude(getSubscriptionPrompt(statementText)).catch((err) => {
      throw new AnalysisError(`Subscription analysis failed: ${err.message}`, err.type ?? "api");
    }),
    callClaude(getHiddenFeePrompt(statementText)).catch((err) => {
      throw new AnalysisError(`Hidden fee analysis failed: ${err.message}`, err.type ?? "api");
    }),
  ]);

  const deduplicatedFees = hiddenFees.map((item) => ({
    ...item,
    id: `hidden-${item.id ?? Math.random().toString(36).slice(2)}`,
    isHidden: true,
  }));

  return [...subscriptions, ...deduplicatedFees];
}

export default analyzeCharges;
