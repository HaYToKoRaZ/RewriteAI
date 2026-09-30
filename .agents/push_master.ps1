$ErrorActionPreference = "Continue"

Write-Host "[INFO] Bu projede ana dal 'main' olarak adlandırılmıştır. 'push_main.ps1' çalıştırılıyor..." -ForegroundColor Cyan
& "$PSScriptRoot\push_main.ps1"
