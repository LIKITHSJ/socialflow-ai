"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
        />

        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Login
        </button>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
