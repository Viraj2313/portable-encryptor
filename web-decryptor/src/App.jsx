import React from "react";
import { useFileEncryptor } from "./hooks/useFileEncryptor";
import ModeSwitcher from "./components/ModeSwitcher";
import FileDropzone from "./components/FileDropzone";
import FileList from "./components/FileList";
import PasswordInput from "./components/PasswordInput";
import ActionButton from "./components/ActionButton";
import StatusDisplay from "./components/StatusDisplay";

export default function App() {
  const {
    mode,
    files,
    status,
    password,
    setMode,
    setPassword,
    handleFilesSelected,
    executeAction,
  } = useFileEncryptor();

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

        <ModeSwitcher mode={mode} setMode={setMode} />

        <FileDropzone mode={mode} onFilesSelected={handleFilesSelected} />

        <FileList files={files} />

        <PasswordInput value={password} onChange={setPassword} />

        <ActionButton
          mode={mode}
          onClick={executeAction}
          disabled={!password || files.length === 0}
        />

        <StatusDisplay status={status} />
      </div>
    </div>
  );
}
