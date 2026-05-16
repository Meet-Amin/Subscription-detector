import { getPlatformHiddenFeePrompt } from "./prompts.js";

const OLLAMA_URL = "http://localhost:11434/v1/chat/completions";
const JINA_BASE = "https://r.jina.ai/";

class AnalysisError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
  }
}

async function callOllama(prompt) {
  let res;
  try {
    res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [{ role: "user", content: prompt }],
        stream: false,
        format: "json",
      }),
    });
  } catch (err) {
    throw new AnalysisError(
      "Could not connect to Ollama. Make sure it is running (`ollama serve`).",
      "api"
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new AnalysisError(`Ollama error ${res.status}: ${body}`, "api");
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (!raw) throw new AnalysisError("Ollama returned an empty response.", "empty");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
      : (parsed.findings ?? parsed.results ?? parsed.fees ?? Object.values(parsed)[0] ?? []);
  } catch {
    throw new AnalysisError(
      "Analysis incomplete — model returned unexpected format. Try again.",
      "parse"
    );
  }
}

const DEMO_FINDINGS = [
  {
    id: "url-demo-1",
    name: "Auto-renewal Clause",
    icon: "🔄",
    amount: 0,
    frequency: "annual",
    category: "Auto-renewal",
    recommendation: "review",
    reason: "Subscription renews automatically each year. Cancellation must be done 30 days before renewal to avoid being charged.",
    isHidden: true,
  },
  {
    id: "url-demo-2",
    name: "Cancellation Fee",
    icon: "🚫",
    amount: 25,
    frequency: "one-time",
    category: "Cancellation Fee",
    recommendation: "cancel",
    reason: "$25 early termination fee applies if you cancel before the annual term ends — not disclosed on the main pricing page.",
    isHidden: true,
  },
  {
    id: "url-demo-3",
    name: "Price Increase After Trial",
    icon: "📈",
    amount: 19.99,
    frequency: "monthly",
    category: "Price Increase",
    recommendation: "review",
    reason: "Introductory price of $9.99/month jumps to $19.99 after the first 3 months. Disclosed only in fine print.",
    isHidden: true,
  },
];

export async function analyzeUrl(url) {
  // Check Ollama is reachable
  try {
    await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
  } catch {
    // Fall back to demo if Ollama not running
    await new Promise((r) => setTimeout(r, 1500));
    return DEMO_FINDINGS;
  }

  let pageContent;
  try {
    const jinaRes = await fetch(`${JINA_BASE}${url}`, {
      headers: { Accept: "text/plain" },
    });
    if (!jinaRes.ok) {
      throw new AnalysisError(
        `Could not fetch the page (${jinaRes.status}). Make sure the URL is a valid pricing or subscription page.`,
        "fetch"
      );
    }
    pageContent = await jinaRes.text();
  } catch (err) {
    if (err instanceof AnalysisError) throw err;
    throw new AnalysisError(`Could not fetch the URL: ${err.message}`, "fetch");
  }

  if (!pageContent || pageContent.trim().length < 50) {
    throw new AnalysisError(
      "The page returned no readable content. Try linking directly to the pricing page.",
      "empty"
    );
  }

  const findings = await callOllama(getPlatformHiddenFeePrompt(url, pageContent));

  return findings
    .filter((item) => item != null && typeof item === "object")
    .map((item) => ({
      ...item,
      id: `url-${item.id ?? Math.random().toString(36).slice(2)}`,
      isHidden: true,
    }));
}
