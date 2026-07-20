"use client";

import { useState } from "react";

export default function MessagesPage() {
  const conversations = [
    { id: 1, name: "John Doe", last: "Can you share the report?", time: "2m" },
    { id: 2, name: "Aarav Sharma", last: "Thanks!", time: "10m" },
    { id: 3, name: "Sophia Lee", last: "Please check this", time: "1h" },
    { id: 4, name: "Marketing Team", last: "Meeting at 3PM", time: "3h" },
  ];

  const [selected, setSelected] = useState(1);

  return (
    <div className="grid grid-cols-12 h-[90vh] p-4 gap-4">

      <div className="col-span-3 bg-white dark:bg-neutral-900 rounded-xl shadow overflow-y-auto">
        <h2 className="text-xl font-semibold p-4">Inbox</h2>

        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`p-4 cursor-pointer border-b dark:border-neutral-700 
            ${selected === c.id ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
          >
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-gray-500">{c.last}</p>
            <p className="text-xs text-gray-400 mt-1">{c.time} ago</p>
          </div>
        ))}
      </div>

      <div className="col-span-6 bg-white dark:bg-neutral-900 rounded-xl shadow flex flex-col">
        <div className="p-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold">
            {conversations.find((c) => c.id === selected)?.name}
          </h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 max-w-[70%] rounded-lg">
            Hello! Thanks for reaching out.
          </div>

          <div className="p-3 bg-blue-600 text-white max-w-[70%] ml-auto rounded-lg">
            Hi! Sure, I will get back to you.
          </div>

          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 max-w-[70%] rounded-lg">
            Can you please share the report?
          </div>
        </div>

        <div className="p-4 border-t dark:border-neutral-700 flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border dark:border-neutral-700 dark:bg-neutral-800"
            placeholder="Type a message..."
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>

      <div className="col-span-3 bg-white dark:bg-neutral-900 rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Details</h2>

        <p className="text-gray-500">Conversation ID: {selected}</p>
        <p className="text-gray-500 mt-2">
          Platform: Instagram / YouTube / X  
        </p>

        <div className="mt-6">
          <p className="font-semibold">Notes</p>
          <textarea
            className="w-full mt-2 p-3 rounded-lg border dark:border-neutral-700 dark:bg-neutral-800"
            rows={5}
            placeholder="Write notes here..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
