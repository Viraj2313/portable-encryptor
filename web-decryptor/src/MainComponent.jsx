import React, { useState, useRef } from "react";
import JSZip from "jszip";

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const UnlockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
    <path d="M7 7V7a4 4 0 014-4v0a4 4 0 014 4v0" />
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-neutral-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 flex-shrink-0 text-neutral-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

export default function MainComponent() {
  const [mode, setMode] = useState("decrypt");
  const [files, setFiles] = useState([]);
  const [manifestFile, setManifestFile] = useState(null);
  const [saltFile, setSaltFile] = useState(null);
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleFiles = (items) => {
    const fileList = Array.from(items);
    if (mode === "decrypt") {
      let encFiles = [];
      let manifest = null;
      let salt = null;

      fileList.forEach((file) => {
        const name = file.name.toLowerCase();
        if (name === "manifest.json.enc") manifest = file;
        else if (name === "salt.bin") salt = file;
        else if (name.endsWith(".enc") && name !== "manifest.json.enc")
          encFiles.push(file);
      });

      const allRequiredFiles = [...encFiles, manifest, salt].filter(Boolean);
      setFiles(allRequiredFiles);
      setManifestFile(manifest);
      setSaltFile(salt);

      if (encFiles.length > 0 && manifest && salt) {
        setStatus(
          `Loaded ${encFiles.length} encrypted file(s), manifest, and salt.`
        );
      } else {
        setStatus(
          "Waiting for required files (.enc, manifest.json.enc, salt.bin)..."
        );
      }
    } else {
      setFiles(fileList);
      setManifestFile(null);
      setSaltFile(null);
      setStatus(`Loaded ${fileList.length} file(s) for encryption.`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const hexToBytes = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  const deriveKey = async (password, salt) => {
    const enc = new TextEncoder().encode(password);
    const baseKey = await crypto.subtle.importKey("raw", enc, "PBKDF2", false, [
      "deriveKey",
    ]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  };

  const decryptAesGcm = async (key, iv, data) =>
    crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  const encryptAesGcm = async (key, iv, data) =>
    crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  const decryptAll = async () => {
    if (
      !manifestFile ||
      !saltFile ||
      files.filter(
        (f) => f.name.endsWith(".enc") && f.name !== "manifest.json.enc"
      ).length === 0
    ) {
      alert(
        "Missing files. Please provide all encrypted files (.enc), manifest.json.enc, and salt.bin."
      );
      return;
    }
    if (!password) {
      alert("Please enter a password.");
      return;
    }

    setStatus("Decrypting, please wait...");

    try {
      const salt = await saltFile.arrayBuffer();
      const key = await deriveKey(password, salt);

      const manifestBuffer = await manifestFile.arrayBuffer();
      const ivManifest = manifestBuffer.slice(0, 12);
      const encryptedManifest = manifestBuffer.slice(12);
      const manifestDecrypted = await decryptAesGcm(
        key,
        ivManifest,
        encryptedManifest
      );
      const manifest = JSON.parse(new TextDecoder().decode(manifestDecrypted));

      const zip = new JSZip();
      const dataFiles = files.filter(
        (f) => f.name.endsWith(".enc") && f.name !== "manifest.json.enc"
      );

      for (const entry of manifest.files) {
        const encFile = dataFiles.find((f) => f.name === entry.encrypted_name);
        if (!encFile) {
          console.warn(
            `File from manifest not found in selection: ${entry.encrypted_name}`
          );
          continue;
        }

        const encryptedData = await encFile.arrayBuffer();
        const iv = hexToBytes(entry.iv);
        const decrypted = await decryptAesGcm(key, iv, encryptedData);
        zip.file(entry.original_name, decrypted);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "decrypted_files.zip";
      a.click();
      URL.revokeObjectURL(a.href);

      setStatus("Decryption complete!");
    } catch (err) {
      console.error(err);
      setStatus("Decryption failed. Check password or files.");
    }
  };

  const encryptAll = async () => {
    if (files.length === 0) {
      alert("Please select files to encrypt.");
      return;
    }
    if (!password) {
      alert("Please enter a password to secure your files.");
      return;
    }

    setStatus("Encrypting, please wait...");

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey(password, salt);
      const zip = new JSZip();
      const manifest = { files: [] };

      for (const file of files) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = await file.arrayBuffer();
        const encrypted = await encryptAesGcm(key, iv, data);

        const relativePath = file.webkitRelativePath || file.name;
        const encryptedName = `${relativePath}.enc`;

        zip.file(encryptedName, encrypted);

        manifest.files.push({
          original_name: relativePath,
          encrypted_name: encryptedName,
          iv: Array.from(iv)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
        });
      }

      const manifestData = new TextEncoder().encode(JSON.stringify(manifest));
      const ivManifest = crypto.getRandomValues(new Uint8Array(12));
      const encryptedManifest = await encryptAesGcm(
        key,
        ivManifest,
        manifestData
      );

      const manifestBuffer = new Uint8Array(
        ivManifest.byteLength + encryptedManifest.byteLength
      );
      manifestBuffer.set(ivManifest, 0);
      manifestBuffer.set(
        new Uint8Array(encryptedManifest),
        ivManifest.byteLength
      );

      zip.file("manifest.json.enc", manifestBuffer);
      zip.file("salt.bin", salt);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "encrypted_files.zip";
      a.click();
      URL.revokeObjectURL(a.href);

      setStatus("Encryption complete!");
    } catch (err) {
      console.error(err);
      setStatus("Encryption failed.");
    }
  };

  const handleAction = () => (mode === "decrypt" ? decryptAll() : encryptAll());

  const getStatusStyles = () => {
    if (!status) return "opacity-0";
    if (status.includes("failed")) return "bg-red-100 text-red-700";
    if (status.includes("complete")) return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 lg:p-10 border border-neutral-200/80 text-neutral-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1 text-neutral-900">
            Secure File Vault
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Encrypt or decrypt files directly in your browser.
          </p>
        </div>

        <div className="flex justify-center bg-neutral-100 p-1 rounded-full mb-8">
          <button
            className={`w-full px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              mode === "decrypt"
                ? "bg-white text-neutral-900 shadow-sm"
                : "bg-transparent text-neutral-500 hover:text-neutral-900"
            }`}
            onClick={() => {
              setMode("decrypt");
              setFiles([]);
              setStatus("");
            }}
          >
            Decrypt
          </button>
          <button
            className={`w-full px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              mode === "encrypt"
                ? "bg-white text-neutral-900 shadow-sm"
                : "bg-transparent text-neutral-500 hover:text-neutral-900"
            }`}
            onClick={() => {
              setMode("encrypt");
              setFiles([]);
              setStatus("");
            }}
          >
            Encrypt
          </button>
        </div>

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
          onClick={onButtonClick}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <UploadIcon />
            <p className="text-neutral-600">
              <span className="font-semibold text-blue-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-neutral-500">
              {mode === "encrypt"
                ? "Select any files or folders"
                : "Select .enc files, manifest & salt"}
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            webkitdirectory={mode === "encrypt" ? "true" : undefined}
            onChange={handleFileChange}
          />
        </div>

        {files.length > 0 && (
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
                  <span className="truncate">
                    {f.webkitRelativePath || f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your secret password"
            />
          </div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 mt-8 rounded-lg hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 transition-all duration-300 font-semibold disabled:opacity-50"
          onClick={handleAction}
          disabled={!password || files.length === 0}
        >
          {mode === "decrypt" ? <UnlockIcon /> : <LockIcon />}
          {mode === "decrypt"
            ? "Decrypt & Download ZIP"
            : "Encrypt & Download ZIP"}
        </button>

        <div className="h-8 mt-4 text-center">
          <p
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${getStatusStyles()}`}
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
