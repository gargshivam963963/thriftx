import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";
import { buildPrompt } from "@/lib/ai/prompt";
import { parseAIResponse } from "@/lib/ai/parser";

// Models to try in order of preference (v1beta-compatible)
// gemini-1.5-flash and gemini-1.5-pro are NOT available on v1beta — only use v1-compatible models
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
  parts:
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }[],
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
              title: { type: "string" },
              brand: { type: "string" },
              category: { type: "string" },
              size: { type: "string" },
              condition: { type: "string" },
              color: { type: "string" },
              material: { type: "string" },
              description: { type: "string" },
            },
            required: [
              "title",
              "brand",
              "category",
              "size",
              "condition",
              "color",
              "material",
              "description",
            ],
          },
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, ...(Array.isArray(parts) ? parts : [])],
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
        // Wait briefly before trying next model
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // For other errors (auth, invalid request, etc.), throw immediately
      throw lastError;
    }
  }

  throw lastError ?? new Error("All AI models exhausted their quotas.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      images,
      selectedFields,
    }: {
      images: string[];
      selectedFields: string[];
    } = body;

    if (!images?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No images provided.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = buildPrompt(selectedFields);

    const imageParts = images.map((image) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: image,
      },
    }));

    const text = await generateWithFallback(prompt, imageParts as never);

    const json = parseAIResponse(text);

    return NextResponse.json({
      success: true,
      data: json,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    const msg =
      error instanceof Error ? error.message : "AI generation failed.";

    // Check if it's a quota error
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
      {
        status: isQuotaError ? 429 : 500,
      },
    );
  }
}
