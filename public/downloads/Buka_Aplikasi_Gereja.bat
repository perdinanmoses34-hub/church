@echo off
title CMS Gereja Windows Desktop
cls
echo Membuka Aplikasi Gereja Layar Penuh...
start msedge --app="https://perdinanmoses34-hub.github.io/church/" --start-maximized
if %errorlevel% neq 0 (
  start chrome --app="https://perdinanmoses34-hub.github.io/church/" --start-maximized
)
exit
