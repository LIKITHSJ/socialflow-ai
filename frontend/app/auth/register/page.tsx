"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    console.log("New User Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

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
          onClick={handleRegister}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}
