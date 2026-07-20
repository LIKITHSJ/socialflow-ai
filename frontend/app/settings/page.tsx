"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Profile Information</h2>

        <div>
          <label className="text-sm">Full Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button className="mt-4">Save Changes</Button>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Preferences</h2>

        <div className="flex items-center justify-between">
          <span>Enable Dark Mode</span>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>

        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        <div className="flex items-center justify-between">
          <span>Push Notifications</span>
          <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
        </div>
      </Card>
    </div>
  );
}
