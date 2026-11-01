from pathlib import Path
import hashlib
import json
import zipfile
from datetime import datetime,timezone
R=Path(__file__).parent
out=R.parent/'LARENLEX_ANDROID_L3_TUM_UYGULAMA_KAYNAK_ONIZLEME_KANIT_2026-11-01.zip'
files=sorted([p for p in R.rglob('*') if p.is_file() and '__pycache__' not in p.parts and not p.name.endswith('.pyc') and p.name != 'L3_SHA256SUMS.txt'])
checks={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.name!='L3_SHA256SUMS.txt'}
sum_file=R/'evidence/L3_SHA256SUMS.txt'
sum_file.write_text(''.join(f'{checks[k]}  {k}\n' for k in sorted(checks)),encoding='utf-8')
files.append(sum_file)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for f in files:z.write(f,'larenlex_l3/'+str(f.relative_to(R)))
with zipfile.ZipFile(out) as z: assert z.testzip() is None
print(json.dumps({'zip':str(out),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(files)},ensure_ascii=False))
