@echo off
rem ===============================================================
rem  PROMPTHEUS - Start-Batch mit robuster PHP-Suche
rem  Findet PHP automatisch an vielen Orten. Das Fenster bleibt
rem  offen (pause am Anfang und am Ende) - es "blitzt" nie einfach
rem  weg. Jede gefundene PHP wird mit dem pdo_sqlite-Test geprueft.
rem ===============================================================
setlocal
cd /d "%~dp0"
set "PORT=8801"
set "LOG=%~dp0promptheus-start.log"

rem --- Fenster bleibt definitiv offen: erst pausiert es. --------
echo.
echo   PROMPTHEUS Start - eine Taste druecken, dann laeuft es.
echo.
pause

>  "%LOG%" echo [%DATE% %TIME%] Start
echo  Log: %LOG%

rem ===============================================================
rem  1) PHP-Suche mit robuster Automatik
rem     Reihenfolge: PATH, program files, C:\php + Unterordner,
rem     C:\php8.x, werkzeuge\php8.x. Die erste mit pdo_sqlite
rem     gewinnt. Kein manuelles Erraten des Pfadnamens noetig.
rem ===============================================================
set "PHP_BIN="
set "PHP_EXT="
call :find_php
if not defined PHP_BIN (
    echo.
    echo   FEHLER: keine PHP mit pdo_sqlite gefunden.
    echo   Es wurde gesucht an:
    echo     - in der Umgebungsvariable PATH
    echo     - C:\php\php8.2  C:\php\php8.5  (beliebige php8.x-Ordner)
    echo     - C:\php8.2 ... C:\php8.6
    echo     - werkzeuge\php8.x unter PROMPTHEUS
    echo   Bitte lege PHP in einen dieser Orte.
    >> "%LOG%" echo [%DATE% %TIME%] KEINE PHP.
    pause
    exit /b 1
)
echo PHP gefunden: %PHP_BIN%
>> "%LOG%" echo [%DATE% %TIME%] PHP=%PHP_BIN%

rem ===============================================================
rem  2) Server + Browser starten
rem ===============================================================
if not exist "data\logs" mkdir "data\logs" >nul 2>&1
set "EXT="
if defined PHP_EXT set "EXT=-d extension_dir=%PHP_EXT%"
echo.
echo Starte PROMPTHEUS: http://127.0.0.1:%PORT%/
echo.
start "" "http://127.0.0.1:%PORT%/"

"%PHP_BIN%" %EXT% -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo Server wurde beendet - Fenster kann geschlossen werden.
pause
exit /b 0

rem ===============================================================
rem  Unterroutine: find_php  -  prueft einen PHP-Kandidaten
rem  und testet pdo_sqlite. Setzt PHP_BIN/PHP_EXT bei Erfolg.
rem ===============================================================
:try_php
rem  Argument %1 = Ordner der PHP. Sicherstellen, dass er mit \
rem  endet, damit KEXT zu "...\ext" wird.
set "KAND=%~1"
if not "%KAND:~-1%"=="\" set "KAND=%KAND%\"
if defined PHP_BIN exit /b 0
if not exist "%KAND%php.exe" exit /b 0
set "KEXT=%KAND%ext"
"%KAND%php.exe" -d extension_dir="%KEXT%" -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >nul 2>&1
if errorlevel 1 exit /b 0
set "PHP_BIN=%KAND%php.exe"
set "PHP_EXT=%KEXT%"
exit /b 0

rem ---------------------------------------------------------------
:find_php
rem  a) PATH
where php >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%P in ('where php') do (
        call :try_php "%%~dpP"
        if defined PHP_BIN exit /b 0
    )
)
if defined PHP_BIN exit /b 0

rem  b) C:\php und Unterordner (php8.2, php8.5, ... )
call :try_php "C:\php\"
for /d %%D in ("C:\php\php*") do call :try_php "%%~D\"
rem  c) C:\php8.2 bis C:\php8.7, C:\php9
for %%V in (8.2 8.3 8.4 8.5 8.6 8.7 9) do (
    call :try_php "C:\php%%V\"
)
rem  d) werkzeuge\php8.x im Projektordner
for /d %%D in ("%~dp0werkzeuge\php*") do call :try_php "%%~D\"
exit /b 0