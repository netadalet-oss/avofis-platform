"""Deterministic L4 source, offline preview, screenshot and evidence package."""
import hashlib,zipfile,json,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'LARENLEX_ANDROID_L4_TUM_UYGULAMA_KAYNAK_ONIZLEME_KANIT_2026-11-01.zip'
files=[p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files.sort(key=lambda p:p.relative_to(ROOT).as_posix())
entries={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
manifest=''.join(f'{h}  {path}\n' for path,h in entries.items())
with zipfile.ZipFile(OUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
    for p in files:z.write(p,p.relative_to(ROOT).as_posix())
    z.writestr('SHA256SUMS.txt',manifest)
with zipfile.ZipFile(OUT) as z:
    assert z.testzip() is None
    for name,expected in entries.items():assert hashlib.sha256(z.read(name)).hexdigest()==expected
print(json.dumps({'zip':str(OUT),'files':len(entries),'bytes':OUT.stat().st_size,'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()},ensure_ascii=False))
