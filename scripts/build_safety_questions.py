#!/usr/bin/env python3
"""Build 48 diverse and traceable occupational-safety image questions.
Source: official Ultralytics Construction-PPE and Roboflow Construction Site Safety
Kaggle mirror. This is an annotated visual judgment *prototype*, not a validated
experiment. No unsafe act is inferred from an object's mere presence.
"""
from __future__ import annotations
import csv
import io
import json
import os
import random
import re
import shutil
import tempfile
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image, ImageOps

OUT=Path("docs/safety-quiz")
IMAGE_DIR=OUT/"images"
URLS={
 "ultralytics":"https://github.com/ultralytics/assets/releases/download/v0.0.0/construction-ppe.zip",
 "roboflow":"https://www.kaggle.com/api/v1/datasets/download/snehilsanyal/construction-site-safety-image-dataset-roboflow"
}
SOURCE_INFO={
 "ultralytics":{
  "name":"Ultralytics Construction-PPE",
  "url":"https://docs.ultralytics.com/datasets/detect/construction-ppe/",
  "license":"AGPL-3.0 (per dataset documentation)",
  "classNames":{0:"helmet",1:"gloves",2:"vest",3:"boots",4:"goggles",5:"none",6:"Person",7:"no_helmet",8:"no_goggle",9:"no_gloves",10:"no_boots"}
 },
 "roboflow":{
  "name":"Roboflow Construction Site Safety (Kaggle mirror)",
  "url":"https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety/dataset/28",
  "license":"CC BY 4.0 (per Roboflow project; confirm for each image)",
  "classNames":{0:"Hardhat",1:"Mask",2:"NO-Hardhat",3:"NO-Mask",4:"NO-Safety Vest",5:"Person",6:"Safety Cone",7:"Safety Vest",8:"machinery",9:"vehicle"}
 }
}
# Source, YOLO class index, quantity, question in plain Taiwanese Mandarin, min visible target box area.
CATEGORIES=[
 ("防護手套","ultralytics",1,6,"畫面中是否可看到有人戴著防護手套？",.009),
 ("警示錐","roboflow",6,6,"畫面中是否可看到用於提醒通行者的安全警示錐？",.015),
 ("施工機具","roboflow",8,6,"畫面中是否可辨認大型施工機具？",.04),
 ("護目鏡","ultralytics",4,6,"畫面中是否可看到有人配戴護目鏡？",.006),
 ("工程車輛","roboflow",9,6,"畫面中是否可看到工程施工車輛？",.04),
 ("安全鞋","ultralytics",3,6,"畫面中是否可看到作業人員穿著防護靴／安全鞋？",.009),
 ("防護口罩","roboflow",1,4,"畫面中是否可看到有人佩戴防護口罩？",.012),
 ("反光背心","roboflow",7,4,"畫面中是否可看到工地人員穿著反光安全背心？",.025),
 ("安全帽","ultralytics",0,4,"畫面中是否可看到有人佩戴安全帽？",.016),
]
assert sum(c[3] for c in CATEGORIES)==48

def download(url,target):
 if target.is_file() and zipfile.is_zipfile(target): return
 req=urllib.request.Request(url,headers={"User-Agent":"industrial-safety-protocol-demo/1.0","Accept":"application/octet-stream"})
 print("Downloading",url,flush=True)
 with urllib.request.urlopen(req,timeout=150) as response, open(target,"wb") as f:
  shutil.copyfileobj(response,f,length=1024*1024)
 if not zipfile.is_zipfile(target):
  raise RuntimeError(f"Download is not a zip: {url} (bytes={target.stat().st_size})")
 print("ZIP downloaded",target.stat().st_size,flush=True)

