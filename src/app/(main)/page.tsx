"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigationWarning } from "@/hooks/useNavigationWarning";
import { useUploadFile } from "better-upload/client";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [preview, setPreview] = useState<string>("");
  const [altText, setAltText] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [generatingAlt, setGeneratingAlt] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { upload, isPending, error } = useUploadFile({
    route: "image",
    onUploadProgress: (data) => {
      setUploadProgress(data.file.progress);
    },
    onUploadComplete: async (data) => {
      console.log("Upload complete:", data);
      setUploadedImageUrl(data.file.objectMetadata.url);
      setUploadProgress(100);

      // Automatically generate alt text after successful upload
      console.log("Generating alt text...", data.file.objectMetadata.url);

      await generateAltText("https://assets.moinulmoin.com/"+data.file.objectKey);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setAltText(`Upload failed: ${error.message}`);
    }
  });

  // Use navigation warning when upload is in progress
  useNavigationWarning({
    when: isPending || generatingAlt,
    message: "Are you sure you want to leave? Your upload progress will be lost."
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Reset previous state
      setAltText("");
      setUploadedImageUrl("");
      setUploadProgress(0);

      // Start upload
      await upload(file);
    }
  };

  const generateAltText = async (imageUrl: string) => {
    setGeneratingAlt(true);

    try {
      const response = await fetch("/api/altgen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();
      if (response.ok) {
        setAltText(data.altText);
      } else {
        setAltText(`Error: ${data.error}`);
      }
    } catch (error) {
      setAltText("Failed to generate alt text");
    } finally {
      setGeneratingAlt(false);
    }
  };

  const reset = () => {
    setPreview("");
    setAltText("");
    setUploadedImageUrl("");
    setUploadProgress(0);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-medium tracking-tight">Alt Text Generator</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload an image to generate descriptive alt text
                </p>
              </div>
            </div>

            <Card className="shadow-sm">
              <div className="p-6">
                {!preview ? (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-3 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        PNG, JPEG, or WebP (max 7MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={isPending}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img src={preview} alt="Preview" className="w-full aspect-auto object-contain rounded-lg " />
                      {(isPending || generatingAlt) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="animate-spin h-8 w-8 text-white mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <p className="text-white text-sm">
                              {isPending
                                ? `Uploading... ${uploadProgress}%`
                                : "Generating alt text..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-4 bg-destructive/10 rounded-lg">
                        <p className="text-xs text-destructive mb-1 font-medium uppercase tracking-wider">
                          Error
                        </p>
                        <p className="text-sm text-destructive/90">{error.message}</p>
                      </div>
                    )}

                    {altText && !error && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                          Generated Alt Text
                        </p>
                        <p className="text-sm">{altText}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={reset}
                        variant="outline"
                        className="flex-1"
                        disabled={isPending || generatingAlt}
                      >
                        Upload Another
                      </Button>
                      {altText && !error && (
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(altText);
                            toast.success("Alt text copied!");
                          }}
                          className="flex-1"
                        >
                          Copy Alt Text
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
  );
}
