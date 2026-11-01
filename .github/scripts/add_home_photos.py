"""把這次新加進 assets/uploads/home/ 的照片，加到 _data/photos.yml 最後面。
只處理命令列傳入的檔案（這次推送新增的），不會把你在後台刪掉的照片加回來。"""
import os, sys, yaml
DATA = "_data/photos.yml"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
new_files = [f for f in sys.argv[1:] if f.startswith("assets/uploads/home/") and os.path.splitext(f)[1].lower() in EXTS and os.path.exists(f)]
if not new_files:
    print("沒有新照片"); sys.exit(0)
data = yaml.safe_load(open(DATA, encoding="utf-8")) or {}
photos = [p for p in (data.get("photos") or []) if isinstance(p, dict) and p.get("image")]
listed = {p["image"] for p in photos}
added = []
for f in sorted(new_files):
    path = "/" + f
    if path not in listed:
        photos.append({"image": path}); added.append(path)
data["photos"] = photos
with open(DATA, "w", encoding="utf-8") as fh:
    yaml.safe_dump(data, fh, allow_unicode=True, sort_keys=False)
print("新增：", added)
