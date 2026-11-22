#!/usr/bin/env python3
"""把 vr/_parts/ 的分段組成一個完整的 vr-house.js，給本機測試或檢查語法用。

GitHub Pages 上線時由 Jekyll 自己組檔，不需要跑這支程式；
只有不想裝 Jekyll、又想在本機測 3D 或跑 `node --check` 時才用。

用法（在儲存庫根目錄）：
    python3 vr/_parts/build.py              # 輸出到 _site-vr/vr-house.js
    python3 vr/_parts/build.py 輸出檔路徑
組好後會自動用 node 檢查語法（有裝 node 的話）。
"""
import os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VR = os.path.dirname(HERE)
ROOT = os.path.dirname(VR)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_site-vr', 'vr-house.js')

main = open(os.path.join(VR, 'vr-house.js'), encoding='utf-8').read()
main = re.sub(r'\A---\n.*?\n---\n', '', main, flags=re.S)  # front matter


def part(m):
    path = os.path.join(VR, m.group(1))
    text = open(path, encoding='utf-8').read()
    if not text.startswith('// {% raw %}') or not text.rstrip('\n').endswith('// {% endraw %}'):
        sys.exit(f'{m.group(1)}：第一行要是 // {{% raw %}}、最後一行要是 // {{% endraw %}}（Jekyll 組檔需要，請不要刪）')
    body = text[len('// {% raw %}'):text.rindex('// {% endraw %}')]
    if '{% endraw %}' in body:
        sys.exit(f'{m.group(1)}：程式中間出現了 {{% endraw %}}，Jekyll 會組錯')
    return '// ' + body + '// '


js = re.sub(r'\{% include_relative (\S+) %\}', part, main)
if '{% include_relative' in js:
    sys.exit('vr-house.js 裡有一行 include_relative 格式不對，沒有展開')

os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(js)
print('已組好：', out, f'（{js.count(chr(10))} 行）')

if shutil.which('node'):
    tmp = out[:-3] + '.check.mjs'
    shutil.copy(out, tmp)
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    os.remove(tmp)
    if r.returncode:
        sys.exit('語法錯誤：\n' + r.stderr)
    print('語法檢查通過')
