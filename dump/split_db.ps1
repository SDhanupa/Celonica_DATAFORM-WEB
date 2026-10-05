# ============================================================
# split_db.ps1 — Dump PostgreSQL, compress & split into 3 parts
# Run from: C:\xampp\htdocs\Celonica Quecion web\
# ============================================================

$ErrorActionPreference = "Stop"
$OutputFolder = "db_parts"

Write-Host "=== Celonica DB Split Script ===" -ForegroundColor Cyan

# Step 1 — Dump from PostgreSQL
Write-Host "`n[1/3] Dumping PostgreSQL database..." -ForegroundColor Yellow
$dumpFile = "$OutputFolder\celonica_full.sql"
New-Item -ItemType Directory -Force -Path $OutputFolder | Out-Null

$env:PGPASSWORD = "dhanu231"
pg_dump -U postgres -h 127.0.0.1 -d form_builder_prod -F p -f $dumpFile
if ($LASTEXITCODE -ne 0) { Write-Host "pg_dump FAILED" -ForegroundColor Red; exit 1 }

$size = (Get-Item $dumpFile).Length
Write-Host "   Dump size: $([math]::Round($size/1MB, 1)) MB" -ForegroundColor Green

# Step 2 — Compress using gzip via .NET
Write-Host "`n[2/3] Compressing dump..." -ForegroundColor Yellow
$gzFile = "$OutputFolder\celonica_full.sql.gz"

$inputStream  = [System.IO.File]::OpenRead($dumpFile)
$outputStream = [System.IO.File]::Create($gzFile)
$gzStream     = New-Object System.IO.Compression.GZipStream($outputStream, [System.IO.Compression.CompressionMode]::Compress, $true)
$inputStream.CopyTo($gzStream)
$gzStream.Close()
$outputStream.Close()
$inputStream.Close()

$gzSize = (Get-Item $gzFile).Length
Write-Host "   Compressed size: $([math]::Round($gzSize/1MB, 1)) MB" -ForegroundColor Green

# Remove uncompressed dump (keep only gz)
Remove-Item $dumpFile -Force

# Step 3 — Split into 3 parts (binary split)
Write-Host "`n[3/3] Splitting into 3 parts..." -ForegroundColor Yellow

$fileBytes  = [System.IO.File]::ReadAllBytes($gzFile)
$totalBytes = $fileBytes.Length
$partSize   = [Math]::Ceiling($totalBytes / 3)

for ($i = 0; $i -lt 3; $i++) {
    $start   = $i * $partSize
    $end     = [Math]::Min($start + $partSize, $totalBytes)
    $length  = $end - $start
    $partFile = "$OutputFolder\celonica_db.part$i"
    $segment  = $fileBytes[$start..($end - 1)]
    [System.IO.File]::WriteAllBytes($partFile, $segment)
    $partMB  = [Math]::Round($length / 1MB, 1)
    Write-Host "   Part $i : $partMB MB  →  $partFile" -ForegroundColor Green
}

Remove-Item $gzFile -Force

Write-Host "`n✅ Done! Files ready in: $OutputFolder\" -ForegroundColor Cyan
Write-Host "   Add db_parts/ to git and push." -ForegroundColor White
