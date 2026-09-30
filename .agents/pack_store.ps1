$ErrorActionPreference = "Continue"

# Proje kok dizini
$ProjectRoot = if (Test-Path "$PSScriptRoot\..\main") {
    (Resolve-Path "$PSScriptRoot\..").Path
} elseif (Test-Path "$PSScriptRoot\..\..\main") {
    (Resolve-Path "$PSScriptRoot\..").Path
} else {
    (Resolve-Path "$PSScriptRoot\..").Path
}

$MainDir  = Join-Path $ProjectRoot "main"
$DistDir  = Join-Path $ProjectRoot ".agents\dist"

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Force -Path $DistDir | Out-Null
}

$ManifestPath = Join-Path $MainDir "manifest.json"
if (-not (Test-Path $ManifestPath)) {
    Write-Error "HATA: main/manifest.json bulunamadi!"
    exit 1
}

$ManifestContent = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Version = $ManifestContent.version
if (-not $Version) { $Version = "1.0.0" }

$ZipFileName = "Metin-Duzenleyici-v$Version-WebStore.zip"
$ZipFilePath = Join-Path $DistDir $ZipFileName

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Paketleme: Chrome Web Magazasi Icin ZIP Paketi Olusturuluyor" -ForegroundColor Green
Write-Host "Surum:  v$Version" -ForegroundColor Yellow
Write-Host "Hedef:  $ZipFilePath" -ForegroundColor Gray
Write-Host "====================================================" -ForegroundColor Cyan

if (Test-Path $ZipFilePath) {
    Remove-Item $ZipFilePath -Force
}

$7zPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $7zPath) {
    & $7zPath a -tzip $ZipFilePath "$MainDir\*" "-xr!.git" "-xr!.gitignore" "-xr!README.md" "-xr!docs" "-xr!.codebase-memory" "-xr!.github" -mx=9 | Out-Null
} else {
    $TempStaging = Join-Path $DistDir "staging_temp"
    if (Test-Path $TempStaging) { Remove-Item $TempStaging -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Force -Path $TempStaging | Out-Null

    Copy-Item -Path "$MainDir\*" -Destination $TempStaging -Recurse -Force
    Remove-Item (Join-Path $TempStaging ".git") -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $TempStaging "README.md") -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $TempStaging ".gitignore") -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $TempStaging "docs") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $TempStaging ".codebase-memory") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $TempStaging ".github") -Recurse -Force -ErrorAction SilentlyContinue

    Push-Location $TempStaging
    Compress-Archive -Path * -DestinationPath $ZipFilePath -Force
    Pop-Location

    Remove-Item $TempStaging -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path $ZipFilePath) {
    $SizeKB = [math]::Round((Get-Item $ZipFilePath).Length / 1KB, 2)
    Write-Host "----------------------------------------------------" -ForegroundColor Gray
    Write-Host "[SUCCESS] Magaza ZIP Paketi Basariyla Hazirlandi!" -ForegroundColor Green
    Write-Host "Dosya: $ZipFilePath" -ForegroundColor Yellow
    Write-Host "Boyut: $SizeKB KB" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------" -ForegroundColor Gray
} else {
    Write-Error "ZIP dosyasi olusturulamadi!"
}
