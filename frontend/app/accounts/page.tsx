// app/accounts/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/authContext";
import { Card } from "@/components/ui/card";
import { Instagram, Youtube, Twitter, Loader2, CheckCircle2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type PlatformConnection = {
  id: string;
  platform: string; // "youtube" | "instagram" | "twitter"
  account_name?: string;
};

type PlatformDef = {
  key: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  buttonColor: string;
  available: boolean;
};

const PLATFORMS: PlatformDef[] = [
  {
    key: "instagram",
    name: "Instagram",
    color: "from-pink-500 to-pink-600",
    icon: <Instagram className="w-12 h-12" />,
    buttonColor: "bg-pink-600 hover:bg-pink-700",
    available: false,
  },
  {
    key: "youtube",
    name: "YouTube",
    color: "from-red-500 to-red-600",
    icon: <Youtube className="w-12 h-12" />,
    buttonColor: "bg-red-600 hover:bg-red-700",
    available: true,
  },
  {
    key: "twitter",
    name: "X (Twitter)",
    color: "from-gray-900 to-gray-700",
    icon: <Twitter className="w-12 h-12" />,
    buttonColor: "bg-black hover:bg-gray-900",
    available: false,
  },
];

export default function AccountsPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/platform-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load connections (${res.status})`);
      setConnections(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const getConnection = (key: string) => connections.find((c) => c.platform === key);

  const handleConnect = (key: string) => {
    if (key !== "youtube") return;

    // KNOWN BLOCKER: /platform-connections/connect/youtube requires an
    // Authorization header via get_current_user, but this is a full-page
    // redirect (window.location) — headers can't be attached to it.
    // Needs Likhith to accept the token as a query param (or a short-lived
    // signed state token) before this can actually work.
    console.warn(
      "[SocialFlow] Cannot redirect to /connect/youtube with auth header — backend needs token as query param. Flag to Likhith."
    );
    alert(
      "YouTube connect is blocked: the backend needs to accept the auth token as a query param for the redirect to work. Ask Likhith to update /platform-connections/connect/youtube."
    );

    // Once fixed:
    // window.location.href = `${API_BASE}/platform-connections/connect/youtube?token=${token}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Connected Accounts</h1>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading connections...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500">
          {error}{" "}
          <button onClick={fetchConnections} className="underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const conn = getConnection(platform.key);
          const isConnected = !!conn;

          return (
            <Card
              key={platform.key}
              className={`p-6 rounded-2xl text-white shadow-xl bg-gradient-to-br ${platform.color} transition ${
                platform.available ? "hover:scale-[1.03]" : "opacity-60"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="opacity-90">{platform.icon}</div>

                <h2 className="text-2xl font-bold">{platform.name}</h2>

                {isConnected && (
                  <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {conn?.account_name || "Connected"}
                  </span>
                )}

                <button
                  disabled={!platform.available || isConnected}
                  onClick={() => handleConnect(platform.key)}
                  className={`px-5 py-2 rounded-lg font-medium text-white transition shadow-md ${
                    platform.buttonColor
                  } ${!platform.available || isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isConnected
                    ? "Connected"
                    : platform.available
                    ? `Connect ${platform.name}`
                    : "Coming soon"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}