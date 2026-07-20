"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TeamPage() {
  const teamMembers = [
    {
      name: "John Doe",
      role: "Admin",
      avatar: "/avatar1.png",
    },
    {
      name: "Sarah Wilson",
      role: "Editor",
      avatar: "/avatar2.png",
    },
    {
      name: "Michael Lee",
      role: "Viewer",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Team Members</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <Card
            key={index}
            className="p-6 rounded-xl shadow bg-white dark:bg-neutral-900"
          >
            <div className="flex flex-col items-center">
              <Image
                src={member.avatar}
                alt="avatar"
                width={80}
                height={80}
                className="rounded-full mb-4"
              />

              <h2 className="text-xl font-semibold">{member.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {member.role}
              </p>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="dark:border-neutral-700">
                  Edit
                </Button>
                <Button variant="destructive">Remove</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
