import React from "react";

export default function ModeSwitcher({ mode, setMode }) {
  return (
    <div className="flex justify-center bg-neutral-100 p-1 rounded-full mb-8">
      <button
        className={`w-full px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
          mode === "decrypt"
            ? "bg-white text-neutral-900 shadow-sm"
            : "bg-transparent text-neutral-500 hover:text-neutral-900"
        }`}
        onClick={() => setMode("decrypt")}
      >
        Decrypt
      </button>
      <button
        className={`w-full px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
          mode === "encrypt"
            ? "bg-white text-neutral-900 shadow-sm"
            : "bg-transparent text-neutral-500 hover:text-neutral-900"
        }`}
        onClick={() => setMode("encrypt")}
      >
        Encrypt
      </button>
    </div>
  );
}
