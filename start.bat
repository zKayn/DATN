@echo off
echo 🔄 Dang dung tat ca processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM next-server.exe /T >nul 2>&1
echo ✅ Da dung cac processes cu
echo ⏳ Doi 3 giay de ports duoc giai phong...
powershell -Command "Start-Sleep -Seconds 3"
echo ✅ San sang!
echo.
npm run dev
