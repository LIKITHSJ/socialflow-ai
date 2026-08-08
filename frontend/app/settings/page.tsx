"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---- Auto-Reply types, matching backend schemas/auto_reply.py exactly ----
interface CustomRule {
  keyword: string;
  response: string;
  enabled: boolean;
}

interface AutoReplyConfig {
  id: string;
  platform_connection_id: string;
  enabled: boolean;
  reply_to_comments: boolean;
  reply_to_dms: boolean;
  ai_powered: boolean;
  ai_prompt: string | null;
  custom_rules: CustomRule[];
}

interface PlatformConnection {
  id: string;
  platform: string;
  account_name?: string;
}

export default function SettingsPage() {
  const { token } = useAuth();

  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  // ---- Auto-Reply state ----
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [config, setConfig] = useState<AutoReplyConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newKeyword, setNewKeyword] = useState("");
  const [newResponse, setNewResponse] = useState("");

  // Fetch connected accounts on mount
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
      // silent — selector just stays empty
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Fetch that connection's auto-reply config whenever selection changes
  const fetchConfig = useCallback(async () => {
    if (!token || !selectedConnectionId) return;
    setLoadingConfig(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auto-reply/${selectedConnectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load auto-reply config (${res.status})`);
      setConfig(await res.json());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load config.",
      });
      setConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  }, [token, selectedConnectionId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateLocalConfig = (patch: Partial<AutoReplyConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const addRule = () => {
    if (!newKeyword.trim() || !newResponse.trim() || !config) return;
    updateLocalConfig({
      custom_rules: [
        ...config.custom_rules,
        { keyword: newKeyword.trim(), response: newResponse.trim(), enabled: true },
      ],
    });
    setNewKeyword("");
    setNewResponse("");
  };

  const toggleRule = (index: number) => {
    if (!config) return;
    const updated = config.custom_rules.map((r, i) =>
      i === index ? { ...r, enabled: !r.enabled } : r
    );
    updateLocalConfig({ custom_rules: updated });
  };

  const deleteRule = (index: number) => {
    if (!config) return;
    updateLocalConfig({ custom_rules: config.custom_rules.filter((_, i) => i !== index) });
  };

  const saveConfig = async () => {
    if (!token || !selectedConnectionId || !config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auto-reply/${selectedConnectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: config.enabled,
          reply_to_comments: config.reply_to_comments,
          reply_to_dms: config.reply_to_dms,
          ai_powered: config.ai_powered,
          ai_prompt: config.ai_prompt,
          custom_rules: config.custom_rules,
        }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      setConfig(await res.json());
      setMessage({ type: "success", text: "Auto-reply settings saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="autoreply">Auto-Reply</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <div>
              <label className="text-sm">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <Button className="mt-4">Save Changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>
            <div className="flex items-center justify-between">
              <span>Enable Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="autoreply" className="mt-6 space-y-6">
          {/* Connection selector — config is scoped per platform_connection_id on the backend */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Select Account</h2>
            <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a connected account" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.platform} {c.account_name ? `(${c.account_name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {connections.length === 0 && (
              <p className="text-sm text-gray-500">
                No connected accounts yet — connect one first.
              </p>
            )}
          </Card>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          {loadingConfig && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading auto-reply settings...
            </div>
          )}

          {!loadingConfig && config && (
            <>
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">General Settings</h2>

                <div className="flex items-center justify-between">
                  <span>Enable Auto-Reply</span>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(v) => updateLocalConfig({ enabled: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Reply to Comments</span>
                  <Switch
                    checked={config.reply_to_comments}
                    onCheckedChange={(v) => updateLocalConfig({ reply_to_comments: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Reply to DMs</span>
                  <Switch
                    checked={config.reply_to_dms}
                    onCheckedChange={(v) => updateLocalConfig({ reply_to_dms: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>AI-Powered Fallback</span>
                  <Switch
                    checked={config.ai_powered}
                    onCheckedChange={(v) => updateLocalConfig({ ai_powered: v })}
                  />
                </div>

                {config.ai_powered && (
                  <div>
                    <label className="text-sm">AI Prompt</label>
                    <Textarea
                      value={config.ai_prompt ?? ""}
                      onChange={(e) => updateLocalConfig({ ai_prompt: e.target.value })}
                      placeholder="Describe how the AI should respond when no keyword rule matches..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Create Rule</h2>
                <p className="text-sm text-gray-500">
                  When an incoming message contains the keyword, this response is sent automatically.
                </p>

                <div>
                  <label className="text-sm">Trigger Keyword</label>
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="e.g. price, support, hours"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm">Auto-Reply Message</label>
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Write the automated response..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button onClick={addRule}>Add Rule</Button>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Active Rules</h2>

                {config.custom_rules.length === 0 && (
                  <p className="text-sm text-gray-500">No auto-reply rules yet.</p>
                )}

                {config.custom_rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b dark:border-neutral-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <span className="font-semibold">&quot;{rule.keyword}&quot;</span>
                      <p className="text-sm text-gray-500 mt-1">{rule.response}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(index)} />
                      <button
                        onClick={() => deleteRule(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>

              <Button onClick={saveConfig} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Auto-Reply Settings"}
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}