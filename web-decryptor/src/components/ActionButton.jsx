import React from "react";
import { LockIcon, UnlockIcon } from "./icons";

export default function ActionButton({ mode, onClick, disabled }) {
  const isDecrypt = mode === "decrypt";
  return (
    <button
      className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 mt-8 rounded-lg hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 transition-all duration-300 font-semibold disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {isDecrypt ? <UnlockIcon /> : <LockIcon />}
      {isDecrypt ? "Decrypt & Download ZIP" : "Encrypt & Download ZIP"}
    </button>
  );
}
