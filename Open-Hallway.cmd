@echo off
cd /d "%~dp0"
node scripts\open-hallway.mjs
if errorlevel 1 pause
