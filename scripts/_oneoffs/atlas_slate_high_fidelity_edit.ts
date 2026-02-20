/**
 * One-off: high-fidelity edit for Atlas Sectional Slate Gray hero only.
 * Uses OpenAI Responses API with image_generation tool (action: edit, input_fidelity: high).
 * Used ONLY by scripts/generate_atlas_slate_hero.ts.
 */

import { readFile, stat, writeFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { getOpenAiApiKey } from "../../lib/openaiServer";

const MIN_OUTPUT_BYTES = 20_000;

/**
 * Locked recolor prompt: only fabric hue; no geometry, lighting, or scene changes.
 */
export function buildAtlasSlateLockedRecolorPrompt(colorName: string): string {
  return `Recolor ONLY the sofa upholstery fabric to ${colorName}. Do not change: silhouette, proportions, arm shape, cushion geometry, seam placement, piping, stitching, legs, camera angle, perspective, crop, lighting, shadows, or background. Preserve texture detail and stitching exactly. No redesign, no smoothing, no added or removed wrinkles, no changed seams. Output should be identical except for the fabric hue.`;
}

export interface GenerateAtlasSlateHeroParams {
  inputImagePath: string;
  outputImagePath: string;
  colorName: string;
  /** Image model for the tool (e.g. gpt-image-1.5). */
  model?: string;
  /** Mainline model for Responses API. Default gpt-4.1-mini. Set OPENAI_RESPONSES_MODEL to override. */
  mainlineModel?: string;
  dryRun?: boolean;
}

function log403Context(
  mainlineModel: string,
  imageModel: string,
  err: { status?: number; message?: string; type?: string; code?: string | null; requestID?: string }
): void {
  console.error("mainlineModel:", mainlineModel);
  console.error("imageModel:", imageModel);
  console.error("HTTP status:", err.status);
  console.error("error.message:", err.message ?? "(none)");
  if (err.type != null) console.error("error.type:", err.type);
  if (err.code != null) console.error("error.code:", err.code);
  const requestId = err.requestID ?? (err as { request_id?: string }).request_id;
  if (requestId != null) console.error("request id:", requestId);
}

/**
 * Generate Atlas Slate hero using Responses API image_generation tool with edit + high input_fidelity.
 */
export async function generateAtlasSlateHeroHighFidelityEdit(
  params: GenerateAtlasSlateHeroParams
): Promise<void> {
  const {
    inputImagePath,
    outputImagePath,
    colorName,
    model: imageModel = "gpt-image-1.5",
    mainlineModel: mainlineParam,
    dryRun = false,
  } = params;
  let mainlineModel = mainlineParam ?? process.env.OPENAI_RESPONSES_MODEL ?? "gpt-4o-mini";

  const apiKey = await getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment.");
  }

  const inputBuffer = await readFile(inputImagePath);
  const ext = path.extname(inputImagePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = inputBuffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  const prompt = buildAtlasSlateLockedRecolorPrompt(colorName);

  if (dryRun) {
    console.log("[dry-run] Would call Responses API with prompt:", prompt.slice(0, 80) + "...");
    return;
  }

  const client = new OpenAI({ apiKey });

  const imageModelTool = (imageModel === "chatgpt-image-latest" ? "gpt-image-1.5" : imageModel) as "gpt-image-1.5";

  const doCreate = (mainline: string) =>
    client.responses.create({
      model: mainline,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text" as const, text: prompt },
            { type: "input_image" as const, image_url: dataUrl, detail: "auto" as const },
          ],
        },
      ],
      tools: [
        {
          type: "image_generation",
          action: "edit",
          input_fidelity: "high",
          model: imageModelTool,
          output_format: "png",
        },
      ],
      tool_choice: { type: "image_generation" },
    });

  let response: Awaited<ReturnType<typeof doCreate>>;
  try {
    response = await doCreate(mainlineModel);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; type?: string; code?: string | null; requestID?: string };
    log403Context(mainlineModel, imageModel, e);
    if (e.status === 403 && e.message?.includes(mainlineModel) && !e.message?.includes("gpt-image-1.5")) {
      mainlineModel = "gpt-4.1-mini";
      try {
        response = await doCreate(mainlineModel);
      } catch (retryErr: unknown) {
        const re = retryErr as { status?: number; message?: string; type?: string; code?: string | null; requestID?: string };
        log403Context(mainlineModel, imageModel, re);
        throw new Error(
          `403 after retry with gpt-4.1-mini. Likely cause: mainline model access (${mainlineModel}) or image model (${imageModel}) requires org verification.`
        );
      }
    } else {
      if (e.status === 403) {
        const likely = e.message?.includes("gpt-image-1.5")
          ? "image model (gpt-image-1.5)"
          : "mainline model (" + mainlineModel + ")";
        throw new Error(`OpenAI 403. Likely cause: ${likely} requires org verification.`);
      }
      throw err;
    }
  }

  const imageCall = response.output?.find(
    (item: { type?: string }) => item.type === "image_generation_call"
  ) as { id?: string; result?: string | null; status?: string } | undefined;

  if (!imageCall?.result) {
    const errDetail =
      imageCall?.status === "failed"
        ? " image_generation_call failed"
        : !response.output?.length
          ? " empty output"
          : " no image_generation_call result";
    throw new Error("OpenAI Responses API returned no image." + errDetail);
  }

  const imageBytes = Buffer.from(imageCall.result, "base64");

  await writeFile(outputImagePath, imageBytes);

  const st = await stat(outputImagePath);
  const bytesWritten = st.size;
  if (bytesWritten < MIN_OUTPUT_BYTES) {
    throw new Error(
      `Output file too small (${bytesWritten} bytes). Minimum ${MIN_OUTPUT_BYTES} bytes.`
    );
  }

  console.log("model used:", imageModel);
  console.log("mainline model:", mainlineModel);
  console.log("request id:", (response as { id?: string }).id ?? "n/a");
  console.log("output path:", outputImagePath, "bytes written:", bytesWritten);
}
