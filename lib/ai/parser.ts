/**
 * Parses the AI response JSON and validates the structure.
 *
 * Expected format per field:
 * { "value": string | null, "confidence": number, "needsReview": boolean }
 */

export interface AIExtractedField {
  value: string | null;
  confidence: number;
  needsReview: boolean;
}

export interface AIProductResponse {
  brand: AIExtractedField;
  productType: AIExtractedField;
  gender: AIExtractedField;
  category: AIExtractedField;
  color: AIExtractedField;
  material: AIExtractedField;
  condition: AIExtractedField;
  size: AIExtractedField;
  seoTitle: AIExtractedField;
  seoDescription: AIExtractedField;
  chest: AIExtractedField;
  waist: AIExtractedField;
  length: AIExtractedField;
}

const REQUIRED_FIELDS = [
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
] as const;

/** Default empty field when AI response is malformed */
function emptyField(): AIExtractedField {
  return { value: null, confidence: 0, needsReview: true };
}

/** Validates and sanitizes a single extracted field */
function sanitizeField(raw: unknown): AIExtractedField {
  if (!raw || typeof raw !== "object") return emptyField();

  const obj = raw as Record<string, unknown>;

  const value =
    obj.value === null || obj.value === undefined
      ? null
      : String(obj.value).trim() || null;

  const rawConfidence =
    typeof obj.confidence === "number"
      ? obj.confidence
      : parseInt(String(obj.confidence), 10);

  const confidence = isNaN(rawConfidence)
    ? 0
    : Math.max(0, Math.min(100, rawConfidence));

  const needsReview =
    typeof obj.needsReview === "boolean"
      ? obj.needsReview
      : value === null || confidence < 70;

  return { value, confidence, needsReview };
}

/**
 * Parses the raw AI response text into a structured AIProductResponse.
 * Handles common formatting issues (markdown code blocks, trailing commas).
 */
export function parseAIResponse(text: string): AIProductResponse {
  try {
    // Strip markdown code blocks if present
    const clean = text
      .replace(/```json\s*/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Parsed response is not an object");
    }

    const result: AIProductResponse = {} as AIProductResponse;

    for (const field of REQUIRED_FIELDS) {
      result[field as keyof AIProductResponse] = sanitizeField(parsed[field]);
    }

    return result;
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    console.error("Raw text:", text);

    // Return all fields as Needs Review
    return {
      brand: emptyField(),
      productType: emptyField(),
      gender: emptyField(),
      category: emptyField(),
      color: emptyField(),
      material: emptyField(),
      condition: emptyField(),
      size: emptyField(),
      seoTitle: emptyField(),
      seoDescription: emptyField(),
      chest: emptyField(),
      waist: emptyField(),
      length: emptyField(),
    };
  }
}

/**
 * Maps AI extraction results to BulkProduct partial updates.
 * Only includes fields with high-confidence values.
 */
export function mapAIResponseToProduct(aiResponse: AIProductResponse): {
  updates: Record<string, string | null>;
  needsReview: string[];
} {
  const updates: Record<string, string | null> = {};
  const needsReview: string[] = [];

  const fieldMapping: Record<string, keyof AIProductResponse> = {
    brand: "brand",
    gender: "gender",
    category: "category",
    color: "color",
    material: "material",
    condition: "condition",
    size: "size",
    title: "seoTitle",
    description: "seoDescription",
    chest: "chest",
    waist: "waist",
    length: "length",
  };

  for (const [productField, aiField] of Object.entries(fieldMapping)) {
    const extracted = aiResponse[aiField];

    if (!extracted) {
      needsReview.push(productField);
      continue;
    }

    if (extracted.needsReview || extracted.confidence < 70) {
      needsReview.push(productField);
      // Still populate if there's a value, but mark for review
      if (extracted.value !== null) {
        updates[productField] = extracted.value;
      }
    } else if (extracted.value !== null) {
      updates[productField] = extracted.value;
    }
  }

  return { updates, needsReview };
}
