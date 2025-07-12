let manifestFile = null;
let saltFile = null;
let encryptedFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const items = Array.from(e.dataTransfer.files);

    manifestFile = null;
    saltFile = null;
    encryptedFiles = [];

    for (const file of items) {
      if (file.name === "manifest.json.enc") {
        manifestFile = file;
      } else if (file.name === "salt.bin") {
        saltFile = file;
      } else if (file.name.endsWith(".enc")) {
        encryptedFiles.push(file);
      }
    }

    if (!manifestFile || !saltFile || encryptedFiles.length === 0) {
      alert(
        "Please include manifest.json.enc, salt.bin, and at least one .enc file."
      );
    } else {
      alert(
        `✅ Files loaded:\n- ${encryptedFiles.length} encrypted files\n- manifest.json.enc\n- salt.bin`
      );
    }
  });
});

async function decryptAll() {
  if (!manifestFile || !saltFile || encryptedFiles.length === 0) {
    alert("Missing files. Please drag and drop all necessary files first.");
    return;
  }

  const password = document.getElementById("password").value;
  if (!password) {
    alert("Please enter the password.");
    return;
  }

  const salt = await saltFile.arrayBuffer();
  const key = await deriveKey(password, salt);

  const manifestBuffer = await manifestFile.arrayBuffer();
  const iv_manifest = manifestBuffer.slice(0, 12);
  const encryptedManifest = manifestBuffer.slice(12);
  const manifestDecrypted = await decryptAesGcm(
    key,
    iv_manifest,
    encryptedManifest
  );
  const manifest = JSON.parse(new TextDecoder().decode(manifestDecrypted));

  const zip = new JSZip();

  for (const entry of manifest.files) {
    const encFile = encryptedFiles.find((f) => f.name === entry.encrypted_name);
    if (!encFile) continue;

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
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decryptAesGcm(key, iv, data) {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
}
