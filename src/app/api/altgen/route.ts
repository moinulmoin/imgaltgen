import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCredits, consumeCredit } from "@/lib/ratelimit";
import { s3Client } from "@/lib/upload";
import { google } from "@ai-sdk/google";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

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
`;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has credits
    const creditCheck = await checkCredits(session.user.id);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: "Daily credit limit reached",
          remaining: creditCheck.remaining,
          reset: creditCheck.reset,
          resetDate: creditCheck.resetDate,
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 },
      );
    }

    // Extract file extension and determine MIME type
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();

    const mimeTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    const imageMimeType = mimeTypeMap[ext || ""];

    if (!imageMimeType) {
      return NextResponse.json(
        { error: "Invalid image type. Supported types: JPEG, PNG, JPG, WEBP" },
        { status: 400 },
      );
    }

    try {
      // Generate alt text using AI
      const { text } = await generateText({
        model: google("gemini-2.5-flash-lite-preview-09-2025"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate alt text for this image",
              },
              {
                type: "file",
                data: imageUrl,
                mediaType: imageMimeType,
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

      // Only consume credit after successful generation
      const creditConsumed = await consumeCredit(session.user.id);

      if (!creditConsumed.success) {
        // This shouldn't happen since we checked earlier, but handle it just in case
        return NextResponse.json(
          {
            error: "Failed to consume credit",
            altText: text, // Still return the alt text since it was generated
          },
          { status: 500 },
        );
      }

      // Save to database with user relationship
      await prisma.altTextGeneration.create({
        data: {
          userId: session.user.id,
          imageUrl,
          altText: text,
        },
      });

      return NextResponse.json({
        altText: text,
        creditsRemaining: creditConsumed.remaining,
      });
    } catch (error) {
      // If alt text generation fails, delete the uploaded image from R2
      console.error(
        "Error generating alt text, cleaning up uploaded image:",
        error,
      );

      try {
        // Extract the key from the URL
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME as string,
            Key: key,
          }),
        );

        console.log("Successfully deleted image from R2:", key);
      } catch (deleteError) {
        console.error("Failed to delete image from R2:", deleteError);
      }

      throw error;
    }
  } catch (error) {
    console.error("Error in alt text generation:", error);
    return NextResponse.json(
      { error: "Failed to generate alt text" },
      { status: 500 },
    );
  }
}
