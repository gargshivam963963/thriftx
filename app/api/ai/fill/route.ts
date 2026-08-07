import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";
import { buildPrompt } from "@/lib/ai/prompt";
import { parseAIResponse } from "@/lib/ai/parser";
import type {
  AIFillRequest,
  AIProductResponse,
  AIFillErrorCode,
} from "@/lib/ai/types";

/**
 * THRIFTX — AI Fill API
 *
 * Production architecture:
 *   Client compresses images → uploads to Appwrite Storage
 *   → sends ONLY Appwrite public URLs here.
 *
 * This endpoint NEVER receives Base64 image data.
 * It fetches image bytes server-side and calls Gemini.
 */

// Models to try in order of preference (v1beta-compatible)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-pro",
];

/** Max images allowed. */
const MAX_IMAGES = 10;

/** Max bytes per fetched image (e.g. 8MB). */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Valid image MIME types for Gemini inline data. */
const VALID_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/**
 * Validate the request payload.
 * Returns a friendly error message or null when valid.
 */
function validatePayload(body: AIFillRequest): string | null {
  if (!body || typeof body !== "object") {
    return "Invalid request payload.";
  }

  const { imageUrls } = body;

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return "No image URLs provided.";
  }

  if (imageUrls.length > MAX_IMAGES) {
    return `Maximum ${MAX_IMAGES} images per request.`;
  }

  for (const url of imageUrls) {
    if (typeof url !== "string" || !url.startsWith("http")) {
      return "Invalid image URL provided.";
    }
  }

  return null;
}

/**
 * Fetch an image from a public/signed URL and return
 * a Gemini-compatible inlineData part.
 */
async function urlToInlineData(
  url: string,
): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(url, {
    headers: { "User-Agent": "ThriftX-AI/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image (status ${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const mimeType = contentType.split(";")[0].trim() || "image/jpeg";

  if (!VALID_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("An image exceeded the maximum allowed size.");
  }

  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return { mimeType, data: base64 };
}

/**
 * Attempt AI generation with automatic model fallback.
 * If one model hits rate limit, tries the next.
 */
async function generateWithFallback(
  prompt: string,
  parts: { inlineData: { mimeType: string; data: string } }[],
): Promise<{ text: string; model: string }> {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              brand: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              productType: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              gender: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              category: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              color: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              material: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              condition: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              size: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              seoTitle: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              seoDescription: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              chest: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              waist: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
              length: {
                type: "object",
                properties: {
                  value: { type: "string", nullable: true },
                  confidence: { type: "number" },
                  needsReview: { type: "boolean" },
                },
                required: ["value", "confidence", "needsReview"],
              },
            },
            required: [
              "brand",
              "productType",
              "gender",
              "category",
              "color",
              "material",
              "condition",
              "size",
              "seoTitle",
              "seoDescription",
              "chest",
              "waist",
              "length",
            ],
          },
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, ...parts],
          },
        ],
      });

      const text = response.text ?? "";
      if (text) return { text, model };

      lastError = new Error(`Empty response from ${model}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message.toLowerCase();

      // Fallback on quota/resource exhausted OR model not found errors
      if (
        msg.includes("quota") ||
        msg.includes("resource_exhausted") ||
        msg.includes("429") ||
        msg.includes("rate limit") ||
        msg.includes("not found") ||
        msg.includes("not supported") ||
        msg.includes("404")
      ) {
        console.warn(
          `Model ${model} unavailable (${msg.split(".")[0]}), trying next...`,
        );
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("All AI models exhausted their quotas.");
}

/** Build a user-safe error response. Never exposes raw internals. */
function errorResponse(
  message: string,
  code: AIFillErrorCode,
  status: number,
  isQuotaError = false,
) {
  return NextResponse.json(
    { success: false, message, code, isQuotaError },
    { status },
  );
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    let body: AIFillRequest;
    try {
      body = (await req.json()) as AIFillRequest;
    } catch {
      return errorResponse("Invalid JSON payload.", "VALIDATION", 400);
    }

    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError, code: "VALIDATION" },
        { status: 400 },
      );
    }

    const { imageUrls, analyzeAllImages = false, productId } = body;

    const prompt = buildPrompt(analyzeAllImages);

    // Fetch images server-side (never trust client base64).
    const imageParts: { inlineData: { mimeType: string; data: string } }[] = [];
    for (const url of imageUrls) {
      const part = await urlToInlineData(url);
      imageParts.push({ inlineData: part });
    }

    const { text, model } = await generateWithFallback(prompt, imageParts);

    const parsed: AIProductResponse = parseAIResponse(text);

    const durationMs = Date.now() - startedAt;

    // Structured logging — never log Base64 or sensitive info.
    console.info("[api/ai/fill] success", {
      productId: productId ?? null,
      imageCount: imageUrls.length,
      analyzeAllImages,
      durationMs,
      model,
    });

    return NextResponse.json({
      success: true,
      data: parsed,
      meta: {
        durationMs,
        imageCount: imageUrls.length,
        retryCount: 0,
        model,
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const msg =
      error instanceof Error ? error.message : "AI generation failed.";

    const isQuotaError =
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("resource_exhausted") ||
      msg.toLowerCase().includes("429") ||
      msg.toLowerCase().includes("rate limit");

    console.error("[api/ai/fill] error", {
      durationMs,
      isQuotaError,
      code: isQuotaError
        ? "RATE_LIMITED"
        : msg.includes("fetch")
          ? "NETWORK_ERROR"
          : "AI_ERROR",
      // Log only a sanitized, non-sensitive message prefix.
      hint: msg.split(".")[0].slice(0, 120),
    });

    if (isQuotaError) {
      return errorResponse(
        "AI service is temporarily unavailable due to rate limits. Please try again in a few minutes.",
        "RATE_LIMITED",
        429,
        true,
      );
    }

    return errorResponse(
      "AI processing failed. Please try again.",
      "AI_ERROR",
      500,
    );
  }
}
