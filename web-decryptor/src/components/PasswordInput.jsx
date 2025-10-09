import React from "react";
import { LockIcon } from "./icons";

export default function PasswordInput({ value, onChange }) {
  return (
    <div className="mt-6">
      <label className="block mb-2 font-semibold text-sm text-neutral-700">
        Password
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
          <LockIcon />
        </span>
        <input
          type="password"
          className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your secret password"
        />
      </div>
    </div>
  );
}
