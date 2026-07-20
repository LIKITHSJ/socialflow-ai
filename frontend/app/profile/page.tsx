"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [bio, setBio] = useState("Content creator & social media manager.");
  const [location, setLocation] = useState("Bangalore, India");

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Profile</h1>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src="/avatar1.jpg"
            alt="User Avatar"
            width={120}
            height={120}
            className="rounded-full shadow"
          />

          <div className="space-y-3 w-full">
            <div>
              <label className="text-sm">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Bio</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button className="mt-4">Save Profile</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h3 className="text-xl font-semibold">12.3k</h3>
            <p className="text-sm text-gray-500">Followers</p>
          </div>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h3 className="text-xl font-semibold">483</h3>
            <p className="text-sm text-gray-500">Posts</p>
          </div>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h3 className="text-xl font-semibold">98k</h3>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
