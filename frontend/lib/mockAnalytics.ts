export interface AnalyticsSnapshot {
  platform_connection_id: string;
  snapshot_date: string; // ISO date
  metrics: {
    followers: number;
    engagement_rate: number;
    posts_count: number;
    scheduled_count: number;
  };
}

// Deterministic pseudo-random so numbers don't jitter on every re-render
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateMockSnapshots(days = 7): AnalyticsSnapshot[] {
  const snapshots: AnalyticsSnapshot[] = [];
  let followers = 12200;
  let posts = 468;
  let scheduled = 20;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const seed = date.getDate() + i;

    followers += Math.floor(seededRandom(seed) * 60) - 10;
    posts += seededRandom(seed + 1) > 0.5 ? 1 : 0;
    scheduled = Math.max(0, scheduled + (seededRandom(seed + 2) > 0.5 ? 1 : -1));
    const engagement_rate = +(6 + seededRandom(seed + 3) * 4).toFixed(1);

    snapshots.push({
      platform_connection_id: "mock-connection-1",
      snapshot_date: date.toISOString().split("T")[0],
      metrics: { followers, engagement_rate, posts_count: posts, scheduled_count: scheduled },
    });
  }
  return snapshots;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toChartData(snapshots: AnalyticsSnapshot[]) {
  return snapshots.map((s) => ({
    name: DAY_LABELS[new Date(s.snapshot_date).getDay()],
    value: s.metrics.followers,
  }));
}

export interface StatCardData {
  value: string;
  change: string;
}

export function computeStatCards(snapshots: AnalyticsSnapshot[]) {
  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots[snapshots.length - 2] ?? latest;

  const followerDelta = latest.metrics.followers - prev.metrics.followers;
  const engagementDelta = +(latest.metrics.engagement_rate - prev.metrics.engagement_rate).toFixed(1);
  const postsDelta = latest.metrics.posts_count - prev.metrics.posts_count;

  return {
    followers: {
      value: `${(latest.metrics.followers / 1000).toFixed(1)}k`,
      change: `${followerDelta >= 0 ? "+" : ""}${((followerDelta / prev.metrics.followers) * 100).toFixed(1)}% this week`,
    },
    engagement: {
      value: `${latest.metrics.engagement_rate}%`,
      change: `${engagementDelta >= 0 ? "+" : ""}${engagementDelta}% this week`,
    },
    posts: {
      value: `${latest.metrics.posts_count}`,
      change: `+${Math.max(postsDelta, 0)} new this week`,
    },
    scheduled: {
      value: `${latest.metrics.scheduled_count}`,
      change: `${latest.metrics.scheduled_count > 0 ? Math.min(latest.metrics.scheduled_count, 3) : 0} upcoming today`,
    },
  };
}