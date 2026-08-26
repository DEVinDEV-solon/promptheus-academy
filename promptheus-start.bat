@echo off
rem ===============================================================
rem  PROMPTHEUS - minimale, sichere Start-Batch
rem  Das Fenster bleibt IMMER offen. Falls es doch zugeht, hat
rem  Windows die Datei nicht als Batch erkannt (Zeilenende/Doppelt).
rem ===============================================================
setlocal

rem --- GANZ AM ANFANG pausieren, damit das Fenster nie "blitzt" --
echo.
echo   PROMPTHEUS Start - bitte eine Taste druecken ...
echo   (Fenster bleibt offen bis zum Server-Ende.)
echo.
pause

cd /d "%~dp0"
set "PORT=8801"

rem --- Erste Dinge ins Fenster + Log ---------------------------
set "LOG=%~dp0promptheus-start.log"
>  "%LOG%" echo [%DATE% %TIME%] Start
echo  Log: %LOG%

rem ===============================================================
rem  PHP finden - NUR an zwei Orten (manuell gepflegt):
rem    A) C:\php8.5\php.exe   (wie du es haendisch hast)
rem    B) werkzeuge\php8.5\php.exe
rem  Kein Download und keine obscure Automatik hier, um nichts zu
rem  brechen.
rem ===============================================================
set "PHP_BIN="
set "PHP_EXT="
if exist "C:\php8.5\php.exe" (
  set "PHP_BIN=C:\php8.5\php.exe"
  set "PHP_EXT=C:\php8.5\ext"
)
if not defined PHP_BIN if exist "%~dp0werkzeuge\php8.5\php.exe" (
  set "PHP_BIN=%~dp0werkzeuge\php8.5\php.exe"
  set "PHP_EXT=%~dp0werkzeuge\php8.5\ext"
)
if not defined PHP_BIN (
  echo.
  echo   FEHLER: PHP fehlt.
  echo   Lege bitte PHP nach C:\php8.5 (php.exe direkt im Ordner).
  echo   Danach diese Batch nochmal doppelklicken.
  echo   (Kein Auto-Download in dieser sicheren Fassung.)
  pause
  exit /b 1
)
echo PHP gefunden: %PHP_BIN%
>> "%LOG%" echo PHP=%PHP_BIN%

rem --- pdo_sqlite pruefen -------------------------------------
set "EXT="
if defined PHP_EXT set "EXT=-d extension_dir=%PHP_EXT%"
"%PHP_BIN%" %EXT% -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >nul 2>&1
if errorlevel 1 (
  echo.
  echo   FEHLER: Diese PHP hat kein pdo_sqlite.
  echo   Bitte eine Windows-PHP 8.x nach C:\php8.5 der
  echo   Erweiterung pdo_sqlite.dll liegt unter  C:\php8.5\ext\.
  pause
  exit /b 1
)
echo pdo_sqlite OK.

rem --- Datenordner anlegen -------------------------------------
if not exist "data\logs" mkdir "data\logs" >nul 2>&1

rem --- Browser und Server starten ------------------------------
echo.
echo Starte PROMPTHEUS:  http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"

"%PHP_BIN%" %EXT% -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo Server wurde beendet - Fenster kann geschlossen werden.
pause
exit /b 0