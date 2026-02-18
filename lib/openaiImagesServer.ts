/**
 * Server-only OpenAI image generation helpers.
 * Uses the OpenAI Images API with a reference image (edit) to keep sofa identity.
 * DALL-E 2 edits only accept PNG, so JPG/WebP references are converted first.
 *
 * Never logs secrets. Do not import from client code.
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getOpenAiApiKey } from "./openaiServer";

export async function generateHeroImageFromReference(opts: {
  referenceImagePath: string;
  prompt: string;
  size: string; // e.g. "1024x1024"
}): Promise<{ buffer: Buffer; mime: "image/png" }> {
  const apiKey = await getOpenAiApiKey();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in server environment.");

  const referenceBuffer = await readFile(opts.referenceImagePath);
  const ext = path.extname(opts.referenceImagePath).toLowerCase();
  // Edits API only accepts PNG with RGBA/LA/L (has alpha). Convert and ensure alpha.
  const pngBuffer =
    ext === ".png"
      ? await sharp(referenceBuffer).ensureAlpha().png().toBuffer()
      : await sharp(referenceBuffer).ensureAlpha().png().toBuffer();

  const form = new FormData();
  form.append("model", "dall-e-2");
  form.append("prompt", opts.prompt);
  form.append("size", opts.size);
  form.append("response_format", "b64_json");
  form.append(
    "image",
    new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }),
    path.basename(opts.referenceImagePath, ext) + ".png"
  );

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI images request failed (${res.status}). ${text.slice(0, 220)}`);
  }

  const json = (await res.json()) as any;
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64 || typeof b64 !== "string") {
    throw new Error("OpenAI images response missing b64_json.");
  }

  return { buffer: Buffer.from(b64, "base64"), mime: "image/png" };
}

