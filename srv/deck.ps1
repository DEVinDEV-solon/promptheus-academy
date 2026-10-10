# PROMPTHEUS DECK - den Start der Academy an DECK uebergeben (aus PROMPTHEUS-START.bat).
#
# DECK (Ordner deck\, Python) startet die Academy ohne eigenes Fenster und verwaltet
# sie mit allen anderen Programmen. Laeuft DECK noch nicht, wird es hier gestartet;
# beim ersten Mal installiert es sich damit selbst (Autostart, deck.json).
#
# exit 0 = DECK hat uebernommen. Alles andere (kein DECK, kein Python, Fehler) = exit 1,
# dann startet die Academy wie bisher im eigenen Fenster.
param([string]$Eintrag = 'pa-lokal')
$ErrorActionPreference = 'Stop'
try {
    if ($Eintrag -notmatch '^[a-z0-9-]{1,64}$') { exit 1 }
    $oben   = Split-Path -Parent $PSScriptRoot
    $deck   = Join-Path $oben 'deck'
    $server = Join-Path $deck 'server.py'
    if (-not (Test-Path -LiteralPath $server)) { exit 1 }
    $profil = Get-Content -LiteralPath (Join-Path $deck 'profil.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $port = [int]$profil.port
    if ($port -lt 1024 -or $port -gt 65535) { exit 1 }
    $basis = "http://127.0.0.1:$port"
    $kopf  = @{ 'X-Cockpit' = '1' }

    function Antwortet {
        try { Invoke-RestMethod -Uri "$basis/api/status" -Headers $kopf -TimeoutSec 4 | Out-Null; return $true }
        catch { return $false }
    }

    if (-not (Antwortet)) {
        # Python suchen: zuerst der Weg, den DECK selbst hinterlegt hat, dann die ueblichen Orte.
        $pyw = $null
        $m = Join-Path $env:LOCALAPPDATA 'PROMPTHEUS\deck.json'
        if (Test-Path -LiteralPath $m) {
            $j = Get-Content -LiteralPath $m -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($j.pythonw -and (Test-Path -LiteralPath $j.pythonw)) { $pyw = $j.pythonw }
        }
        if (-not $pyw) {
            $k = @(Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Programs\Python') -Filter 'pythonw.exe' -Recurse -Depth 1 -ErrorAction SilentlyContinue |
                   Sort-Object { [int](($_.Directory.Name -replace '\D', '') + '0') } -Descending | ForEach-Object { $_.FullName })
            $k += @(Get-Command pythonw.exe -All -ErrorAction SilentlyContinue | Where-Object { $_.Source -notmatch 'WindowsApps' } | ForEach-Object { $_.Source })
            $pyw = $k | Select-Object -First 1
        }
        if (-not $pyw) { exit 1 }
        Start-Process -FilePath $pyw -ArgumentList @("`"$server`"", '--still') -WorkingDirectory $deck -WindowStyle Hidden
        $bis = (Get-Date).AddSeconds(20)
        while (-not (Antwortet)) {
            if ((Get-Date) -gt $bis) { exit 1 }
            Start-Sleep -Milliseconds 400
        }
    }

    # oeffnen: DECK oeffnet die Academy im Browser, sobald sie antwortet (die bat oeffnet dann keinen).
    $body = @{ id = $Eintrag; direkt = $true; oeffnen = $true } | ConvertTo-Json -Compress
    $r = Invoke-RestMethod -Uri "$basis/api/starten" -Method Post -Headers $kopf -ContentType 'application/json' -Body $body -TimeoutSec 10
    if ($r.ok) { exit 0 }
    exit 1
} catch { exit 1 }
