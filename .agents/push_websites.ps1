$ErrorActionPreference = "Continue"

# Proje kök dizinini güvenli şekilde tespit et
$ProjectRoot = if (Test-Path "$PSScriptRoot\..\websites") {
    (Resolve-Path "$PSScriptRoot\..").Path
} elseif (Test-Path "$PSScriptRoot\..\..\websites") {
    (Resolve-Path "$PSScriptRoot\..\..").Path
} else {
    (Resolve-Path "$PSScriptRoot\..").Path
}

$RepoRoot = Join-Path $ProjectRoot "websites"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 Pushing WEBSITES Branch (GitHub Pages)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

if (-not (Test-Path $RepoRoot)) {
    Write-Host "[ERROR] 'websites' klasörü bulunamadı: $RepoRoot" -ForegroundColor Red
    exit 1
}

Push-Location $RepoRoot

$TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$CommitMsg = "Websites Auto update ($TimeStamp)"

Write-Host "[GIT] 'websites' dalındaki değişiklikler taranıyor..." -ForegroundColor Green
git add -A 2>&1 | Out-Null

$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "[GIT] Değişiklikler commit ediliyor: $CommitMsg" -ForegroundColor Green
    git commit -m "$CommitMsg"
} else {
    Write-Host "[INFO] 'websites' dalında commit edilecek değişiklik yok." -ForegroundColor Gray
}

Write-Host "[GIT] 'websites' dalı GitHub'a gönderiliyor (origin websites)..." -ForegroundColor Green
git push origin websites

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Websites dalı başarıyla GitHub'a yüklendi!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Git push sırasında bir uyarı/hata oluştu." -ForegroundColor Yellow
}

Pop-Location
