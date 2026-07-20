"use client";

import { useState } from "react";
import Image from "next/image";

export default function SchedulePage() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platform, setPlatform] = useState("instagram");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-4">Schedule a Post</h1>

      <div className="bg-white shadow p-6 rounded-xl max-w-2xl">

        <label className="block mb-2 text-lg font-medium">Choose Platform</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
          <option value="twitter">X (Twitter)</option>
        </select>

        <label className="block mb-2 text-lg font-medium">Caption</label>
        <textarea
          className="w-full border p-3 rounded mb-4"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your caption..."
        />

        <label className="block mb-2 text-lg font-medium">Upload Image</label>
        <input type="file" className="mb-4" onChange={handleImage} />

        {preview && (
          <Image
            src={preview}
            alt="preview"
            width={300}
            height={300}
            className="rounded mb-4"
          />
        )}

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-2 text-lg font-medium">Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="block mb-2 text-lg font-medium">Time</label>
            <input
              type="time"
              className="w-full border p-2 rounded"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded text-lg hover:bg-blue-700 transition">
          Schedule Post
        </button>
      </div>
    </div>
  );
}
