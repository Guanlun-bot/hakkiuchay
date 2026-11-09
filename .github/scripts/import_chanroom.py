"""一次性：把線上的禪修室（https://chanroom.pages.dev/）所有檔案原樣抓進 _chanroom/。

從 index.html、sw.js、manifest、CSS 裡找出所有相對路徑的檔案，逐一下載，最後列出清單與雜湊。
"""
import hashlib
import os
import re
import sys
import urllib.parse
import urllib.request

BASE = "https://chanroom.pages.dev/"
OUT = "_chanroom"
TEXT = (".html", ".js", ".css", ".webmanifest", ".json", ".svg", ".txt", ".md")
REF = re.compile(r"""(?:src|href)\s*=\s*["']([^"'#?]+)|url\(\s*["']?([^"')#?]+)|["'](\.?/?(?:[\w\-]+/)*[\w\-.]+\.(?:html|js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|mp3|m4a|ogg|wav|webmanifest|json|txt))["']""")


def get(path):
    req = urllib.request.Request(BASE + urllib.parse.quote(path), headers={"User-Agent": "hakkiuchay-import"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read(), r.headers.get("content-type", "")


def norm(base_dir, ref):
    if re.match(r"^[a-z]+:", ref) or ref.startswith("//") or ref.startswith("data:"):
        return None
    p = os.path.normpath(os.path.join(base_dir, ref.lstrip("/") if ref.startswith("/") else ref)).replace("\\", "/")
    if p.startswith("..") or p in (".", ""):
        return None
    return p


queue = ["index.html", "sw.js", "manifest.webmanifest", "config.js", "privacy.html"]
seen, saved, failed = set(), {}, []
while queue:
    p = queue.pop(0)
    if p in seen:
        continue
    seen.add(p)
    try:
        data, ctype = get(p)
    except Exception as e:
        failed.append(f"{p}: {e}")
        continue
    # Cloudflare 對不存在的路徑回傳首頁（200 text/html）：副檔名不是 html 卻拿到 html，就當作不存在
    if "text/html" in ctype and not p.endswith(".html") and data[:200].lstrip().lower().startswith(b"<!doctype"):
        failed.append(f"{p}: 不存在（回傳首頁）")
        continue
    dest = os.path.join(OUT, p)
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(data)
    saved[p] = hashlib.sha256(data).hexdigest()
    if p.endswith(TEXT):
        text = data.decode("utf-8", "replace")
        d = os.path.dirname(p)
        for m in REF.finditer(text):
            ref = next(g for g in m.groups() if g)
            n = norm(d, ref)
            if n and n not in seen:
                queue.append(n)

print(f"下載 {len(saved)} 個檔案")
for p in sorted(saved):
    print(saved[p][:12], p)
if failed:
    print("\n略過：")
    for f in failed:
        print("  ", f)
if "index.html" not in saved:
    sys.exit("沒有抓到 index.html")
