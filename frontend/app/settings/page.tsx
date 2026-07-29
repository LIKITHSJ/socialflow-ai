"use client";

import { useState } from "react";
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
import { Trash2 } from "lucide-react";

interface AutoReplyRule {
  id: string;
  platform: "instagram" | "twitter" | "youtube";
  keyword: string;
  response: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const [rules, setRules] = useState<AutoReplyRule[]>([
    {
      id: "1",
      platform: "instagram",
      keyword: "price",
      response: "Thanks for asking! Check our bio link for full pricing details.",
      enabled: true,
    },
    {
      id: "2",
      platform: "twitter",
      keyword: "support",
      response: "We've received your message — our team will reply within 24 hours.",
      enabled: false,
    },
  ]);

  const [newPlatform, setNewPlatform] = useState<AutoReplyRule["platform"]>("instagram");
  const [newKeyword, setNewKeyword] = useState("");
  const [newResponse, setNewResponse] = useState("");

  const addRule = () => {
    if (!newKeyword.trim() || !newResponse.trim()) return;
    setRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        platform: newPlatform,
        keyword: newKeyword.trim(),
        response: newResponse.trim(),
        enabled: true,
      },
    ]);
    setNewKeyword("");
    setNewResponse("");
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
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
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Create Auto-Reply Rule</h2>
            <p className="text-sm text-gray-500">
              When an incoming message contains the keyword, this response is sent automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Platform</label>
                <Select
                  value={newPlatform}
                  onValueChange={(v) => setNewPlatform(v as AutoReplyRule["platform"])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter / X</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm">Trigger Keyword</label>
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. price, support, hours"
                  className="mt-1"
                />
              </div>
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

            {rules.length === 0 && (
              <p className="text-sm text-gray-500">No auto-reply rules yet.</p>
            )}

            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between border-b dark:border-neutral-700 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-gray-400">
                      {rule.platform}
                    </span>
                    <span className="font-semibold">"{rule.keyword}"</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{rule.response}</p>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}