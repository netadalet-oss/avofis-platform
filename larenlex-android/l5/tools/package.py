"""Creates checksummed local source ZIP after Git snapshot bundle is available."""
from pathlib import Path
import hashlib,zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data/LARENLEX_ANDROID_L5_TUM_UYGULAMA_KAYNAK_ONIZLEME_KANIT_2026-11-01.zip')
FILES=sorted(x for x in ROOT.rglob('*') if x.is_file() and '__pycache__' not in x.parts and not any(y=='.git' for y in x.parts))
manifest=[]
with zipfile.ZipFile(OUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in FILES:
        name='LARENLEX_ANDROID_L5/'+p.relative_to(ROOT).as_posix()
        body=p.read_bytes()
        z.writestr(name,body)
        manifest.append(f'{hashlib.sha256(body).hexdigest()}  {name}')
    z.writestr('SHA256SUMS.txt','\n'.join(manifest)+'\n')
with zipfile.ZipFile(OUT) as z:
    assert z.testzip() is None
    for line in z.read('SHA256SUMS.txt').decode().splitlines():
        sha,name=line.split('  ',1)
        assert hashlib.sha256(z.read(name)).hexdigest()==sha
print('ZIP VERIFIED',OUT,len(manifest),'content files',OUT.stat().st_size,'bytes')
