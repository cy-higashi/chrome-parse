# crx_version_check.py
import sys

fn = sys.argv[1]
with open(fn, 'rb') as f:
    magic = f.read(4)
    version = int.from_bytes(f.read(4), 'little')
print(f'{fn}: magic={magic!r}, version={version}')
