@echo off
rem ============================================================
rem  PROMPTHEUS DECK - Start
rem
rem  Die Zentrale fuer alle Programme auf diesem Rechner:
rem  PROMPTHEUS Academy (Lokal, Werkstatt, Cinema-Studio, Webseite,
rem  Registrieren, Community) fest eingetragen, dazu eigene Programme
rem  und Web-Seiten.  http://127.0.0.1:8800  (nur lokal)
rem
rem  Der Server laeuft unsichtbar (pythonw) - es bleibt KEIN
rem  Terminalfenster offen. Laeuft er schon, oeffnet ein zweiter
rem  Doppelklick nur das DECK-Fenster. PROMPTHEUS-START.bat
rem  startet DECK beim ersten Start der Academy mit (Python noetig).
rem
rem  Optionen:
rem    PROMPTHEUS-DECK-START.bat --autostart-setzen an
rem    PROMPTHEUS-DECK-START.bat --autostart-setzen aus
rem ============================================================
setlocal
set "DIR=%~dp0"
cd /d "%DIR%"
if not exist "%DIR%server.py" goto falscher_ort

set "PYW="
if exist "%LOCALAPPDATA%\Programs\Python\Python314\pythonw.exe" set "PYW=%LOCALAPPDATA%\Programs\Python\Python314\pythonw.exe"
if not defined PYW if exist "%LOCALAPPDATA%\Programs\Python\Python313\pythonw.exe" set "PYW=%LOCALAPPDATA%\Programs\Python\Python313\pythonw.exe"
if not defined PYW if exist "%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe" set "PYW=%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe"
if not defined PYW if exist "%LOCALAPPDATA%\Programs\Python\Python311\pythonw.exe" set "PYW=%LOCALAPPDATA%\Programs\Python\Python311\pythonw.exe"
if not defined PYW if exist "D:\Python314\pythonw.exe" set "PYW=D:\Python314\pythonw.exe"
if not defined PYW for /f "delims=" %%P in ('where pythonw 2^>nul ^| findstr /v /i "WindowsApps"') do if not defined PYW set "PYW=%%P"
if not defined PYW goto kein_python

if /i "%~1"=="--autostart-setzen" goto autostart

start "" "%PYW%" "%DIR%server.py" --oeffnen
exit /b 0

:autostart
set "PY=%PYW:pythonw.exe=python.exe%"
"%PY%" "%DIR%server.py" --autostart-setzen %2
pause
exit /b 0

:kein_python
echo.
echo  PROMPTHEUS DECK braucht Python 3.10 oder neuer.
echo  Installieren mit:  winget install Python.Python.3.12
echo  Die Academy selbst laeuft auch ohne DECK.
echo.
pause
exit /b 1

:falscher_ort
echo.
echo  FEHLER: Diese Datei liegt nicht im Ordner von PROMPTHEUS DECK.
echo  Sie liegt hier: %DIR%
echo.
pause
exit /b 1
