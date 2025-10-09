import React from "react";

export default function StatusDisplay({ status }) {
  const getStatusStyles = () => {
    if (!status) return "opacity-0";
    if (status.includes("failed")) return "bg-red-100 text-red-700";
    if (status.includes("complete")) return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="h-8 mt-4 text-center">
      <p
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${getStatusStyles()}`}
      >
        {status}
      </p>
    </div>
  );
}
