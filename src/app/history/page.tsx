"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HistoryItem {
  id: string;
  imageName: string | null;
  imageSize: number | null;
  imageMimeType: string;
  imageData: string;
  altText: string;
  processingTimeMs: number | null;
  createdAt: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
              History
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Your generated alt texts
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Back to Generator
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="p-12 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading history...
              </p>
            </div>
          </Card>
        ) : history.length === 0 ? (
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="p-12 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Generate an alt text to see history
              </p>
              <Link href="/">
                <Button
                  className="mt-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                >
                  Generate Your First Alt Text
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <Card
                key={item.id}
                className="border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.imageData}
                      alt={item.altText}
                      className="w-24 h-24 object-cover rounded-lg bg-neutral-100 dark:bg-neutral-900"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-neutral-900 dark:text-neutral-100 font-medium mb-2">
                      {item.altText}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{item.imageName || "Unnamed image"}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.processingTimeMs}ms</span>
                      {item.imageSize && (
                        <>
                          <span>•</span>
                          <span>{(item.imageSize / 1024).toFixed(1)}KB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}