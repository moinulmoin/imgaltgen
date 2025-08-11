"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HistoryItem {
  id: string;
  imageUrl: string;
  altText: string;
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
    <div className="min-h-screen bg-background py-12">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              History
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your generated alt texts
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              Back to Generator
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="shadow-sm">
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Loading history...
              </p>
            </div>
          </Card>
        ) : history.length === 0 ? (
          <Card className="shadow-sm">
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Generate an alt text to see history
              </p>
              <Link href="/">
                <Button className="mt-4">
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
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.altText}
                      className="w-24 h-24 object-cover rounded-lg bg-muted"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium mb-2">
                      {item.altText}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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