def find_entries(z):
 names=[n for n in z.namelist() if not n.endswith("/")]
 image_names=[n for n in names if re.search(r"/(?:train|valid|val|test)/images/[^/]+\.(?:jpg|jpeg|png)$",n,re.I)]
 if not image_names:
  image_names=[n for n in names if re.search(r"(?:^|/)images/(?:train|val|valid|test)/[^/]+\.(?:jpg|jpeg|png)$",n,re.I)]
 label_names=[n for n in names if n.lower().endswith(".txt") and ("labels/" in n or "/labels" in n)]
 labels={n.lower():n for n in label_names}
 out=[]
 for name in image_names:
  label=re.sub(r"(?i)/images/", "/labels/",name)
  label=re.sub(r"(?i)\.(?:jpg|jpeg|png)$",".txt",label)
  # Alternate convention: images/train/file.jpg and labels/train/file.txt
  if label.lower() not in labels:
   alt=re.sub(r"(?i)images/(train|valid|val|test)/",r"labels/\1/",name)
   alt=re.sub(r"(?i)\.(?:jpg|jpeg|png)$",".txt",alt)
   label=alt
  if label.lower() not in labels:
   continue
  try:
   raw=z.read(labels[label.lower()]).decode("utf-8-sig").strip()
   boxes=[]
   for row in raw.splitlines():
    p=row.strip().split()
    if len(p)>=5:
     c=int(float(p[0]));x,y,w,h=map(float,p[1:5])
     if 0<=x<=1 and 0<=y<=1 and 0<w<=1 and 0<h<=1:boxes.append((c,x,y,w,h))
   if not boxes:continue
   # augmentation filename suffix from Roboflow; keep a single variant per original
   stem=Path(name).stem
   original=re.split(r"(?i)[._]rf[._]",stem)[0]
   original=re.sub(r"(?i)_(?:jpg|jpeg|png)$","",original)
   out.append({"file":name,"labels":labels[label.lower()],"boxes":boxes,"original":original})
  except Exception as exc:
   print("Skipped annotation:",name,str(exc)[:70],flush=True)
 print("Parsed labeled source images:",len(out),flush=True)
 if len(out)<50:raise RuntimeError("Not enough labeled images in archive; check dataset structure")
 return out

def is_work_scene(a,source):
 # Reject Roboflow's four-panel mosaic training images and unrelated racing videos.
 # Ultralytics' generic images contain gyms, children, musicians and labs; use PPE/site context.
 name=a["file"].lower()
 classes={x[0] for x in a["boxes"]}
 if source=="roboflow":
  if "/train/" in name or "autox" in name or "race" in name: return False
  return bool(classes.intersection({0,5,6,7,8,9}))
 return 6 in classes and (0 in classes or 2 in classes)

