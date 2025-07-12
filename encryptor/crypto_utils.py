import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def derive_key(password: str, salt: bytes = None):
    if not salt:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100_000,
    )
    key = kdf.derive(password.encode())
    return key, salt

def encrypt_file(data: bytes, key: bytes):
    iv = os.urandom(12)
    aesgcm = AESGCM(key)
    encrypted = aesgcm.encrypt(iv, data, None)
    return encrypted, iv

def decrypt_file(encrypted: bytes, key: bytes, iv: bytes):
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(iv, encrypted, None)
