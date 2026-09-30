$ErrorActionPreference = "Stop"

# Proje kok dizini
$ProjectRoot = if (Test-Path "$PSScriptRoot\..\main") {
    (Resolve-Path "$PSScriptRoot\..").Path
} elseif (Test-Path "$PSScriptRoot\..\..\main") {
    (Resolve-Path "$PSScriptRoot\..\..").Path
} else {
    (Resolve-Path "$PSScriptRoot\..").Path
}

$BackupDir = Join-Path $ProjectRoot ".agents\backup"
if (-not (Test-Path $BackupDir)) { 
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null 
}

# manifest.json'dan surum oku
$ManifestPath = Join-Path $ProjectRoot "main\manifest.json"
$Version = "v1.0.0"
if (Test-Path $ManifestPath) {
    try {
        $mJson = Get-Content $ManifestPath -Raw | ConvertFrom-Json
        if ($mJson.version) {
            $Version = if ($mJson.version.StartsWith("v")) { $mJson.version } else { "v" + $mJson.version }
        }
    } catch { }
}

$TimeStamp = Get-Date -Format "yyyy-MM-dd_HH-mm.ss"
$DestPath = Join-Path $BackupDir "RewriteAI_${Version}_Yedek_$TimeStamp.7z"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "💾 Yedekleme baslatildi: RewriteAI ($Version)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

$FoldersToBackup = @()
if (Test-Path "$ProjectRoot\main") { $FoldersToBackup += "$ProjectRoot\main" }
if (Test-Path "$ProjectRoot\websites") { $FoldersToBackup += "$ProjectRoot\websites" }

if ($FoldersToBackup.Count -eq 0) {
    Write-Host "[INFO] Henuz main veya websites klasoru olusturulmamis, yedek atlandi." -ForegroundColor Yellow
    exit 0
}

$7zPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $7zPath) {
    & $7zPath a -t7z $DestPath $FoldersToBackup "-xr!.git" "-xr!.codebase-memory" -mx=9 | Out-Null
} else {
    $DestPath = Join-Path $BackupDir "MetinDuzenleyici_${Version}_Yedek_$TimeStamp.zip"
    $TempBackup = Join-Path $BackupDir "temp_backup_$TimeStamp"
    New-Item -ItemType Directory -Force -Path $TempBackup | Out-Null
    
    foreach ($folder in $FoldersToBackup) {
        $folderName = Split-Path $folder -Leaf
        Copy-Item -Path $folder -Destination (Join-Path $TempBackup $folderName) -Recurse -Force
    }

    Compress-Archive -Path "$TempBackup\*" -DestinationPath $DestPath -Force
    Remove-Item $TempBackup -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[SUCCESS] Yedekleme olusturuldu: $DestPath" -ForegroundColor Green
