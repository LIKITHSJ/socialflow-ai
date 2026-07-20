"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Sentiment = "positive" | "neutral" | "negative";

interface Mention {
  text: string;
  sentiment: Sentiment;
}

export default function MentionsPage() {
  const [search, setSearch] = useState("");

  const mentions: Mention[] = [
    { text: "Your last YouTube video was amazing!", sentiment: "positive" },
    { text: "Instagram post quality could be better.", sentiment: "negative" },
    { text: "Your content is consistent.", sentiment: "neutral" },
    { text: "Love the editing on your reel!", sentiment: "positive" },
  ];

  const filtered = mentions.filter((m) =>
    m.text.toLowerCase().includes(search.toLowerCase())
  );

  const sentimentColor: Record<Sentiment, string> = {
    positive: "text-green-600 bg-green-100",
    neutral: "text-gray-600 bg-gray-200",
    negative: "text-red-600 bg-red-100",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Mentions & Sentiment</h2>

      <Input
        placeholder="Search mentions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {filtered.map((m, i) => (
            <div key={i} className="p-4 border rounded flex items-center justify-between">
              <p>{m.text}</p>
              <span
                className={
                  "px-3 py-1 rounded text-sm font-medium " +
                  sentimentColor[m.sentiment]
                }
              >
                {m.sentiment}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-500">No mentions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