def choose(target,zitems,chosen,amount,threshold,rng,source):
 # Only consider photos with a concrete worksite/PPE context, not generic people photos.
 zitems=[a for a in zitems if is_work_scene(a,source)]
 yes=[a for a in zitems if any(c==target and w*h>=threshold for c,x,y,w,h in a["boxes"])]
 no=[a for a in zitems if not any(c==target for c,x,y,w,h in a["boxes"]) and len(a["boxes"])>=1]
 print("Candidate pool",source,target,"yes",len(yes),"no",len(no),flush=True)
 def rank(a,positive):
  target_areas=[w*h for c,x,y,w,h in a["boxes"] if c==target]
  return (max(target_areas,default=0) if positive else .03)+rng.random()*.04
 yes.sort(key=lambda a:rank(a,True),reverse=True)
 no.sort(key=lambda a:rank(a,False),reverse=True)
 out=[]
 # 50% present / absent ensures judgments are not all YES.
 for positive in ([True,False]*((amount+1)//2))[:amount]:
  pool=yes if positive else no
  picked=next((x for x in pool if (source,x["original"]) not in chosen),None)
  if not picked:raise RuntimeError(f"Not enough distinct {source} images for label {target}: {positive}")
  chosen.add((source,picked["original"]))
  out.append((picked,positive))
 return out

def main():
 OUT.mkdir(parents=True,exist_ok=True);IMAGE_DIR.mkdir(parents=True,exist_ok=True)
 rng=random.Random(20261029)
 cache=Path(".cache/safety")
 cache.mkdir(parents=True,exist_ok=True)
 if True:
  d=cache
  zips={};items={}
  for code,url in URLS.items():
   path=Path(d)/(code+".zip")
   download(url,path)
   z=zipfile.ZipFile(path)
   zips[code]=z
   items[code]=find_entries(z)
  chosen=set()
  groups=[]
  for category,code,label,qty,prompt,threshold in CATEGORIES:
   selections=choose(label,items[code],chosen,qty,threshold,rng,code)
   group=[]
   for source_item,present in selections:
    group.append((category,code,label,prompt,source_item,present))
   groups.append(group)
  # Allocate 48 photos across 4 experimental cells with 6 YES and 6 NO per cell.
  # Four preview questions deliberately cover 4 separate topics, including machinery and cones.
  remaining=[record for group in groups for record in group]
  ordered=[]
  cellCount=Counter()
  firstCategories=["防護手套","警示錐","施工機具","護目鏡"]
  for pos in range(48):
   cell=((pos//4)+(pos%4))%4
   occurrence=cellCount[cell]
   shouldBePresent=occurrence%2==cell%2
   cellCount[cell]+=1
   possibilities=[a for a in remaining if a[5]==shouldBePresent]
   if pos<4:
    possibilities=[a for a in possibilities if a[0]==firstCategories[pos]]
   usedRecent={a[0] for a in ordered[-3:]}
   cellUsage=Counter(a[0] for j,a in enumerate(ordered) if ((j//4)+(j%4))%4==cell)
   possibilities.sort(key=lambda a:(a[0] in usedRecent,cellUsage[a[0]],rng.random()))
   if not possibilities: raise RuntimeError("Unable to balance visual condition and category at item "+str(pos))
   chosenItem=possibilities[0]
   ordered.append(chosenItem)
   remaining.remove(chosenItem)
  assert len(ordered)==48
  assert Counter(( ((i//4)+(i%4))%4, x[5]) for i,x in enumerate(ordered))==Counter({(cell,flag):6 for cell in range(4) for flag in [True,False]})
  results=[]
  for i,(category,code,label,prompt,item,present) in enumerate(ordered):
   file=f"q{i+1:02d}.jpg"
   raw=zips[code].read(item["file"])
   with Image.open(io.BytesIO(raw)) as src:
    im=ImageOps.exif_transpose(src).convert("RGB")
    im.thumbnail((1200,900),Image.Resampling.LANCZOS)
    im.save(IMAGE_DIR/file,quality=88,optimize=True,subsampling=0)
   # Explicitly negative phrasing on an object-absent source image is not needed; same question, yes/no depends on label.
   size=(IMAGE_DIR/file).stat().st_size
   if size<2500:raise ValueError("Image is unexpectedly tiny "+file)
   info=SOURCE_INFO[code]
   results.append({
    "id":"S"+f"{i+1:03d}","image":"./images/"+file,"prompt":prompt,"correct":"是" if present else "否",
    "category":category,"source":info["name"],"sourceURL":info["url"],"sourceLicense":info["license"],
    "sourceOriginal":item["original"],"sourceFile":item["file"],"sourceLabel":item["labels"],
    "className":info["classNames"][label],"classId":label,"hasTargetAnnotation":present,
    "imageBytes":size
   })
  unique=len(set((q["source"],q["sourceOriginal"]) for q in results))
  if unique!=48:raise RuntimeError(f"Duplicate original images: {unique}")
  if Counter(x["correct"] for x in results)!={"是":24,"否":24}:raise RuntimeError("Answer imbalance")
  if len(set(x["category"] for x in results))!=9:raise RuntimeError("Category imbalance")
  with (OUT/"data.json").open("w",encoding="utf-8") as f:json.dump(results,f,ensure_ascii=False,indent=2)
  with (OUT/"sources.csv").open("w",newline="",encoding="utf-8-sig") as f:
   w=csv.DictWriter(f,fieldnames=list(results[0].keys()));w.writeheader();w.writerows(results)
  print("BUILD COMPLETE:",len(results),"questions /",Counter(q["category"] for q in results),
    "yes/no",Counter(q["correct"] for q in results),flush=True)
  print("COPYRIGHT: Images remain attributed to upstream sources; confirm per-file license before formal use.",flush=True)
  for z in zips.values():z.close()

if __name__=="__main__":main()
