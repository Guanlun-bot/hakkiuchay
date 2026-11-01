"""把 assets/uploads/home/ 裡還沒列進首頁的照片，依檔名順序加到 _data/photos.yml 最後面。"""
import os, yaml
HOME = "assets/uploads/home"
DATA = "_data/photos.yml"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
data = yaml.safe_load(open(DATA, encoding="utf-8")) if os.path.exists(DATA) else None
data = data or {}
photos = [p for p in (data.get("photos") or []) if isinstance(p, dict) and p.get("image")]
listed = {p["image"] for p in photos}
added = []
for name in sorted(os.listdir(HOME)):
    if os.path.splitext(name)[1].lower() not in EXTS:
        continue
    path = "/" + HOME + "/" + name
    if path not in listed:
        photos.append({"image": path})
        added.append(path)
data["photos"] = photos
with open(DATA, "w", encoding="utf-8") as f:
    yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)
print("新增：", added)
