@echo off
rem ============================================================
rem  PROMPTHEUS WERKSTATT — Start
rem
rem  Dies ist die PROMPTHEUS-Werkstatt: eine EIGENE, VOLLSTAENDIGE
rem  Fassung des DeepSeek Harness. Sie laeuft unabhaengig auf
rem  http://127.0.0.1:3081 mit eigenem Profil und eigenem Zuhause.
rem
rem  Alles, was sie braucht, liegt in diesem Ordner:
rem    deepseek-harness\   der Harness selbst
rem    .dsh\               ihr eigenes Zuhause (Profil, Sitzungen, Daten)
rem
rem  Der gewohnte Betrieb auf 3080 bleibt voellig unberuehrt.
rem  Beide koennen gleichzeitig offen sein.
rem ============================================================
title PROMPTHEUS Werkstatt  -  http://127.0.0.1:3081

set "DASH=D:\zarbot\tenants\admin\scripts\PROMPTHEUS\werkstatt"

if not exist "%DASH%\werkzeuge\starten.mjs" (
  echo.
  echo  FEHLER: Die Werkstatt wurde nicht gefunden unter
  echo    %DASH%
  echo.
  echo  Erwartet wird die Datei werkzeuge\starten.mjs.
  echo.
  pause
  exit /b 1
)

if not exist "%DASH%\deepseek-harness\apps\cli\src\bin.ts" (
  echo.
  echo  FEHLER: Der Harness fehlt unter
  echo    %DASH%\deepseek-harness
  echo.
  echo  Die Werkstatt ist eine eigene Fassung und braucht ihren
  echo  eigenen Harness in diesem Ordner.
  echo.
  pause
  exit /b 1
)

echo.
echo  PROMPTHEUS Werkstatt
echo  ---------------------------------------------
echo  Maske    : %DASH%
echo  Adresse  : http://127.0.0.1:3081
echo  Profil   : promptheus
echo.
echo  Der gewohnte Betrieb auf 3080 bleibt unberuehrt.
echo  Beenden mit Strg+C.
echo.

cd /d "%DASH%"
node werkzeuge\starten.mjs

echo.
echo  Werkstatt beendet.
pause
