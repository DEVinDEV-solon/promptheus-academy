# PROMPTHEUS - Verknuepfung auf dem Desktop, auf Wunsch an der Taskleiste.
#
# Aufgerufen von PROMPTHEUS-START.bat beim ersten Start (Unterprogramm
# :verknuepfung). Nur ASCII in dieser Datei: Windows PowerShell 5.1 liest eine
# Datei ohne BOM in der ANSI-Codepage, Umlaute kaemen verstuemmelt an.
#
# Warum cmd.exe als Ziel und nicht die bat selbst: An die Taskleiste lassen
# sich nur Verknuepfungen auf Programme heften, nicht auf Batchdateien.
#
# Die Taskleiste: Seit Windows 10 (1809) duerfen Programme sich nicht selbst
# anheften - Microsoft hat das absichtlich gesperrt. Versucht wird der alte Weg
# ueber das Kontextmenue; klappt er nicht, oeffnet sich der Desktop mit der
# markierten Verknuepfung, und hier steht, welcher Klick fehlt.

param(
    [Parameter(Mandatory = $true)] [string] $Start,
    [ValidateSet('J', 'N')] [string] $Anheften = 'N',
    # Nur fuer den Probelauf: anderer Ordner statt des Desktops.
    [string] $Desktop = ''
)
$ErrorActionPreference = 'Stop'

$bat    = (Resolve-Path -LiteralPath $Start).Path
$ordner = Split-Path -Parent $bat
$ikone  = Join-Path $ordner 'assets\img\promptheus.ico'
$desk   = if ($Desktop -ne '') { $Desktop } else { [Environment]::GetFolderPath('Desktop') }   # auch bei OneDrive-Desktop richtig
$shell  = New-Object -ComObject WScript.Shell

# Liegt schon eine Verknuepfung "PROMPTHEUS Academy" fuer einen ANDEREN Ordner
# da (etwa ein Testordner neben der eigentlichen Academy), bekommt diese hier
# den Ordnernamen dazu - sonst ueberschriebe sie die andere.
$name = 'PROMPTHEUS Academy'
$lnk  = Join-Path $desk "$name.lnk"
if (Test-Path -LiteralPath $lnk) {
    $alt = $shell.CreateShortcut($lnk)
    if ($alt.WorkingDirectory.TrimEnd('\') -ne $ordner.TrimEnd('\')) {
        $name = "PROMPTHEUS Academy ($(Split-Path -Leaf $ordner))"
        $lnk  = Join-Path $desk "$name.lnk"
    }
}

$v = $shell.CreateShortcut($lnk)
$v.TargetPath       = Join-Path $env:SystemRoot 'System32\cmd.exe'
$v.Arguments        = '/c ""' + $bat + '""'
$v.WorkingDirectory = $ordner
$v.Description      = 'PROMPTHEUS Academy starten'
if (Test-Path -LiteralPath $ikone) { $v.IconLocation = "$ikone,0" }
$v.Save()
Write-Host "  Verknuepfung auf dem Desktop: $name"

if ($Anheften -ne 'J') { exit 0 }

$angeheftet = Join-Path $env:APPDATA "Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\$name.lnk"
try {
    $eintrag = (New-Object -ComObject Shell.Application).Namespace($desk).ParseName("$name.lnk")
    # Nur ANheften - "Von Taskleiste loesen" enthaelt dasselbe Wort.
    $verb = $eintrag.Verbs() | Where-Object { $_.Name.Replace('&', '') -match '^(An Taskleiste anheften|Pin to taskbar)$' }
    if ($verb) { $verb | Select-Object -First 1 | ForEach-Object { $_.DoIt() } }
} catch { }
Start-Sleep -Seconds 1

if (Test-Path -LiteralPath $angeheftet) {
    Write-Host '  An die Taskleiste angeheftet.'
} else {
    Write-Host ''
    Write-Host '  Windows laesst Programme sich nicht selbst an die Taskleiste heften.'
    Write-Host '  Ein Klick genuegt: Der Desktop oeffnet sich gleich mit der markierten'
    Write-Host "  Verknuepfung '$name'. Rechtsklick darauf -> 'An Taskleiste anheften'"
    Write-Host "  (Windows 11: zuerst 'Weitere Optionen anzeigen', falls es fehlt)."
    Write-Host ''
    Start-Process explorer.exe -ArgumentList "/select,`"$lnk`""
}
exit 0
