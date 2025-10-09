import React from "react";
import { FileIcon } from "./icons";

export default function FileList({ files }) {
  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="font-semibold text-sm mb-2 text-neutral-700">
        Selected Files ({files.length}):
      </p>
      <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
        {files.map((f, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 text-sm text-neutral-600"
          >
            <FileIcon />
            <span className="truncate">{f.webkitRelativePath || f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
