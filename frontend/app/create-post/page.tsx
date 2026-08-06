"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/authContext";
import { Sparkles, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PlatformConnection = {
  id: string;
  platform: string;
  account_name?: string;
};

type SuggestionType = "caption" | "hashtags" | "best_time" | "growth_strategy" | "tweet" | "thread";

type SuggestionOption = {
  content: string;
  metadata?: Record<string, unknown>;
};

const SUGGESTION_TYPES: { value: SuggestionType; label: string }[] = [
  { value: "caption", label: "Caption" },
  { value: "hashtags", label: "Hashtags" },
  { value: "tweet", label: "Tweet" },
  { value: "thread", label: "Thread" },
  { value: "growth_strategy", label: "Growth Strategy" },
  { value: "best_time", label: "Best Time to Post" },
];

// Backend only accepts these three — connections outside this set fall back to "instagram"
const VALID_AI_PLATFORMS = ["twitter", "instagram", "youtube"];

export default function CreatePostPage() {
  const { token } = useAuth();

  const [content, setContent] = useState("");
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [submitting, setSubmitting] = useState<"publish" | "schedule" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ---- AI Suggestions state ----
  const [aiTopic, setAiTopic] = useState("");
  const [aiType, setAiType] = useState<SuggestionType>("caption");
  const [aiSuggestions, setAiSuggestions] = useState<SuggestionOption[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fetchConnections = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/platform-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PlatformConnection[] = await res.json();
        setConnections(data);
        if (data.length > 0) setSelectedConnectionId(data[0].id);
      }
    } catch {
      // silent — dropdown just stays empty
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const selectedConnection = connections.find((c) => c.id === selectedConnectionId);
  const aiPlatform = VALID_AI_PLATFORMS.includes(selectedConnection?.platform ?? "")
    ? (selectedConnection!.platform as "twitter" | "instagram" | "youtube")
    : "instagram";

  const generateSuggestions = async () => {
    setAiError("");
    setAiSuggestions([]);

    if (!aiTopic.trim()) {
      setAiError("Enter a topic to get suggestions.");
      return;
    }
    if (!token) return;

    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: aiTopic,
          platform: aiPlatform,
          suggestion_type: aiType,
          num_options: 3,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to generate suggestions" }));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setAiSuggestions(data.suggestions);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  const useSuggestion = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const buildPayload = (status: "pending", scheduledTimeIso: string) => {
    return {
      platform: selectedConnection?.platform || "",
      platform_connection_id: selectedConnectionId,
      content,
      media_urls: file ? [file.name] : [],
      scheduled_time: scheduledTimeIso,
      status,
      ai_generated: aiSuggestions.length > 0,
    };
  };

  const submitPost = async (mode: "publish" | "schedule") => {
    setMessage(null);

    if (!content.trim()) {
      setMessage({ type: "error", text: "Content can't be empty." });
      return;
    }
    if (!selectedConnectionId) {
      setMessage({ type: "error", text: "Connect an account first." });
      return;
    }

    let scheduledTimeIso: string;
    if (mode === "publish") {
      scheduledTimeIso = new Date().toISOString();
    } else {
      if (!scheduleDate || !scheduleTime) {
        setMessage({ type: "error", text: "Pick a date and time to schedule." });
        return;
      }
      scheduledTimeIso = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    const payload = buildPayload("pending", scheduledTimeIso);

    setSubmitting(mode);
    try {
      const res = await fetch(`${API_BASE}/posts/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Backend not ready yet (${res.status})`);
      setMessage({
        type: "success",
        text: mode === "publish" ? "Post published!" : "Post scheduled!",
      });
      setContent("");
      setFile(null);
      setScheduleDate("");
      setScheduleTime("");
      setAiSuggestions([]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit post.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Post</h1>

      {/* ---- AI Suggestions panel ---- */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Topic</label>
              <Input
                placeholder="e.g. new product launch, weekend sale..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Type</label>
              <select
                value={aiType}
                onChange={(e) => setAiType(e.target.value as SuggestionType)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-900"
              >
                {SUGGESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={generateSuggestions}
            disabled={aiLoading || !selectedConnectionId}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {aiLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </span>
            ) : (
              "Generate Suggestions"
            )}
          </Button>

          {aiError && <p className="text-sm text-red-600">{aiError}</p>}

          {aiSuggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              {aiSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg flex items-start justify-between gap-3 bg-neutral-50 dark:bg-neutral-800"
                >
                  <p className="text-sm flex-1">{s.content}</p>
                  <Button
                    onClick={() => useSuggestion(s.content)}
                    className="shrink-0 text-xs px-3 py-1 h-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Compose form ---- */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Compose Post</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Write your content</label>
            <Textarea
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-32"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Upload media</label>
            <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-sm mb-2">Select Account</label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-900"
            >
              {connections.length === 0 && <option value="">No connected accounts</option>}
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.platform} {c.account_name ? `(${c.account_name})` : ""}
                </option>
              ))}
            </select>
            {connections.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No connected accounts yet — connect one first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Schedule Date</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Schedule Time</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => submitPost("publish")}
              disabled={submitting !== null}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting === "publish" ? "Publishing..." : "Publish Now"}
            </Button>
            <Button
              onClick={() => submitPost("schedule")}
              disabled={submitting !== null}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {submitting === "schedule" ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
