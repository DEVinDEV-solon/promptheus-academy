@echo off
setlocal enabledelayedexpansion
title PROMPTHEUS
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  PROMPTHEUS - lokale KI-Universitaet
rem  Start:  promptheus-start.bat            normal starten
rem          promptheus-start.bat --no-open   ohne Browser
rem          promptheus-start.bat --setup-sprache   Whisper+ffmpeg laden
rem ---------------------------------------------------------------

set "PORT=8801"
set "OPEN=1"
if /i "%~1"=="--no-open" set "OPEN=0"
if /i "%~1"=="--setup-sprache" goto setup_sprache

rem --- PHP suchen ------------------------------------------------
rem  Reihenfolge: 1. werkzeuge\php8.5 (verlaesslich, mitgeliefert)
rem               2. C:\php8.5
rem               3. PHP im PATH
rem  Die mitgelieferte PHP hat VORRANG und ist die einzige, die
rem  garantiert pdo_sqlite + sqlite3 enthaelt (die PATH-PHP oft
rem  nicht - genau das war der Fehler).
set "PHP_BIN="
set "PHP_EXT="
if not defined PHP_BIN if exist "%~dp0werkzeuge\php8.5\php.exe" (
  set "PHP_BIN=%~dp0werkzeuge\php8.5\php.exe"
  set "PHP_EXT=%~dp0werkzeuge\php8.5\ext"
)
if not defined PHP_BIN call :auto_php
if not defined PHP_BIN if exist "C:\php8.5\php.exe" (
  set "PHP_BIN=C:\php8.5\php.exe"
  set "PHP_EXT=C:\php8.5\ext"
)
if not defined PHP_BIN where php >nul 2>&1
if not defined PHP_BIN if not errorlevel 1 set "PHP_BIN=php"
if not defined PHP_BIN goto kein_php

rem --- Selbsttest: pdo_sqlite wirklich verfuegbar? ---------------
rem  Mit denselben Flags wie beim Server starten. Schlaegt es fehl,
rem  wird die mitgelieferte PHP in werkzeuge\php8.5 erzwungen.
call :ext_flags
"%PHP_BIN%" %PHP_EXT_FLAG% -d extension=pdo_sqlite -d extension=sqlite3 -r "exit(in_array('sqlite',PDO::getAvailableDrivers())?0:1);" >nul 2>&1
if errorlevel 1 (
  echo.
  echo   Gewaehlte PHP hat kein pdo_sqlite - lade die mitgelieferte PHP nach.
  set "PHP_BIN="
  set "PHP_EXT="
  call :auto_php
  if not defined PHP_BIN (
    echo   Auch die mitgelieferte PHP fehlt. Bitte loesen:
    echo   a) PHP nach C:\php8.5 legen ^(php.exe direkt im Ordner^)
    echo   b) internetfaehige PHP nach werkzeuge\php8.5\ entpacken
    pause
    exit /b 1
  )
  call :ext_flags
)
echo   PHP mit pdo_sqlite ist bereit: %PHP_BIN%

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
%PHP_BIN% -r "$f=@fsockopen('127.0.0.1',getenv('PORT'),$e,$s,0.7); exit($f?0:1);" >nul 2>&1
if not errorlevel 1 goto schon_da

rem --- Sprach-Erkennung (Mikro zu Text) eingerichtet? ------------
set "SPRACHE_HINWEIS="
if not exist "werkzeuge\whisper\whisper-cli.exe" (
  if not exist "werkzeuge\whisper\main.exe" set "SPRACHE_HINWEIS=1"
)

echo.
echo   PROMPTHEUS laeuft auf http://127.0.0.1:%PORT%
echo   Zum Beenden dieses Fenster schliessen.
echo.
if defined SPRACHE_HINWEIS (
  echo   HINWEIS: Mikrofon-zu-Text ist noch nicht eingerichtet.
  echo   Die Erkennung laeuft gratis und lokal - dafuer braucht es
  echo   whisper-cli.exe und ein Modell in werkzeuge\whisper\
  echo   sowie ffmpeg.exe in werkzeuge\ffmpeg\.
  echo   Einmalig einrichten: promptheus-start.bat --setup-sprache
  echo   Bis dahin tippen die Lernenden - TTS-Ausgabe geht weiter
  echo   ueber das konfigurierte Sprachmodell der Academy.
  echo.
)
if "%OPEN%"=="1" start "" "http://127.0.0.1:%PORT%/"

