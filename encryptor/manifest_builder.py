import json
from encryptor.crypto_utils import encrypt_file

def build_manifest(manifest, key, output_path):
    manifest_data = {
        "files": manifest
    }
    
    json_bytes = json.dumps(manifest_data).encode("utf-8")
    encrypted, iv = encrypt_file(json_bytes, key)
    
    with open(f"{output_path}/manifest.json.enc", "wb") as f:
        f.write(iv + encrypted)