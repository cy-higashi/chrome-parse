#!/usr/bin/env python3
"""
Pack Chrome extension into CRX3 (with proof) using Chrome CLI.
Run this script in PowerShell without additional arguments.
"""
import subprocess
import os

# === Configuration ===
# Path to Chrome executable
chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
# Source directory of the extension
src_dir = r"G:\共有ドライブ\★OD_管理者\データマネジメント部\DataOps\マーケティング\調査･情報収集ロジック\github-app\parse-app"
# PEM private key for packaging
key_file = r"G:\共有ドライブ\★OD_管理者\データマネジメント部\DataOps\マーケティング\調査･情報収集ロジック\github-app\parse-app.pem"
# === End Configuration ===

def pack_crx_with_chrome(chrome_path, extension_dir, pem_file):
    # Invoke Chrome to pack the extension in CRX3 format
    cmd = [
        chrome_path,
        f"--pack-extension={extension_dir}",
        f"--pack-extension-key={pem_file}",
        "--pack-extension-format=crx3"
    ]
    print("Executing:", " ".join(cmd))
    subprocess.run(cmd, check=True)

    base = os.path.basename(os.path.normpath(extension_dir))
    parent = os.path.dirname(os.path.normpath(extension_dir))
    crx_path = os.path.join(parent, f"{base}.crx")
    if not os.path.exists(crx_path):
        raise FileNotFoundError(f"Expected CRX not found: {crx_path}")
    return crx_path

if __name__ == "__main__":
    try:
        crx_file = pack_crx_with_chrome(chrome_exe, src_dir, key_file)
        print(f"Generated CRX3 with proof at: {crx_file}")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
