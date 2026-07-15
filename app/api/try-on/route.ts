import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { userImageBase64, garmentImageUrl } = await req.json();

    if (!userImageBase64 || !garmentImageUrl) {
      return NextResponse.json({ error: 'Missing images' }, { status: 400 });
    }

    // Fetch garment image and convert to base64
    const garmentResponse = await fetch(garmentImageUrl);
    const garmentBuffer = await garmentResponse.arrayBuffer();
    const garmentBase64 = Buffer.from(garmentBuffer).toString('base64');
    const garmentMimeType = garmentResponse.headers.get('content-type') || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: userImageBase64.split(',')[1] || userImageBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: 'Virtual try-on: Edit this image so the person is wearing the exact same clothing item shown in the second image. Make it look photorealistic and perfectly fitted.',
          },
          {
             inlineData: {
                data: garmentBase64,
                mimeType: garmentMimeType
             }
          }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '3:4',
          imageSize: '1K'
        }
      }
    });

    let generatedImageUrl = '';
    
    // @ts-ignore
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: generatedImageUrl });

  } catch (error: any) {
    console.error('Virtual Try-On Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
