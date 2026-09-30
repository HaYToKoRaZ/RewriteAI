$ErrorActionPreference = "Continue"

# Proje kök dizinini güvenli şekilde tespit et (ister .agents altında, ister .agents/rules altında olsun)
$ProjectRoot = if (Test-Path "$PSScriptRoot\..\main") {
    (Resolve-Path "$PSScriptRoot\..").Path
} elseif (Test-Path "$PSScriptRoot\..\..\main") {
    (Resolve-Path "$PSScriptRoot\..\..").Path
} else {
    (Resolve-Path "$PSScriptRoot\..").Path
}

$RepoRoot = Join-Path $ProjectRoot "main"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 Pushing MAIN Branch (Chrome Extension)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

if (-not (Test-Path $RepoRoot)) {
    Write-Host "[ERROR] 'main' klasörü bulunamadı: $RepoRoot" -ForegroundColor Red
    exit 1
}

Push-Location $RepoRoot

# manifest.json dosyasından sürümü oku
$ManifestJsonPath = Join-Path $RepoRoot "manifest.json"
$Version = "v1.0.0"

if (Test-Path $ManifestJsonPath) {
    try {
        $mJson = Get-Content $ManifestJsonPath -Raw | ConvertFrom-Json
        if ($mJson.version) {
            $Version = if ($mJson.version.StartsWith("v")) { $mJson.version } else { "v" + $mJson.version }
        }
    } catch { }
}

$TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$CommitMsg = "$Version - Auto update ($TimeStamp)"

Write-Host "[GIT] 'main' dalındaki değişiklikler taranıyor..." -ForegroundColor Green
git add . 2>&1 | Out-Null

$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "[GIT] Değişiklikler commit ediliyor: $CommitMsg" -ForegroundColor Green
    git commit -m "$CommitMsg"
} else {
    Write-Host "[INFO] 'main' dalında commit edilecek değişiklik yok." -ForegroundColor Gray
}

Write-Host "[GIT] 'main' dalı GitHub'a gönderiliyor (origin main)..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Main dalı başarıyla GitHub'a yüklendi!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Git push sırasında bir uyarı/hata oluştu." -ForegroundColor Yellow
}

Pop-Location
