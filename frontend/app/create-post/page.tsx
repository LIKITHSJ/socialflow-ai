"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [file, setFile] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Post</h1>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Compose Post</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

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
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-sm mb-2">Select Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-900"
            >
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">X (Twitter)</option>
            </select>
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Publish Now</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Schedule</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
