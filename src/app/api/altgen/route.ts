import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const systemPrompt = `
Task: Create alt text for the provided image.

Strict Requirements:
1. EXACTLY ONE SENTENCE - No periods except at the end
2. Maximum 125 characters total
3. Factual description only
4. Never start with "Image of", "Photo of", "Picture of", etc.
5. Special cases:
   - Purely decorative image → Output: []
   - Cannot determine content → Output: [unclear image]

Format: Single complete sentence ending with one period.

Input image:
`

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Supported types: JPEG, PNG' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    // Calculate image hash for duplicate detection
    const imageHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Generate alt text for this image',
            },
            {
              type: 'file',
              data: base64,
              mediaType: image.type,
            },
          ],
        },
      ],
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    });

    const processingTimeMs = Date.now() - startTime;

    // Save to database with image data
    const generation = await prisma.altTextGeneration.create({
      data: {
        imageName: image.name,
        imageSize: image.size,
        imageMimeType: image.type,
        imageHash,
        imageData: `data:${image.type};base64,${base64}`, // Store as data URL for easy display
        altText: text,
        processingTimeMs,
      },
    });

    return NextResponse.json({ 
      altText: text,
      id: generation.id,
      processingTimeMs 
    });
  } catch (error) {
    console.error('Error generating alt text:', error);
    return NextResponse.json(
      { error: 'Failed to generate alt text' },
      { status: 500 }
    );
  }
}