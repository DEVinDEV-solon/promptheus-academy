@echo off
rem ============================================================
rem  PROMPTHEUS WERKSTATT - Start
rem
rem  Eigene, vollstaendige Fassung des DeepSeek Harness auf
rem  http://127.0.0.1:3081 mit eigenem Profil und Zuhause.
rem
rem  Geoeffnet wird sie normalerweise AUS DER ACADEMY
rem  (Einstellungen - Werkstatt), frei ab Kurs 7. Die Academy legt
rem  dafuer ein Ticket ab; ohne Ticket startet sie nicht.
rem  Entwicklung ohne Academy:  WERKSTATT-START.bat --betreiber
rem
rem  Der Ordner wird aus der Lage dieser Datei bestimmt - kein
rem  fester Pfad, laeuft in jeder Installation.
rem ============================================================
setlocal
title PROMPTHEUS Werkstatt  -  http://127.0.0.1:3081
set "DASH=%~dp0"
if "%DASH:~-1%"=="\" set "DASH=%DASH:~0,-1%"

rem   Nur aus dem Ordner "werkstatt" der Academy startbar. Am 04.10.2026
rem   lag eine Kopie im Download-Ordner und endete mit einem Node-Fehler.
if not exist "%DASH%\werkzeuge\starten.mjs" goto falscher_ort

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  FEHLER: Node.js fehlt. Bitte Node 22.19 oder neuer installieren:
  echo    winget install OpenJS.NodeJS.LTS
  echo.
  pause
  exit /b 1
)

if not exist "%DASH%\deepseek-harness\apps\cli\src\bin.ts" (
  echo.
  echo  Die Werkstatt ist auf diesem Rechner noch nicht eingerichtet.
  echo  Die Einrichtung startet jetzt ^(einmalig, einige Minuten^).
  echo.
  call "%DASH%\WERKSTATT-EINRICHTEN.bat" --aus-start
  if errorlevel 1 exit /b 1
)

echo.
echo  PROMPTHEUS Werkstatt
echo  ---------------------------------------------
echo  Ordner   : %DASH%
echo  Adresse  : http://127.0.0.1:3081
echo  Beenden mit Strg+C.
echo.

cd /d "%DASH%"
node werkzeuge\starten.mjs %*

echo.
echo  Werkstatt beendet.
pause
exit /b 0

rem --- Falscher Ort (ohne Klammerblock: ein Pfad mit "(x86)" braeche ihn)
:falscher_ort
echo.
echo  FEHLER: Diese Datei liegt nicht im Werkstatt-Ordner der Academy.
echo  Sie liegt hier:  %DASH%
echo.
echo  Sie gehoert in den Ordner "werkstatt" der Academy, zum Beispiel
echo    C:\Promptheus\werkstatt\WERKSTATT-START.bat
echo  So geht es: In der Academy unter Einstellungen - Werkstatt
echo  auf "Ordner oeffnen" klicken und die Datei dort starten.
echo  Diese Kopie hier kann geloescht werden.
echo.
pause
exit /b 1
