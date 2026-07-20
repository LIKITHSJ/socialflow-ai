"use client";

import { useState } from "react";

type ScheduleMap = {
  [key: number]: string[];
};

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const scheduledPosts: ScheduleMap = {
    3: ["Instagram Reel at 4 PM"],
    7: ["YouTube Video at 6 PM", "Instagram Story at 9 PM"],
    15: ["X Tweet at 10 AM"],
    22: ["Instagram Post at 5 PM"],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Content Calendar</h1>

      <div className="grid grid-cols-7 gap-4">
        {daysInMonth.map((day) => (
          <div
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`p-4 rounded-xl border cursor-pointer min-h-[120px] flex flex-col 
              justify-between transition
              ${
                selectedDay === day
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
              }`}
          >
            <p className="font-semibold">{day}</p>

            <div className="text-sm">
              {scheduledPosts[day]?.map((item, i) => (
                <p key={i} className="text-xs mt-1 opacity-80">
                  • {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="p-6 rounded-xl border bg-white dark:bg-neutral-900">
          <h2 className="text-xl font-semibold">Day {selectedDay} — Scheduled Posts</h2>

          <div className="mt-4 space-y-2">
            {scheduledPosts[selectedDay]?.length ? (
              scheduledPosts[selectedDay].map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-500 mt-2">No posts scheduled for this day.</p>
            )}
          </div>

          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Schedule New Post
          </button>
        </div>
      )}
    </div>
  );
}
