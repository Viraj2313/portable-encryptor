# 🔐 PortableEncryptor

**PortableEncryptor** is a secure folder encryption and decryption tool. It includes:

- A **Python CLI tool** to encrypt (and decrypt) folders.
- A **browser-based WebDecryptor** to decrypt files on any device — with no app install required.

---

## ✨ Features

- AES-256-GCM encryption with PBKDF2 key derivation
- Encrypted filenames, IVs, and metadata
- CLI for secure local encryption/decryption
- Web UI to decrypt anywhere (desktop, mobile, cloud)
- Outputs a `.zip` of the original files

---

## ⚙️ CLI Usage (Python)

> Requires Python 3.8+ and `cryptography`, `typer`.

Install with:

```bash
pip install .

🔐 Encrypt a folder

encryptor encrypt --input my_folder --output encrypted_folder


🔓 Decrypt a folder (CLI)

encryptor decrypt encrypted_folder decrypted_output
```
