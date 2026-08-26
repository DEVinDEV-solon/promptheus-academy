@echo off
setlocal enabledelayedexpansion
title PROMPTHEUS
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  PROMPTHEUS - lokale KI-Universitaet
rem  Start:  promptheus-start.bat            normal starten
rem          promptheus-start.bat --no-open   ohne Browser
rem ---------------------------------------------------------------

set "PORT=8801"
set "OPEN=1"
if /i "%~1"=="--no-open" set "OPEN=0"

rem --- PHP vorhanden? -------------------------------------------
where php >nul 2>&1
if errorlevel 1 goto kein_php

rem --- .env anlegen, falls sie fehlt -----------------------------
if not exist ".env" copy /y ".env.example" ".env" >nul 2>&1

rem --- Port aus der .env lesen (Kommentarzeilen uebergehen) ------
for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
  if /i "%%~A"=="PU_PORT" set "PORT=%%~B"
)
set "PORT=%PORT: =%"

if not exist "data\logs" mkdir "data\logs" >nul 2>&1

rem --- Laeuft schon ein Server auf dem Port? ---------------------
rem  Exitcode 0 = Port belegt. NICHT in einem if-Block ausfuehren:
rem  die Klammern im PHP-Ausdruck wuerden den Block zerreissen.
php -r "$f=@fsockopen('127.0.0.1',getenv('PORT'),$e,$s,0.7); exit($f?0:1);" >nul 2>&1
if not errorlevel 1 goto schon_da

rem --- pdo_sqlite und sqlite3 sind in der WinGet-php.ini
rem     auskommentiert. Sie werden hier per -d zugeschaltet;
rem     die php.ini bleibt unangetastet.
echo.
echo   PROMPTHEUS laeuft auf http://127.0.0.1:%PORT%
echo   Zum Beenden dieses Fenster schliessen.
echo.
if "%OPEN%"=="1" start "" "http://127.0.0.1:%PORT%/"

php -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo   Der Server wurde beendet.
pause
exit /b 0

rem ---------------------------------------------------------------
:schon_da
echo.
echo   Auf Port %PORT% laeuft bereits ein Server - es wird nur das
echo   Fenster geoeffnet, kein zweiter Server gestartet.
echo.
if "%OPEN%"=="1" start "" "http://127.0.0.1:%PORT%/"
timeout /t 4 /nobreak >nul 2>&1
exit /b 0

rem ---------------------------------------------------------------
:kein_php
echo.
echo   PHP wurde nicht gefunden.
echo   PROMPTHEUS braucht PHP 8 im PATH:
echo       winget install PHP.PHP.8.2
echo.
pause
exit /b 1