%PHP_BIN% %PHP_EXT_FLAG% -d extension=pdo_sqlite -d extension=sqlite3 -d max_execution_time=0 -d memory_limit=512M -d log_errors=1 -d error_log="%~dp0data\logs\php_error.log" -S 127.0.0.1:%PORT% -t "%~dp0." "%~dp0router.php"

echo.
echo   Der Server wurde beendet.
pause
exit /b 0

rem ---------------------------------------------------------------
:schon_da
echo.
echo   Auf Port %PORT% laeuft bereits ein Server.
echo   Falls die Seite den Fehler "pdo_sqlite" zeigt, laeuft dort
echo   noch ein alter Server mit einer kaputten PHP - dann bitte
echo   das alte Fenster schliessen und die Batch erneut starten.
echo.
if "%OPEN%"=="1" start "" "http://127.0.0.1:%PORT%/"
timeout /t 6 /nobreak >nul 2>&1
exit /b 0

rem ---------------------------------------------------------------
:kein_php
echo.
echo   ============================================================
echo   FEHLER: PHP konnte nicht geladen und nicht heruntergeladen
echo           werden.
echo   ============================================================
echo   Gesucht wurde: PATH, C:\php8.5, werkzeuge\php8.5
echo   Der automatische Download hat nicht geklappt ^(kein Internet
echo   oder windows.php.net nicht erreichbar^).
echo.
echo   Dann bitte eine der Loesungen:
echo     a) PHP nach C:\php8.5 entpacken ^(php.exe direkt im Ordner^)
echo     b) PHP in den PATH aufnehmen
echo     c) werkzeuge\php8.5  einmalig selbst anlegen und PHP hinein
echo   ============================================================
echo.
pause
exit /b 1

