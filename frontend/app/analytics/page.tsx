"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/authContext";
import {
  AnalyticsSnapshot,
  toChartData,
  computeStatCards,
} from "@/lib/mockAnalytics";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("7d");
  const { token } = useAuth();

  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!token) return;

    const rangeDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 90 };
    const days = rangeDays[selectedRange] ?? 7;

    setLoading(true);
    setError("");
    try {
      const connRes = await fetch(`${API_BASE}/platform-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!connRes.ok) throw new Error("Failed to load platform connections");
      const connections = await connRes.json();

      if (!connections.length) {
        setError("No connected accounts yet. Connect a platform to see analytics.");
        setSnapshots(null);
        return;
      }

      const connectionId = connections[0].id;

      const snapRes = await fetch(
        `${API_BASE}/analytics/${connectionId}?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!snapRes.ok) throw new Error("Failed to load analytics data");
      const data: AnalyticsSnapshot[] = await snapRes.json();
      setSnapshots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSnapshots(null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const stats = snapshots && snapshots.length > 0 ? computeStatCards(snapshots) : null;
  const chartData = snapshots && snapshots.length > 0 ? toChartData(snapshots) : [];
  const hasNoData = !loading && !error && snapshots !== null && snapshots.length === 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Analytics Overview</h1>

      <div className="flex gap-3">
        {["7d", "30d", "90d", "1y"].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-4 py-2 rounded-lg border transition font-medium ${
              selectedRange === range
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading analytics...</p>}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={loadAnalytics}
            className="text-red-700 underline font-medium whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {hasNoData && (
        <div className="p-6 bg-white dark:bg-neutral-900 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl text-center">
          <p className="text-gray-500 text-sm">
            No analytics data yet for this account and range.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Data will appear here once snapshots are recorded.
          </p>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg rounded-xl">
              <p className="text-sm opacity-80">Followers</p>
              <h2 className="text-4xl font-bold mt-2">{stats.followers.value}</h2>
              <p className="text-sm mt-1">{stats.followers.change}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg rounded-xl">
              <p className="text-sm opacity-80">Engagement</p>
              <h2 className="text-4xl font-bold mt-2">{stats.engagement.value}</h2>
              <p className="text-sm mt-1">{stats.engagement.change}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg rounded-xl">
              <p className="text-sm opacity-80">Total Posts</p>
              <h2 className="text-4xl font-bold mt-2">{stats.posts.value}</h2>
              <p className="text-sm mt-1">{stats.posts.change}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg rounded-xl">
              <p className="text-sm opacity-80">Scheduled</p>
              <h2 className="text-4xl font-bold mt-2">{stats.scheduled.value}</h2>
              <p className="text-sm mt-1">{stats.scheduled.change}</p>
            </Card>
          </div>

          <Card className="p-6 shadow rounded-xl dark:bg-neutral-900">
            <h2 className="text-xl font-semibold mb-4">Followers Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}