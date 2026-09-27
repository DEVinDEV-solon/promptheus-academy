@echo off
rem ===============================================================
rem  PROMPTHEUS START - mit festem PHP 8.2 und fertigem php.ini
rem  - Verwendet das mitgelieferte PHP  unter  PHP\php8.2\
rem  - Legt dort eine fertige php.ini an (pdo_sqlite + sqlite3), damit
rem    die PHP die Erweiterungen selbststaendig laedt.
rem  - Raemt vorher den Port frei, damit kein alter Server stoert.
rem  - Das Fenster bleibt offen (pause); jeder Fehler wird gezeigt.
rem  - Updates: Liegt ein geprueftes Update bereit (data\aktualisierung\),
rem    wird es VOR dem Serverstart eingespielt (srv\aktualisieren_cli.php).
rem    Beendet die Academy sich fuer ein Update selbst, startet dieses
rem    Fenster sie neu (Sprungmarke :lauf), ohne neues Browserfenster.
rem ===============================================================
setlocal
cd /d "%~dp0"
title PROMPTHEUS
set "PORT=8801"

rem --- PHP bestimmen ------------------------------------------------
set "PHP_DIR=%~dp0PHP\php8.2"
if not exist "%PHP_DIR%\php.exe" set "PHP_DIR=%~dp0php\php8.2"
set "RUN=%PHP_DIR%\php.exe"

rem --- Falls php.exe fehlt: aus dem mitgelieferten Paket entpacken -
if not exist "%RUN%" (
    if exist "%~dp0data\php8.2-paket.zip" (
        echo   Entpacke PHP 8.2 aus dem mitgelieferten Paket ...
        if not exist "%PHP_DIR%" mkdir "%PHP_DIR%" >nul 2>&1
        powershell.exe -NoProfile -Command "Expand-Archive -Force '%~dp0data\php8.2-paket.zip' '%PHP_DIR%'" >nul 2>&1
    )
)

echo.
echo   PROMPTHEUS Start
echo   PHP: %PHP_DIR%
echo.

if not exist "%RUN%" (
    echo   FEHLER: php.exe wurde nicht gefunden unter:
    echo       %PHP_DIR%\php.exe
    echo   Bitte stelle sicher, dass PHP 8.2 vorhanden ist ^(entweder
    echo   in PHP\php8.2 entpackt oder data\php8.2-paket.zip liegt da^).
    pause
    exit /b 1
)

rem --- Fertige php.ini im PHP-Ordner sicherstellen --------------
rem   (Windows-PHP laedt php.ini automatisch aus dem eigenen Ordner)
if not exist "%PHP_DIR%\php.ini" (
    echo   Lege php.ini an ^(pdo_sqlite, sqlite3, mbstring, curl, openssl, sodium^) ...
    >  "%PHP_DIR%\php.ini" echo ; PROMPTHEUS - php.ini
    >> "%PHP_DIR%\php.ini" echo extension_dir = "ext"
    >> "%PHP_DIR%\php.ini" echo extension=pdo_sqlite
    >> "%PHP_DIR%\php.ini" echo extension=sqlite3
    >> "%PHP_DIR%\php.ini" echo extension=mbstring
    >> "%PHP_DIR%\php.ini" echo extension=curl
    >> "%PHP_DIR%\php.ini" echo extension=openssl
    >> "%PHP_DIR%\php.ini" echo extension=sodium
    >> "%PHP_DIR%\php.ini" echo extension=zip
)

rem --- Aeltere php.ini nachruesten ------------------------------
rem   Die ersten Fassungen schalteten nur pdo_sqlite und sqlite3 ein. Ohne
rem   mbstring bricht jede Seite mit Umlauten ab ("Call to undefined function
rem   mb_strlen()"). Ohne sodium gibt es keine Installationsidentitaet und
rem   damit keine Registrierung. Fehlende Zeilen werden deshalb angehaengt,
rem   vorhandene bleiben unberuehrt.
rem   zip braucht das Update (Paket entpacken, Sicherung anlegen).
for %%E in (mbstring curl openssl sodium zip) do (
    findstr /i /c:"extension=%%E" "%PHP_DIR%\php.ini" >nul 2>&1
    if errorlevel 1 (
        echo   Ergaenze in php.ini: extension=%%E
        >> "%PHP_DIR%\php.ini" echo extension=%%E
    )
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
    echo   und:    %PHP_DIR%\php.ini  ^(extension=pdo_sqlite^)
    pause
    exit /b 1
)
echo   pdo_sqlite OK.

"%RUN%" -r "exit(function_exists('mb_strlen')?0:1);" >nul 2>&1
if errorlevel 1 (
    echo   FEHLER: mbstring laedt nicht. Die Academy startet, aber Seiten mit
    echo   Umlauten brechen ab ^(Call to undefined function mb_strlen^).
    echo   Pruefe: %PHP_DIR%\ext\php_mbstring.dll
    echo   und:    %PHP_DIR%\php.ini  ^(Zeile extension=mbstring^)
    pause
    exit /b 1
)
echo   mbstring OK.

rem --- Merker: diese Academy laeuft unter der bat -----------------
rem   Nur dann darf sie sich fuer ein Update selbst beenden; die Schleife
rem   unten startet sie wieder. Der Browser oeffnet sich nur beim ersten Lauf.
set "PU_START_BAT=1"
if not defined PU_ERSTER_LAUF set "PU_ERSTER_LAUF=1"
set "AKT=%~dp0data\aktualisierung"

:lauf
rem --- Update einspielen oder zuruecknehmen (falls angefordert) ----
if exist "%AKT%\bereit.json" "%RUN%" "%~dp0srv\aktualisieren_cli.php"
if exist "%AKT%\zurueck" "%RUN%" "%~dp0srv\aktualisieren_cli.php"
if exist "%AKT%\neustart" del "%AKT%\neustart" >nul 2>&1

rem --- Neue Startdatei? Dann sie weitermachen lassen ---------------
rem   Eine laufende Batchdatei darf man nicht ueberschreiben: cmd liest sie
rem   zeilenweise nach. Deshalb liegt die neue als .neu daneben und wird hier,
rem   in EINEM Klammerblock, verschoben und aufgerufen (ohne CALL: die neue
rem   uebernimmt, diese hier liest keine Zeile mehr).
if exist "%~dp0promptheus-start.bat.neu" (
    move /y "%~dp0promptheus-start.bat.neu" "%~f0" >nul
    "%~f0"
)

rem --- Port freimachen (alten/defekten Server beenden) -----------
powershell.exe -NoProfile -Command "$x=Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if($x){$x.OwningProcess | Select -Unique | ForEach-Object { Stop-Process -Id $_ -Force } }" >nul 2>&1

rem --- Datenordner ----------------------------------------------
if not exist "data\logs" mkdir "data\logs" >nul 2>&1

rem --- Browser + Server starten ---------------------------------
echo.
echo   Starte PROMPTHEUS:  http://127.0.0.1:%PORT%/
if "%PU_ERSTER_LAUF%"=="1" start "" "http://127.0.0.1:%PORT%/"
set "PU_ERSTER_LAUF=0"

"%RUN%" -d memory_limit=512M -d max_execution_time=0 -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

rem --- Hat sich die Academy fuer ein Update beendet? Dann neu starten.
if exist "%AKT%\neustart" (
    echo.
    echo   Neustart fuer das Update ...
    goto lauf
)

echo.
echo   Server wurde beendet. Fenster kann geschlossen werden.
pause
exit /b 0