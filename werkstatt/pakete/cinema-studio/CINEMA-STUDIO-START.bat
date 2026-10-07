@echo off
rem ============================================================
rem  PROMPTHEUS CINEMA STUDIO - Start
rem
rem  Bilder, Videos und Audio auf http://127.0.0.1:8796
rem
rem  Geoeffnet wird es AUS DER WERKSTATT (Menuelink links
rem  "Cinema-Studio"). Die Werkstatt legt dafuer ein Ticket ab
rem  (zugang\ticket.json, zwei Minuten, einmalig); ohne Ticket
rem  startet Cinema Studio nicht. Einen Start ohne Ticket gibt
rem  es bewusst nicht. Geprueft wird im Server (zugang.py),
rem  nicht hier - so hilft auch "python server.py" nicht vorbei.
rem
rem  Der Ordner wird aus der Lage dieser Datei bestimmt - kein
rem  fester Pfad, laeuft in jeder Installation.
rem ============================================================
setlocal enabledelayedexpansion
title PROMPTHEUS Cinema Studio
set "STUDIO=%~dp0"
if "%STUDIO:~-1%"=="\" set "STUDIO=%STUDIO:~0,-1%"
cd /d "%STUDIO%"

if not exist "%STUDIO%\server.py" goto falscher_ort
if not exist "%STUDIO%\zugang.py" goto falscher_ort

rem --- Port aus .env lesen (Standard 8796) ---
set "PORT=8796"
if exist ".env" (
  for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    if /i "%%A"=="BILDGEN_PORT" set "PORT=%%B"
  )
)
set "PORT=%PORT: =%"

rem --- Python suchen (Store-Attrappe in WindowsApps wird uebersprungen) ---
set "PY="
if exist "D:\Python314\python.exe" set "PY=D:\Python314\python.exe"
if not defined PY if exist "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python314\python.exe"
if not defined PY (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    echo %%P | find /i "WindowsApps" >nul
    if errorlevel 1 if not defined PY set "PY=%%P"
  )
)
if not defined PY (
  echo.
  echo  FEHLER: Python 3.10 oder neuer wurde nicht gefunden.
  echo  So geht es: Python installieren mit
  echo    winget install Python.Python.3.12
  echo  und danach in der Werkstatt erneut auf "Cinema-Studio" klicken.
  echo.
  pause
  exit 1
)

echo.
echo  PROMPTHEUS Cinema Studio
echo  ---------------------------------------------
echo  Adresse  : http://127.0.0.1:%PORT%/
echo  Dieses Fenster offen lassen = Cinema Studio laeuft.
echo  Beenden mit Strg+C oder Fenster schliessen.
echo.

"%PY%" server.py
set "RC=%ERRORLEVEL%"
echo.
rem Rueckgabewert 3: kein Ticket - den Hinweis hat der Server schon ausgegeben.
if "%RC%"=="3" goto ende
echo  Cinema Studio beendet.
:ende
pause
rem "exit" ohne /b: Die Werkstatt startet diese Datei ueber "start", und
rem dort bliebe nach "exit /b" eine leere Eingabeaufforderung offen.
exit %RC%

rem --- Falscher Ort (ohne Klammerblock: ein Pfad mit "(x86)" braeche ihn)
:falscher_ort
echo.
echo  FEHLER: Diese Datei liegt nicht im Ordner von Cinema Studio.
echo  Sie liegt hier:  %STUDIO%
echo.
echo  Sie gehoert neben server.py. Geoeffnet wird Cinema Studio
echo  ohnehin aus der Werkstatt: links unten auf "Cinema-Studio".
echo  Diese Kopie hier kann geloescht werden.
echo.
pause
exit 1
