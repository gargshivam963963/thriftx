import { NextRequest, NextResponse } from "next/server";
import { Modality } from "@google/genai";
import type { GenerateContentConfig } from "@google/genai";
import { ai } from "@/lib/ai/gemini";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

/**
 * THRIFTX — AI Cover API (admin only)
 *
 * Takes the front photo of a product and returns a retail-ready **main cover
 * image**: the exact same garment (colour, print, logos, stitching, wear and
 * silhouette reproduced 1:1) placed on a clean studio backdrop with even
 * lighting and a soft contact shadow, so the listing looks premium without the
 * product looking different from what the buyer actually receives.
 *
 * The model is instructed to touch ONLY the background/presentation. If it
 * cannot return an image this route fails loudly and the caller falls back to
 * the original photo — an upload is never blocked by this endpoint.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

/** Image models, tried in order until one returns an image. */
const MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
];

/** Max bytes for the (already client-compressed) source photo. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Valid image MIME types accepted as a source photo. */
const VALID_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

function errorResponse(
  message: string,
  status: number,
  code: string,
) {
  return NextResponse.json(
    { success: false, message, code },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

/** Strip a leading `data:*;base64,` prefix if the model returned one. */
function stripDataUrl(value: string): {
  mimeType: string;
  data: string;
} {
  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(value);
  if (!match) return { mimeType: "image/png", data: value };
  return {
    mimeType: match[1] || "image/png",
    data: match[3] ?? "",
  };
}

/**
 * Identity-preserving cover prompt.
 * The "must stay identical" block comes first so it carries the most weight.
 */
const COVER_PROMPT = `You are producing the MAIN COVER (hero image) for an online thrift-fashion listing from the supplied product photograph.

=== ABSOLUTE CONSTRAINT: THE PRODUCT MUST NOT CHANGE ===
Reproduce the garment EXACTLY as it appears in the source photo. It must be impossible to tell the two apart:
- Identical colour, colourway, fabric texture, weave and sheen.
- Identical print, graphics, embroidery, logos, labels, hangtags and typography.
- Identical construction: seams, stitching, buttons, zips, drawstrings, panels, ribbing, cuffs, collar.
- Identical silhouette, proportions, drape, folds, creases, fading, pilling, distressing and any wear or flaws.
- Identical camera angle, framing, crop, scale and position of the product within the frame.
- NEVER add, remove, restyle, recolour, smooth, retouch, resize or "improve" any part of the product itself.
- No models, mannequins, hands, hangers, stands or props.

=== THE ONLY THINGS YOU MAY CHANGE: background + presentation ===
- Replace the background with a seamless studio backdrop: a subtle vertical gradient from pure white (#FFFFFF) at the top to a soft cool grey (#F1F1F3) at the bottom. Clean, even, distraction-free — no texture, no clutter, no visible room or floor line.
- Add a soft, realistic contact shadow directly beneath the garment so it sits naturally.
- Keep lighting neutral and even, like a professional softbox setup. Lift contrast very slightly and keep white balance neutral.
- Do NOT shift exposure enough to change the product's apparent colour.

=== OUTPUT ===
- A single square (1:1) image at the highest available resolution.
- The product centred with comfortable, symmetric margin.
- No text, no watermark, no logo, no border, no price overlay — except logos already physically on the product.`;

interface CoverResult {
  mimeType: string;
  data: string;
  model: string;
}

/**
 * Attempt image generation with automatic model + config fallback.
 * Returns the first base64 image any attempt produces.
 */
async function generateCover(
  mimeType: string,
  data: string,
): Promise<CoverResult> {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    // Preferred: explicitly request IMAGE output. Fallback: let the model decide.
    const configs: (GenerateContentConfig | undefined)[] = [
      { responseModalities: [Modality.IMAGE] },
      undefined,
    ];

    for (const config of configs) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: COVER_PROMPT },
                { inlineData: { mimeType, data } },
              ],
            },
          ],
          config,
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];

        for (const part of parts) {
          const inline = part.inlineData;
          if (!inline?.data) continue;

          const cleaned = stripDataUrl(inline.data);
          if (cleaned.data.length > 0) {
            return {
              mimeType: inline.mimeType || cleaned.mimeType,
              data: cleaned.data,
              model,
            };
          }
        }

        lastError = new Error(`${model} returned no image data.`);
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error("Image generation failed.");
      }
    }
  }

  throw lastError ?? new Error("Image generation failed.");
}

export async function POST(req: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  const startedAt = Date.now();

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return errorResponse(
        "Expected a multipart form upload.",
        400,
        "VALIDATION",
      );
    }

    const form = await req.formData();
    const entry = form.get("images");

    if (!entry || typeof entry === "string") {
      return errorResponse(
        "Please provide a product photo.",
        400,
        "VALIDATION",
      );
    }

    const file = entry;

    if (!VALID_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        `Unsupported image type "${file.type || "unknown"}".`,
        400,
        "VALIDATION",
      );
    }

    if (file.size === 0) {
      return errorResponse(
        "The provided image is empty.",
        400,
        "VALIDATION",
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return errorResponse(
        "The image exceeded the maximum allowed size.",
        413,
        "PAYLOAD_TOO_LARGE",
      );
    }

    const data = Buffer.from(
      await file.arrayBuffer(),
    ).toString("base64");

    const result = await generateCover(file.type, data);

    const durationMs = Date.now() - startedAt;

    // Structured logging — never log Base64.
    console.info("[api/ai/cover] success", {
      durationMs,
      mimeType: result.mimeType,
      model: result.model,
      sourceBytes: file.size,
      outputBytes: Math.round((result.data.length * 3) / 4),
    });

    return NextResponse.json(
      {
        success: true,
        data: { mimeType: result.mimeType, data: result.data },
        meta: { durationMs, model: result.model },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const msg =
      error instanceof Error
        ? error.message
        : "Cover generation failed.";

    const isQuotaError =
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("resource_exhausted") ||
      msg.toLowerCase().includes("429") ||
      msg.toLowerCase().includes("rate limit");

    console.error("[api/ai/cover] error", {
      durationMs,
      isQuotaError,
      // Log only a sanitized, non-sensitive message prefix.
      hint: msg.split(".").slice(0, 2).join(".").slice(0, 140),
    });

    if (isQuotaError) {
      return errorResponse(
        "AI cover generation is temporarily rate limited. Please try again in a few minutes.",
        429,
        "RATE_LIMITED",
      );
    }

    return errorResponse(
      "AI cover generation failed. The original photo is used instead.",
      500,
      "AI_ERROR",
    );
  }
}
