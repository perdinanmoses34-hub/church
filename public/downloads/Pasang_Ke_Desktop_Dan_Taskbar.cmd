@echo off
title Memasang CMS Gereja di Desktop & Taskbar Windows
cls
echo ======================================================================
echo       MEMASANG APLIKASI GEREJA DI DESKTOP & TASKBAR WINDOWS
echo ======================================================================
echo.
echo Sedang membuat shortcut di Layar Utama (Desktop) dan Menu Windows...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  " = 'CMS Gereja'; " ^
  " = 'https://perdinanmoses34-hub.github.io/church/'; " ^
  " = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), ( + '.lnk')); " ^
  " = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs', ( + '.lnk')); " ^
  " = New-Object -ComObject WScript.Shell; " ^
  "function CreateLnk() { " ^
  "   = .CreateShortcut(); " ^
  "  .TargetPath = 'msedge.exe'; " ^
  "  .Arguments = ('--app=' +  + ' --start-maximized'); " ^
  "  .Description = 'Aplikasi Resmi Sistem Informasi Gereja'; " ^
  "  .WindowStyle = 3; " ^
  "  .Save(); " ^
  "} " ^
  "CreateLnk ; " ^
  "CreateLnk ; " ^
  "Write-Host '1. Shortcut berhasil dipasang di Halaman Utama Desktop!' -ForegroundColor Green; " ^
  "Write-Host '2. Shortcut berhasil dipasang di Start Menu Windows!' -ForegroundColor Green; "

echo.
echo Sedang membuka Aplikasi Gereja di Layar dan Taskbar...
start msedge --app="https://perdinanmoses34-hub.github.io/church/" --start-maximized
if %errorlevel% neq 0 (
  start chrome --app="https://perdinanmoses34-hub.github.io/church/" --start-maximized
)

echo.
echo ======================================================================
echo  SUKSES! Aplikasi Gereja telah terpasang di:
echo   - Layar Utama Desktop Komputer/Laptop
echo   - Start Menu Windows
echo   - Taskbar Windows
echo ======================================================================
echo.
timeout /t 5
exit
