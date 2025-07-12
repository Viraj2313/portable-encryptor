import os, json
from encryptor.crypto_utils import derive_key, decrypt_file

def decrypt_folder(encrypted_path, output_path, password):
    with open(os.path.join(encrypted_path, "salt.bin"), "rb") as f:
        salt = f.read()
    key, _ = derive_key(password, salt)
    with open(os.path.join(encrypted_path, "manifest.json.enc"), "rb") as f:
        iv = f.read(12)
        encrypted = f.read()
    manifest_json = decrypt_file(encrypted, key, iv)
    manifest_data = json.loads(manifest_json)
    os.makedirs(output_path, exist_ok=True)

    for file in manifest_data["files"]:
        enc_path = os.path.join(encrypted_path, file["encrypted_name"])
        with open(enc_path, "rb") as f:
            encrypted_data = f.read()
        iv = bytes.fromhex(file["iv"])
        decrypted = decrypt_file(encrypted_data, key, iv)
        with open(os.path.join(output_path, file["original_name"]), "wb") as f:
            f.write(decrypted)
