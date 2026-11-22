@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 vr\_parts\serve.py
  goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python vr\_parts\serve.py
  goto end
)
echo 找不到 Python。請先到 https://www.python.org/downloads/ 下載安裝（安裝畫面要勾選 Add python.exe to PATH），裝好再雙擊一次。
:end
pause
