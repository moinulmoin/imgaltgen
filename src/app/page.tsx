"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [altText, setAltText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAltText("");
    }
  };

  const generateAltText = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("/api/altgen", {
        method: "POST",
        body: formData,
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
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview("");
    setAltText("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="w-full max-w-md px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
              Alt Text Generator
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Upload an image to generate descriptive alt text
            </p>
          </div>
          <Link href="/history">
            <Button
              variant="ghost"
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              History
            </Button>
          </Link>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="p-6">
            {!preview ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3 text-neutral-400"
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
                  <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    PNG or JPEG
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-contain"
                  />
                </div>

                {altText && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium uppercase tracking-wider">
                      Generated Alt Text
                    </p>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {altText}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={generateAltText}
                    disabled={loading}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
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
                        Generating...
                      </span>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}