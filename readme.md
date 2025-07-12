# 🔐 PortableEncryptor

**Secure folder encryption with cross-device decryption**

PortableEncryptor is a dual-purpose encryption tool that combines the security of local CLI encryption with the convenience of browser-based decryption. Encrypt your folders locally, then decrypt them anywhere—no app installation required.

## 🎯 Why PortableEncryptor?

**The main purpose** of this tool is to solve a common problem: **securely storing sensitive files on cloud drives** while maintaining easy access across all your devices.

With PortableEncryptor, you can:

- **Encrypt your folders locally** using the CLI tool
- **Upload encrypted folders to any cloud service** (Google Drive, Dropbox, OneDrive, etc.) without privacy concerns
- **Decrypt on any device** using just a web browser—no software installation needed
- **Access your files anywhere** while keeping them completely secure in the cloud

Perfect for users who want cloud storage convenience without sacrificing privacy or security.

## ✨ Features

- **🖥️ CLI encryption**: Fast, secure local folder encryption
- **🌐 Web decryption**: Decrypt on any device with just a browser
- **🔐 Privacy-first**: Filenames, metadata, and content all encrypted
- **📦 Portable output**: Generates standard ZIP files for easy sharing

## 🏗️ How It Works

1. **Encrypt locally** using the Python CLI tool
2. **Share the encrypted folder** via any method (cloud, USB, etc.)
3. **Decrypt anywhere** using the browser-based WebDecryptor
4. **Download as ZIP** containing your original files

## 📁 Encrypted Folder Structure

```
encrypted_folder/
├── manifest.json.enc    # Encrypted file metadata
├── salt.bin            # Key derivation salt
├── a1b2c3d4.enc       # Encrypted files (randomized names)
├── e5f6g7h8.enc
└── ...
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Modern web browser (for decryption)

### Installation

```bash
git clone https://github.com/Viraj2313/portable-encryptor.git
cd portable-encryptor
pip install .
```

### Basic Usage

**Encrypt a folder:**

```bash
encryptor encrypt --input my_secret_folder --output encrypted_folder
```

**Decrypt using CLI:**

```bash
encryptor decrypt encrypted_folder decrypted_output
```

**Decrypt using browser:**

1. visit: https://protable-decryptor.duckdns.org
2. Drag and drop the encrypted folder contents
3. Enter your password
4. Click "Decrypt & Download ZIP"

## 📖 Detailed Usage

### CLI Commands

#### Encrypt Command

```bash
encryptor encrypt [OPTIONS] --input INPUT_FOLDER --output OUTPUT_FOLDER
```

Options:

- `--input, -i`: Path to folder to encrypt (required)
- `--output, -o`: Path for encrypted output folder (required)
- `--password, -p`: Password (will prompt if not provided)
- `--iterations`: PBKDF2 iterations (default: 100,000)

#### Decrypt Command

```bash
encryptor decrypt [OPTIONS] ENCRYPTED_FOLDER OUTPUT_FOLDER
```

Options:

- `--password, -p`: Password (will prompt if not provided)

### Web Decryption

The WebDecryptor (`decrypt.html`) provides a user-friendly interface for decryption:

1. **File Selection**: Drag & drop or browse to select encrypted files
2. **Password Entry**: Secure password input with visibility toggle
3. **Decryption**: Client-side processing with progress indication
4. **Download**: Automatic ZIP file generation and download

**Required files for web decryption:**

- `manifest.json.enc`
- `salt.bin`
- All `.enc` files from the encrypted folder

## 🔒 Security Details

### Encryption Specifications

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with HMAC-SHA256
- **Iterations**: 100,000 (configurable)
- **Salt**: 32 bytes, cryptographically random
- **IV**: 12 bytes per file, cryptographically random
- **Authentication**: Built-in authentication tags prevent tampering

### Privacy Features

- **Filename encryption**: Original filenames are encrypted and stored in the manifest
- **Metadata protection**: File sizes, timestamps, and structure are encrypted
- **Randomized storage**: Encrypted files have random names to prevent analysis
- **Client-side processing**: Web decryption happens entirely in your browser

### Security Considerations

- Passwords are never stored or transmitted
- Web decryption is fully client-side
- Encrypted files are indistinguishable from random data

## 🛠️ Development

### Project Structure

```
portable-encryptor/
├── src/
│   ├── portable_encryptor/
│   │   ├── __init__.py
│   │   ├── cli.py
│   │   ├── crypto.py
│   │   └── utils.py
│   └── decrypt.html
├── pyproject.toml
├── requirements.txt
└── README.md
```

## 🔧 Dependencies

### CLI Tool

- `cryptography` - Cryptographic operations
- `typer` - CLI framework
- `click` - Command-line utilities

### Web Decryption

- No dependencies - uses native Web Crypto API

## 📋 Use Cases

- **Sensitive document backup**: Encrypt personal documents before cloud storage
- **Secure file sharing**: Share encrypted folders via any medium
- **Remote access**: Decrypt files on devices where you can't install software
- **Mobile decryption**: Access encrypted files on phones and tablets
- **Cross-platform workflows**: Encrypt on one OS, decrypt on another

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

_Created by **Viraj** with security and privacy in mind._
