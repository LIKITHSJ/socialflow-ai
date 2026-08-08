// lib/mockScheduledPosts.ts
export type ScheduledPost = {
  id: string;
  platform: string;
  account_name?: string;
  content: string;
  media_urls: string[];
  scheduled_time: string;
  status: "pending" | "published" | "failed";
  ai_generated: boolean;
};

export function getMockScheduledPosts(): ScheduledPost[] {
  return [
    {
      id: "1",
      platform: "youtube",
      account_name: "SocialFlow Demo",
      content: "Check out our new feature launch! 🚀",
      media_urls: [],
      scheduled_time: new Date(Date.now() + 3600 * 1000 * 5).toISOString(),
      status: "pending",
      ai_generated: false,
    },
    {
      id: "2",
      platform: "instagram",
      account_name: "socialflow.ai",
      content: "Behind the scenes of building an AI-powered scheduler.",
      media_urls: ["demo-image.png"],
      scheduled_time: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      status: "published",
      ai_generated: true,
    },
    {
      id: "3",
      platform: "twitter",
      account_name: "@socialflowai",
      content: "This one failed to post — placeholder failure case.",
      media_urls: [],
      scheduled_time: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      status: "failed",
      ai_generated: false,
    },
  ];
}