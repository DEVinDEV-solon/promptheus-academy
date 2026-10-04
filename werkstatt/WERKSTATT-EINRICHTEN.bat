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

rem   Nur aus dem Ordner "werkstatt" der Academy startbar. Am 04.10.2026
rem   lag eine Kopie im Download-Ordner und endete mit einem Node-Fehler.
if not exist "%DASH%\werkzeuge\einrichten.mjs" goto falscher_ort

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

rem --- Falscher Ort (ohne Klammerblock: ein Pfad mit "(x86)" braeche ihn)
:falscher_ort
echo.
echo  FEHLER: Diese Datei liegt nicht im Werkstatt-Ordner der Academy.
echo  Sie liegt hier:  %DASH%
echo.
echo  Sie gehoert in den Ordner "werkstatt" der Academy, zum Beispiel
echo    C:\Promptheus\werkstatt\WERKSTATT-EINRICHTEN.bat
echo  So geht es: In der Academy unter Einstellungen - Werkstatt
echo  auf "Ordner oeffnen" klicken und die Datei dort starten.
echo  Diese Kopie hier kann geloescht werden.
echo.
pause
exit /b 1
