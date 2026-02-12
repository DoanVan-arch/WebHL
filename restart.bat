@echo off
echo ================================================
echo        XOA DATABASE VA KHOI DONG LAI SERVER
echo ================================================
echo.

echo [1/3] Dung server Python...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Xoa database cu...
del hoclieu.db 2>nul
if exist hoclieu.db (
    echo CANH BAO: Khong the xoa database. Vui long dong tat ca chuong trinh Python.
    pause
    exit /b 1
) else (
    echo OK: Da xoa database cu thanh cong
)

echo [3/3] Khoi dong server...
echo.
echo ================================================
echo Server dang khoi dong...
echo Truy cap: http://localhost:8000
echo Tai khoan: admin / admin123
echo ================================================
echo.

python main.py