rem ===============================================================
:ext_flags
rem   Baut aus PHP_EXT das -d extension_dir-Flag (ohne Quotes:
rem   cmd kennt kein \"-Escaping; der Pfad hat keine Leerzeichen).
if defined PHP_EXT (
  set "PHP_EXT_FLAG=-d extension_dir=%PHP_EXT%"
) else (
  set "PHP_EXT_FLAG="
)
exit /b 0

rem ===============================================================
:auto_php
rem   Laedt die aktuellste PHP-Version automatisch nach
rem   werkzeuge\php8.5  - sonst wird es nicht gefunden.
set "PHP_ORDNER=%~dp0werkzeuge\php8.5"
if exist "%PHP_ORDNER%\php.exe" (
  set "PHP_BIN=%PHP_ORDNER%\php.exe"
  set "PHP_EXT=%PHP_ORDNER%\ext"
  exit /b 0
)
echo.
echo   PHP wird automatisch eingerichtet ...
echo   (Download der aktuellen Fassung, das dauert einen Moment.)
if not exist "%PHP_ORDNER%" mkdir "%PHP_ORDNER%" >nul 2>&1
where curl >nul 2>&1
if errorlevel 1 (
  echo   FEHLER: curl fehlt. Bitte PHP von Hand nach C:\php8.5 legen.
  exit /b 1
)
set "PHP_ZIP=%TEMP%\pu_php.zip"
curl -sL -o "%PHP_ZIP%" "https://windows.php.net/downloads/releases/php-8.5.10-nts-Win32-vs17-x64.zip"
if not exist "%PHP_ZIP%" (echo   Download fehlgeschlagen. && exit /b 1)
powershell -NoProfile -Command "Expand-Archive -Force '%PHP_ZIP%' '%PHP_ORDNER%'" >nul 2>&1
del /q "%PHP_ZIP%" >nul 2>&1
if not exist "%PHP_ORDNER%\php.exe" goto auto_php_suche
set "PHP_BIN=%PHP_ORDNER%\php.exe"
set "PHP_EXT=%PHP_ORDNER%\ext"
echo   PHP ist bereit: %PHP_BIN%
exit /b 0

:auto_php_suche
rem   Falls Expand-Archive eine Unterordner-Ebene macht, korrigieren.
for /d %%D in ("%PHP_ORDNER%\php-*") do (
  if exist "%%D\php.exe" move /y "%%D\*" "%PHP_ORDNER%\" >nul 2>&1
)
if exist "%PHP_ORDNER%\php.exe" (
  set "PHP_BIN=%PHP_ORDNER%\php.exe"
  set "PHP_EXT=%PHP_ORDNER%\ext"
  exit /b 0
)
echo   FEHLER: entpacktiges Archiv ohne php.exe
exit /b 1

rem ---------------------------------------------------------------
:setup_sprache
echo.
echo   Richtet die lokale Spracherkennung ein ^(Mikro zu Text, gratis,
echo   alles bleibt auf diesem Rechner^). Benoetigt Internet.
echo.

where curl >nul 2>&1
if errorlevel 1 (
  echo   FEHLER: curl wurde nicht gefunden. Ab Windows 10 1803 ist
  echo   curl.exe in Windows enthalten. Bitte Windows aktualisieren
  echo   oder curl manuell installieren.
  pause
  exit /b 1
)

if not exist "werkzeuge\whisper" mkdir "werkzeuge\whisper" >nul 2>&1
if not exist "werkzeuge\ffmpeg"  mkdir "werkzeuge\ffmpeg"  >nul 2>&1

rem --- 1. ffmpeg --------------------------------------------------
if exist "werkzeuge\ffmpeg\ffmpeg.exe" (
  echo   [1/3] ffmpeg schon vorhanden - uebersprungen.
  goto whisper_bin
)
echo   [1/3] Lade ffmpeg ...
curl -L -o "%TEMP%\pu_ffmpeg.zip" "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
if errorlevel 1 goto fehler_dl
powershell -NoProfile -Command "Expand-Archive -Force '%TEMP%\pu_ffmpeg.zip' '%TEMP%\pu_ffm'" >nul 2>&1
copy /y "%TEMP%\pu_ffm\bin\ffmpeg.exe" "werkzeuge\ffmpeg\ffmpeg.exe" >nul 2>&1
copy /y "%TEMP%\pu_ffm\ffmpeg-*\bin\ffmpeg.exe" "werkzeuge\ffmpeg\ffmpeg.exe" >nul 2>&1
del /q "%TEMP%\pu_ffmpeg.zip" >nul 2>&1
if exist "werkzeuge\ffmpeg\ffmpeg.exe" (echo         ffmpeg OK.) else (echo         ffmpeg konnte nicht entpackt werden - bitte von https://gyan.dev/ffmpeg/builds/ holen.)

:whisper_bin
rem --- 2. whisper-cli ---------------------------------------------
if exist "werkzeuge\whisper\whisper-cli.exe" (
  echo   [2/3] whisper-cli schon vorhanden - uebersprungen.
  goto modell
)
echo   [2/3] Lade whisper.cpp ^(fertiger Windows-Build^) ...
curl -L -o "%TEMP%\pu_whisper.zip" "https://github.com/ggml-org/whisper.cpp/releases/latest/download/whisper-bin-x64.zip"
if errorlevel 1 goto fehler_dl
powershell -NoProfile -Command "Expand-Archive -Force '%TEMP%\pu_whisper.zip' '%TEMP%\pu_whis'" >nul 2>&1
copy /y "%TEMP%\pu_whis\*.exe" "werkzeuge\whisper\" >nul 2>&1
copy /y "%TEMP%\pu_whis\bin\*.exe" "werkzeuge\whisper\" >nul 2>&1
xcopy /y /s "%TEMP%\pu_whis\*.dll" "werkzeuge\whisper\" >nul 2>&1
del /q "%TEMP%\pu_whisper.zip" >nul 2>&1
if exist "werkzeuge\whisper\whisper-cli.exe" (echo         whisper-cli OK.) else if exist "werkzeuge\whisper\main.exe" (echo         main.exe OK.) else (echo         Build nicht gefunden - bitte von github.com/ggml-org/whisper.cpp Releases holen.)

:modell
rem --- 3. Sprachmodell (deutschtauglich, mehrsprachig, klein) -----
if exist "werkzeuge\whisper\ggml-base.bin" (
  echo   [3/3] Modell schon vorhanden - uebersprungen.
  goto fertig
)
echo   [3/3] Lade Sprachmodell ggml-base.bin ~^(ca. 148 MB^) ...
curl -L -o "werkzeuge\whisper\ggml-base.bin" "https://huggingface.co/ggml-org/whisper.cpp/resolve/main/ggml-base.bin"
if errorlevel 1 goto fehler_dl
echo         Modell OK.

:fertig
echo.
echo   Fertig. Beim naechsten Start erkennt PROMPTHEUS die Werkzeuge
echo   automatisch unter werkzeuge\whisper\ und werkzeuge\ffmpeg\ -
echo   ohne Eintrag in der .env. Die Aufnahmen verlassen den Rechner
echo   nicht.
echo.
pause
exit /b 0

:fehler_dl
echo         Download fehlgeschlagen. Internet verbinden und erneut
echo         versuchen, oder die Datei von Hand in werkzeuge\ ablegen.
pause
exit /b 1
