@echo off
rem ============================================================
rem  PROMPTHEUS WERKSTATT - Einrichtung (einmalig)
rem
rem  Prueft Node, Git und pnpm, holt den DeepSeek Harness beim
rem  geprueften Stand, installiert die Abhaengigkeiten, legt das
rem  Profil "promptheus" an, fragt den OpenRouter-Schluessel ab
rem  und baut die PROMPTHEUS-Pakete. Mehrfach startbar: Erledigtes
rem  wird uebersprungen.
rem ============================================================
setlocal
title PROMPTHEUS Werkstatt - Einrichtung
set "DASH=%~dp0"
if "%DASH:~-1%"=="\" set "DASH=%DASH:~0,-1%"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  FEHLER: Node.js fehlt. Bitte Node 22.19 oder neuer installieren:
  echo    winget install OpenJS.NodeJS.LTS
  echo  Danach dieses Fenster schliessen und die Datei erneut starten.
  echo.
  pause
  exit /b 1
)

cd /d "%DASH%"
set "ARGS=%*"
if "%~1"=="--aus-start" set "ARGS="
node werkzeuge\einrichten.mjs %ARGS%
set "RC=%ERRORLEVEL%"
if not "%~1"=="--aus-start" pause
exit /b %RC%
