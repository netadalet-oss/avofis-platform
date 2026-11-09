#!/usr/bin/env python3
"""Source integrity checker. Input: exact original LarenLex transfer ZIP."""
import csv,io,sys,json,hashlib,zipfile,collections
from pathlib import Path
ORIGINAL="fe9000bcf5631101cd63202ea4b79e395120f96e8ca0c3c5dd8364362da8d305"
V86="0918445c9368c9e0672854d53682da61bd9122e8f9f77911bee38a159cef194b"
PARTS={
 "P01":("5f584c2491d86861b63de7a135290e872c60fe0d42a3f48460ff22858121616e",555),
 "P02":("6e251676b6677039f31e300690c0516528077c874374de9ec2ddef8fcd09906a",1017),
 "P03":("83beea437544a0e6b11a88edee79e7cf55807709677850b822dc71284933f7e0",1102),
 "P04":("539cebd7599f7bc517c3e0a2ebecffa7259b7b146641e3efd0d9ffb93bf40134",551),
 "P05":("295bfbb205fef70d6ef29448492499af35bdc2838dc59b183c6d56dd576d9016",72),
 "P06":("2e641fad5c2bb63b6d6db0c86d027ced6916e079aaf525ff7931334c8d12d7e4",449),
 "P07":("cd8dcf2beeddf4cb7530ceaadd4388dbe34ac75c98854e50858676e895b780c1",11)}
def sha(data):return hashlib.sha256(data).hexdigest()
def check(p):
 h=hashlib.sha256()
 with p.open("rb") as f:
  for block in iter(lambda:f.read(1<<20),b""):h.update(block)
 assert h.hexdigest()==ORIGINAL,"transfer SHA mismatch"
 with zipfile.ZipFile(p) as outer:
  assert outer.testzip() is None
  raw=outer.read("KAYNAK_V86/AVOfis_v86_TUM_CALISMALAR_TEK_ZIP_2026-11-08.zip")
  assert sha(raw)==V86,"v86 SHA mismatch"
  catalog=list(csv.DictReader(io.StringIO(outer.read("W1_GITHUB_GOLD/LarenLex_W1_V86_554_KART_KATALOGU.csv").decode("utf-8-sig"))))
  assert len(catalog)==len({c["id"] for c in catalog})==554
  report={"cards":0,"part_counts":{},"by_part":dict(collections.Counter(c["part"] for c in catalog))}
  with zipfile.ZipFile(io.BytesIO(raw)) as v:
   assert v.testzip() is None
   for k,(digest,count) in PARTS.items():
    names=[n for n in v.namelist() if n.startswith("01_AYRI_PAKETLER/") and "_"+k+"_" in n]
    assert len(names)==1,k
    dat=v.read(names[0]);assert sha(dat)==digest,k
    with zipfile.ZipFile(io.BytesIO(dat)) as inner:
     assert inner.testzip() is None,k
     assert len([a for a in inner.infolist() if not a.is_dir()])==count,k
     if k=="P01":
      for c in catalog:
       assert sha(inner.read(c["path"]))==c["sha256"],c["id"]
       report["cards"]+=1
    report["part_counts"][k]=count
 print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=="__main__":
 if len(sys.argv)!=2:raise SystemExit("Usage: python verify_v86.py original_transfer.zip")
 check(Path(sys.argv[1]))
