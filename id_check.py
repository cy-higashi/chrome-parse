#!/usr/bin/env python3
"""
Generate Chrome extension ID from a PEM private key.

Usage:
  python3 generate_extension_id.py [keyfile.pem]

Requires:
  pip install cryptography
"""
import sys
import hashlib
import argparse
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

def load_private_key(path):
    with open(path, 'rb') as f:
        data = f.read()
    return serialization.load_pem_private_key(data, password=None, backend=default_backend())

def public_key_der(private_key):
    pub = private_key.public_key()
    return pub.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

def compute_ext_id(der_bytes):
    digest = hashlib.sha256(der_bytes).digest()
    first16 = digest[:16]
    ext_id = ''.join(
        chr(ord('a') + ((b >> 4) & 0xF)) + chr(ord('a') + (b & 0xF))
        for b in first16
    )
    return ext_id

def main():
    parser = argparse.ArgumentParser(description='Generate Chrome extension ID from PEM key')
    parser.add_argument('keyfile', nargs='?', default='key.pem', help='Path to PEM private key (default: key.pem)')
    args = parser.parse_args()

    try:
        private_key = load_private_key(args.keyfile)
    except Exception as e:
        sys.stderr.write(f'Error loading private key: {e}\n')
        sys.exit(1)

    der = public_key_der(private_key)
    ext_id = compute_ext_id(der)
    print(ext_id)

if __name__ == '__main__':
    main()
