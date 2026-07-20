"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <div className="mb-4">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
