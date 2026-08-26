@echo off
rem ===============================================================
rem  PROMPTHEUS START - mit festem PHP 8.2 und fertigem php.ini
rem  - Verwendet das mitgelieferte PHP  unter  PHP\php8.2\
rem  - Legt dort eine fertige php.ini an (pdo_sqlite + sqlite3), damit
rem    die PHP die Erweiterungen selbststaendig laedt.
rem  - Raemt vorher den Port frei, damit kein alter Server stoert.
rem  - Das Fenster bleibt offen (pause); jeder Fehler wird gezeigt.
rem ===============================================================
setlocal
cd /d "%~dp0"
title PROMPTHEUS
set "PORT=8801"

set "PHP_DIR=%~dp0PHP\php8.2"
if not exist "%PHP_DIR%\php.exe" set "PHP_DIR=%~dp0php\php8.2"
set "RUN=%PHP_DIR%\php.exe"

echo.
echo   PROMPTHEUS Start
echo   PHP: %PHP_DIR%
echo.

if not exist "%RUN%" (
    echo   FEHLER: php.exe wurde nicht gefunden unter:
    echo       %PHP_DIR%\php.exe
    echo   Der Ordner PHP\php8.2 muss neben dieser Batch liegen.
    pause
    exit /b 1
)

rem --- Fertige php.ini im PHP-Ordner sicherstellen --------------
rem   (Windows-PHP laedt php.ini automatisch aus dem eigenen Ordner)
if not exist "%PHP_DIR%\php.ini" (
    echo   Lege php.ini an ^(aktiviert pdo_sqlite + sqlite3^) ...
    >  "%PHP_DIR%\php.ini" echo ; PROMPTHEUS - php.ini
    >> "%PHP_DIR%\php.ini" echo extension_dir = "ext"
    >> "%PHP_DIR%\php.ini" echo extension=pdo_sqlite
    >> "%PHP_DIR%\php.ini" echo extension=sqlite3
)

rem --- pdo_sqlite-Kurztest --------------------------------------
"%RUN%" --version >nul 2>&1
if errorlevel 1 (
    echo   FEHLER: php.exe laeuft nicht ^(fehlende Runtime^).
    echo   Bitte die Microsoft Visual C++ Redistributable installieren.
    pause
    exit /b 1
)
"%RUN%" -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >nul 2>&1
if errorlevel 1 (
    echo   FEHLER: pdo_sqlite laedt trotz php.ini nicht.
    echo   Pruefe: %PHP_DIR%\ext\php_pdo_sqlite.dll
    echo   und:    %PHP_DIR%\php.ini  (extension=pdo_sqlite)
    pause
    exit /b 1
)
echo   pdo_sqlite OK.

rem --- Port freimachen (alten/defekten Server beenden) -----------
powershell.exe -NoProfile -Command "$x=Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if($x){$x.OwningProcess | Select -Unique | ForEach-Object { Stop-Process -Id $_ -Force } }" >nul 2>&1

rem --- Datenordner ----------------------------------------------
if not exist "data\logs" mkdir "data\logs" >nul 2>&1

rem --- Browser + Server starten ---------------------------------
echo.
echo   Starte PROMPTHEUS:  http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"

"%RUN%" -d memory_limit=512M -d max_execution_time=0 -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo   Server wurde beendet. Fenster kann geschlossen werden.
pause
exit /b 0