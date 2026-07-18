import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";
import { buildPrompt } from "@/lib/ai/prompt";
import { parseAIResponse } from "@/lib/ai/parser";

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

    const parts = [
      {
        text: prompt,
      },
      ...images.map((image) => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: image,
        },
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",

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
          parts,
        },
      ],
    });

    const text = response.text ?? "";

    const json = parseAIResponse(text);

    return NextResponse.json({
      success: true,
      data: json,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "AI generation failed.",
      },
      {
        status: 500,
      },
    );
  }
}
