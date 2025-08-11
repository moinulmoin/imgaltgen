"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <nav className="flex justify-between p-4">
          <Link href="/" className="font-bold">
            ImgAltGen
          </Link>

          <Link href="/history" className="hover:underline underline-offset-4">
            History
          </Link>

          <Link href="/login" className={buttonVariants({ variant: "default" })}>
            Login
          </Link>
        </nav>

        <div className="w-full max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground mt-2">Your generated alt texts</p>
          </div>

          {loading ? (
            <Card className="shadow-sm">
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">Loading history...</p>
              </div>
            </Card>
          ) : history.length === 0 ? (
            <Card className="shadow-sm">
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">Generate an alt text to see history</p>
                <Link href="/">
                  <Button className="mt-4">Generate Your First Alt Text</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="shadow-sm hover:shadow-md transition-shadow p-0 rounded-lg"
                >
                  <div className="p-2 flex flex-col gap-2 items-center">
                    <div className="flex-shrink-0 relative w-full h-32">
                      <Image
                        src={item.imageUrl}
                        alt={item.altText}
                        fill
                        className="object-contain aspect-auto rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.altText}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
