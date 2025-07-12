import os
from encryptor.crypto_utils import encrypt_file, derive_key
from encryptor.manifest_builder import build_manifest

def encrypt_folder(input_path, output_path, password):
    os.makedirs(output_path, exist_ok=True)
    key, salt = derive_key(password)
    manifest = []

    for root, _, files in os.walk(input_path):
        for fname in files:
            fpath = os.path.join(root, fname)
            with open(fpath, "rb") as f:
                data = f.read()
            encrypted_data, iv = encrypt_file(data, key)
            encrypted_fname = os.urandom(16).hex() + ".enc"
            with open(os.path.join(output_path, encrypted_fname), "wb") as ef:
                ef.write(encrypted_data)
            manifest.append({
                "original_name": fname,
                "encrypted_name": encrypted_fname,
                "iv": iv.hex()
            })

    build_manifest(manifest, key, salt, output_path)
    with open(os.path.join(output_path, "salt.bin"), "wb") as f:
        f.write(salt)
