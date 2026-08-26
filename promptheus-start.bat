@echo off
rem ===============================================================
rem  PROMPTHEUS START - fest verknuepft mit der mitgelieferten PHP
rem  Verwendet GARANTIERT:  <dieses Verzeichnis>\PHP\php8.2\php.exe
rem  Keine Suche, kein Download, kein PATH - einfach nur starten.
rem ===============================================================
setlocal
cd /d "%~dp0"
title PROMPTHEUS
set "PORT=8801"

rem --- PHP 8.2 aus dem mitgelieferten PHP-Ordner fest ansprechen -
set "PHP_DIR=%~dp0PHP\php8.2"
rem  (fallback falls Ordner klein geschrieben wurde)
if not exist "%PHP_DIR%\php.exe" set "PHP_DIR=%~dp0php\php8.2"

echo.
echo   PROMPTHEUS Start
echo   PHP: %PHP_DIR%\php.exe
echo.

if not exist "%PHP_DIR%\php.exe" (
    echo   FEHLER: php.exe wurde nicht gefunden unter:
    echo       %PHP_DIR%\php.exe
    echo   Der mitgelieferte PHP-Ordner PHP\php8.2 muss vorhanden sein.
    pause
    exit /b 1
)

set "EXT=%PHP_DIR%\ext"
set "RUN=%PHP_DIR%\php.exe"

rem --- Datenordner ----------------------------------------------
if not exist "data\logs" mkdir "data\logs" >nul 2>&1

rem --- pdo_sqlite-Kurztest --------------------------------------
"%RUN%" -d extension_dir="%EXT%" -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >nul 2>&1
if errorlevel 1 (
    echo   FEHLER: pdo_sqlite laedt nicht in dieser PHP.
    echo   Bitte pruefen: %EXT%\php_pdo_sqlite.dll
    pause
    exit /b 1
)
echo   pdo_sqlite OK.

rem --- Browser + Server -----------------------------------------
echo.
echo   Starte PROMPTHEUS:  http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"

"%RUN%" -d extension_dir="%EXT%" -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo   Server wurde beendet. Fenster kann geschlossen werden.
pause
exit /b 0