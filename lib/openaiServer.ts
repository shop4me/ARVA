/**
 * Server-only OpenAI helper (Node scripts + Next server).
 * Reads OPENAI_API_KEY from process.env. Never logs secrets.
 */

import { readFile } from "fs/promises";
import path from "path";

type ChatJsonResponse<T> = {
  ok: true;
  value: T;
};

type ChatJsonError = {
  ok: false;
  error: string;
};

export async function openAiChatJson<T>(opts: {
  model: string;
  temperature: number;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<ChatJsonResponse<T> | ChatJsonError> {
  const apiKey = await getOpenAiApiKey();
  if (!apiKey) {
    return { ok: false, error: "Missing OPENAI_API_KEY in server environment." };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `OpenAI request failed (${res.status}). ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return { ok: false, error: "OpenAI response missing content." };
    }

    let parsed: T;
    try {
      parsed = JSON.parse(content) as T;
    } catch {
      return { ok: false, error: "OpenAI returned invalid JSON." };
    }

    return { ok: true, value: parsed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown OpenAI error." };
  }
}

let cachedKey: string | null | undefined;

async function getOpenAiApiKey(): Promise<string | null> {
  if (cachedKey !== undefined) return cachedKey;
  if (process.env.OPENAI_API_KEY) {
    cachedKey = process.env.OPENAI_API_KEY;
    return cachedKey;
  }

  // For local scripts: Next automatically loads .env.local, but raw Node scripts do not.
  // We safely read it here as a convenience, without ever logging the value.
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const raw = await readFile(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (!trimmed.startsWith("OPENAI_API_KEY=")) continue;
      const value = trimmed.slice("OPENAI_API_KEY=".length).trim();
      if (value) {
        process.env.OPENAI_API_KEY = value;
        cachedKey = value;
        return value;
      }
    }
  } catch {
    // ignore
  }

  cachedKey = null;
  return null;
}

