#!/bin/bash
# 線上書齋本機預覽（Mac）：雙擊就會開書齋的測試房
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  python3 vr/_parts/serve.py
else
  echo "找不到 Python 3。請先到 https://www.python.org/downloads/ 下載安裝，裝好再雙擊一次。"
  read -r -p "按 Enter 關閉"
fi
