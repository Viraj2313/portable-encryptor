import { useState } from "react";
import JSZip from "jszip";

const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

const deriveKey = async (password, salt) => {
  const enc = new TextEncoder().encode(password);
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const decryptAesGcm = async (key, iv, data) =>
  window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

const encryptAesGcm = async (key, iv, data) =>
  window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

export function useFileEncryptor() {
  const [mode, setMode] = useState("decrypt");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");

  const handleSetMode = (newMode) => {
    setMode(newMode);
    setFiles([]);
    setStatus("");
  };

  const handleFilesSelected = (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
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
      setStatus(`Loaded ${fileList.length} file(s) for encryption.`);
    }
  };

  const executeAction = async () => {
    if (files.length === 0) {
      alert(
        mode === "encrypt"
          ? "Please select files to encrypt."
          : "Please select files to decrypt."
      );
      return;
    }
    if (!password) {
      alert("Please enter a password.");
      return;
    }

    setStatus(
      mode === "encrypt"
        ? "Encrypting, please wait..."
        : "Decrypting, please wait..."
    );

    try {
      if (mode === "encrypt") await encryptAll();
      else await decryptAll();
    } catch (err) {
      console.error(err);
      setStatus(`${mode === "encrypt" ? "Encryption" : "Decryption"} failed.`);
    }
  };

  const decryptAll = async () => {
    const saltFile = files.find((f) => f.name.toLowerCase() === "salt.bin");
    const manifestFile = files.find(
      (f) => f.name.toLowerCase() === "manifest.json.enc"
    );
    const dataFiles = files.filter(
      (f) => f.name.endsWith(".enc") && f.name !== "manifest.json.enc"
    );

    if (!manifestFile || !saltFile || dataFiles.length === 0) {
      throw new Error("Missing required files for decryption.");
    }

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
    for (const entry of manifest.files) {
      const encFile = dataFiles.find((f) => f.name === entry.encrypted_name);
      if (!encFile) continue;

      const encryptedData = await encFile.arrayBuffer();
      const iv = hexToBytes(entry.iv);
      const decrypted = await decryptAesGcm(key, iv, encryptedData);
      zip.file(entry.original_name, decrypted);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "decrypted_files.zip");
    setStatus("Decryption complete!");
  };

  const encryptAll = async () => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);
    const zip = new JSZip();
    const manifest = { files: [] };

    for (const file of files) {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
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
    const ivManifest = window.crypto.getRandomValues(new Uint8Array(12));
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
    downloadBlob(zipBlob, "encrypted_files.zip");
    setStatus("Encryption complete!");
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    mode,
    files,
    status,
    password,
    setMode: handleSetMode,
    setPassword,
    handleFilesSelected,
    executeAction,
  };
}
