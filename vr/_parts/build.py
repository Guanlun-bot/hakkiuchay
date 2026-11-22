#!/usr/bin/env python3
"""把 vr/_parts/ 的分段組成一個完整的 vr-house.js，給本機測試或檢查語法用。

GitHub Pages 上線時由 Jekyll 自己組檔，不需要跑這支程式。
想在自己電腦上看書齋，用根目錄的「預覽書齋」（serve.py）就好，它會自動組檔。
這支是只想檢查程式有沒有寫壞時用的：

    python3 vr/_parts/build.py              # 輸出到 _site-vr/vr-house.js
    python3 vr/_parts/build.py 輸出檔路徑
組好後會自動用 node 檢查語法（有裝 node 的話）。
"""
import os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VR = os.path.dirname(HERE)
ROOT = os.path.dirname(VR)

OPEN, CLOSE = '// {% raw %}', '// {% endraw %}'


class PartError(Exception):
    pass


def assemble():
    """照 vr/vr-house.js 的順序把分段接起來，結果跟 GitHub Pages 上的一樣。"""
    main = open(os.path.join(VR, 'vr-house.js'), encoding='utf-8').read()
    main = re.sub(r'\A---\n(?:.*?\n)?---\n', '', main, flags=re.S)  # front matter

    def part(m):
        name = m.group(1)
        try:
            text = open(os.path.join(VR, name), encoding='utf-8').read()
        except FileNotFoundError:
            raise PartError(f'vr/vr-house.js 要接 {name}，但找不到這個檔')
        if not text.startswith(OPEN) or not text.rstrip('\n').endswith(CLOSE):
            raise PartError(f'{name}：第一行要是 {OPEN}、最後一行要是 {CLOSE}（Jekyll 組檔需要，請不要刪）')
        body = text[len(OPEN):text.rindex(CLOSE)]
        if '{% endraw %}' in body:
            raise PartError(f'{name}：程式中間出現了 {{% endraw %}}，Jekyll 會組錯')
        return '// ' + body + '// '

    js = re.sub(r'\{% include_relative (\S+) %\}', part, main)
    if '{% include_relative' in js:
        raise PartError('vr/vr-house.js 裡有一行 include_relative 格式不對，沒有展開')
    return js


def syntax_error(js):
    """有裝 node 就檢查語法；沒錯回傳 None，有錯回傳錯誤訊息。"""
    node = shutil.which('node')
    if not node:
        return None
    tmp = os.path.join(ROOT, '_site-vr', 'check.mjs')
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    open(tmp, 'w', encoding='utf-8').write(js)
    try:
        r = subprocess.run([node, '--check', tmp], capture_output=True, text=True, encoding='utf-8', errors='replace')
    finally:
        os.remove(tmp)
    return r.stderr if r.returncode else None


if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(errors='replace')
    except Exception:
        pass
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_site-vr', 'vr-house.js')
    try:
        js = assemble()
    except PartError as e:
        sys.exit(str(e))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(js)
    print('已組好：', out, f'（{js.count(chr(10))} 行）')
    err = syntax_error(js)
    if err:
        sys.exit('語法錯誤：\n' + err)
    print('語法檢查通過' if shutil.which('node') else '（沒有裝 node，略過語法檢查）')
