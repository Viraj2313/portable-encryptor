import React, { useState, useRef } from "react";
import { UploadIcon } from "./icons";

export default function FileDropzone({ onFilesSelected }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const traverseFileTree = (item, path = "") => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          resolve([{ file, path }]);
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          const files = await Promise.all(
            entries.map((entry) =>
              traverseFileTree(entry, `${path}${item.name}/`)
            )
          );
          resolve(files.flat());
        });
      }
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = e.dataTransfer.items;
    if (items) {
      const allFiles = await Promise.all(
        Array.from(items).map(async (item) => {
          const entry = item.webkitGetAsEntry();
          if (entry) return traverseFileTree(entry);
          return [];
        })
      );
      onFilesSelected(allFiles.flat().map((f) => f.file));
    } else if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300 ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <UploadIcon />
        <p className="text-neutral-600">Drag & drop files or folders here</p>
        <p className="text-xs text-neutral-500">
          or{" "}
          <span className="font-semibold text-blue-600">
            click to select files or folders
          </span>
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        webkitdirectory="true"
        onChange={handleChange}
      />
    </div>
  );
}
