"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Create Account</h1>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
        />

        <input
          type="password"
          placeholder="Choose a Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
        />

        <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          Sign Up
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
