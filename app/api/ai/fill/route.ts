import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";
import { buildPrompt } from "@/lib/ai/prompt";
import { parseAIResponse } from "@/lib/ai/parser";

// Models to try in order of preference (v1beta-compatible)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-pro",
];

/**
 * Attempt AI generation with automatic model fallback.
 * If one model hits rate limit, tries the next.
 */
async function generateWithFallback(
  prompt: string,
  parts: { inlineData: { mimeType: string; data: string } }[],
): Promise<string> {
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
      if (text) return text;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { images }: { images: string[] } = body;

    if (!images?.length) {
      return NextResponse.json(
        { success: false, message: "No images provided." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt();

    // Send ALL images together as ONE product
    const imageParts = images.map((image) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: image,
      },
    }));

    const text = await generateWithFallback(prompt, imageParts);

    const parsed = parseAIResponse(text);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    const msg =
      error instanceof Error ? error.message : "AI generation failed.";

    const isQuotaError =
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("resource_exhausted") ||
      msg.toLowerCase().includes("429") ||
      msg.toLowerCase().includes("rate limit");

    return NextResponse.json(
      {
        success: false,
        message: isQuotaError
          ? "AI service is temporarily unavailable due to rate limits. Please try again in a few minutes."
          : msg,
        isQuotaError,
      },
      { status: isQuotaError ? 429 : 500 },
    );
  }
}
