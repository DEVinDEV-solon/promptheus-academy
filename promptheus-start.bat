@echo off
setlocal
title PROMPTHEUS - sichere Version
cd /d "%~dp0"

rem ===============================================================
rem  PROMPTHEUS Start - sichere, beobachtbare Version.
rem  Jeder Schritt wird angezeigt AND ins Log geschrieben. Kein
rem  Pfad verlaeuft still: jeder Fehler hat ein PAUSE, das Fenster
rem  bleibt offen und zeigt, was passiert ist.
rem ===============================================================

set "PORT=8801"
set "LOG=%~dp0promptheus-start.log"

rem --- Log beginnt, sichtbar -------------------------------------
>  "%LOG%" echo [%DATE% %TIME%] PROMPTHEUS Start
>> "%LOG%" echo [%DATE% %TIME%] Verzeichnis: %~dp0
echo.
echo   PROMPTHEUS Start - sichere Version
echo   ==============================================
echo   Jeder Fehler bleibt hier sichtbar und wird im Log
echo   %LOG% protokolliert.

rem ===============================================================
rem  SCHRITT 1 - PHP suchen (mitgelieferte PHP zuerst)
rem ===============================================================
echo [1/4] Suche PHP ...
>> "%LOG%" echo [%DATE% %TIME%] Schritt 1: Suche PHP

set "PHP_BIN="
set "PHP_EXT="

if exist "%~dp0werkzeuge\php8.5\php.exe" (
    set "PHP_BIN=%~dp0werkzeuge\php8.5\php.exe"
    set "PHP_EXT=%~dp0werkzeuge\php8.5\ext"
    echo       Mitgelieferte PHP: werkzeuge\php8.5\php.exe
)

if not defined PHP_BIN (
    echo       Keine mitgelieferte PHP - versuche Download ...
    call :download
)

if not defined PHP_BIN if exist "C:\php8.5\php.exe" (
    set "PHP_BIN=C:\php8.5\php.exe"
    set "PHP_EXT=C:\php8.5\ext"
)

if not defined PHP_BIN (
    echo   KEINE PHP GEFUNDEN.
    echo   Loesung: PHP nach C:\php8.5 legen (php.exe direkt im
    echo   Ordner) oder die Batch mit Internet nochmal starten.
    >> "%LOG%" echo [%DATE% %TIME%] KEINE.
    pause
    exit /b 1
)
>> "%LOG%" echo [%DATE% %TIME%] $PHP gewaehlt: %PHP_BIN%
echo       PHP: %PHP_BIN%

rem ===============================================================
rem  SCHRITT 2 - pdo_sqlite sicherstellen
rem ===============================================================
echo.
echo [2/4] Pruefe pdo_sqlite ...
>> "%LOG%" echo [%DATE% %TIME%] Schritt 2/4 pdo_sqlite

set "PHP_EXT_ARG="
if defined PHP_EXT set "PHP_EXT_ARG=-d extension_dir=%PHP_EXT%"

"%PHP_BIN%" %PHP_EXT_ARG% -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >> "%LOG%" 2>&1
if errorlevel 1 (
    echo   Diese PHP hat kein pdo_sqlite - suche passende ...
    set "PHP_BIN="
    set "PHP_EXT="
    call :download
    if not defined PHP_BIN (
        echo   Auch der Download ergab keine brauchbare PHP.
        echo   Bitte eine PHP mit pdo_sqlite nach werkzeuge\php8.5\ 
        echo   oder C:\php8.5\ legen.
        pause
        exit /b 1
    )
    set "PHP_EXT_ARG="
    if defined PHP_EXT set "PHP_EXT_ARG=-d extension_dir=%PHP_EXT%"
    "%PHP_BIN%" %PHP_EXT_ARG% -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >> "%LOG%" 2>&1
    if errorlevel 1 (
        echo   Auch diese PHP hat kein pdo_sqlite.
        pause
        exit /b 1
    )
)
echo   OK: pdo_sqlite verfuegbar
>> "%LOG%" echo [%DATE% %TIME%] pdo_sqlite OK

rem ================================================================
rem  SCHRITT 3 - Port freimachen, alten Server beenden
rem ================================================================
echo.
echo [3/4] Port %PORT% freimachen ...
powershell.exe -NoProfile -Command "$x=Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue; if($x){ $x.OwningProcess -replace '\D','' | Where-Object {$_ -and $_ -ne $PID} | Select -Unique | ForEach-Object { Stop-Process -Id $_ -Force } }" >> "%LOG%" 2>&1
echo       Port ist frei.
>> "%LOG%" echo [%DATE% %TIME%] Port frei

rem ================================================================
rem  SCHRITT 4 - Server starten
rem ================================================================
if not exist "data\logs" mkdir "data\logs" >nul 2>&1
echo.
echo [4/4] Start: http://127.0.0.1:%PORT%/
>> "%LOG%" echo [%DATE% %TIME%] SERVER START
start "" "http://127.0.0.1:%PORT%/"

"%PHP_BIN%" %PHP_EXT_ARG% -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php" >> "%LOG%" 2>&1

echo.
echo   Server wurde beendet. Fenster kann geschlossen werden.
>> "%LOG%" echo [%DATE% %TIME%] SERVER beendet
pause
exit /b 0

rem ================================================================
rem  Unterprogramm: PHP nach werkzeuge\php8.5 laden
rem ================================================================
:download
set "PHP_ORDNER=%~dp0werkzeuge\php8.5"
if not exist "%PHP_ORDNER%" mkdir "%PHP_ORDNER%" >nul 2>&1
if exist "%PHP_ORDNER%\php.exe" (
    set "PHP_BIN=%PHP_ORDNER%\php.exe"
    set "PHP_EXT=%PHP_ORDNER%\ext"
    exit /b 0
)
where curl >nul 2>&1
if errorlevel 1 (
    echo   curl fehlt - bitte PHP manuell nach C:\php8.5 legen.
    exit /b 1
)
echo   Lade PHP herunter ...
curl.exe -sL -o "%TEMP%\pu_php.zip" "https://windows.php.net/downloads/releases/php-8.5.10-nts-Win32-vs17-x64.zip"
if not exist "%TEMP%\pu_php.zip" (
    echo   Download scheiterte.
    exit /b 1
)
powershell.exe -NoProfile -Command "Expand-Archive -Force '%TEMP%\pu_php.zip' '%PHP_ORDNER%'" >> "%LOG%" 2>&1
del /q "%TEMP%\pu_php.zip" >nul 2>&1
if exist "%PHP_ORDNER%\php.exe" (
    set "PHP_BIN=%PHP_ORDNER%\php.exe"
    set "PHP_EXT=%PHP_ORDNER%\ext"
    exit /b 0
)
for /d %%D in ("%PHP_ORDNER%\php-*") do (
    if exist "%%D\php.exe" move /y "%%D\*" "%PHP_ORDNER%\" >nul 2>&1
)
if exist "%PHP_ORDNER%\php.exe" (
    set "PHP_BIN=%PHP_ORDNER%\php.exe"
    set "PHP_EXT=%PHP_ORDNER%\ext"
    exit /b 0
)
echo   Download lieferte kein php.exe.
exit /b 1