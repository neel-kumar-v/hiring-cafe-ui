param(
  # Directory, glob, or a single .ndjson file path.
  [string]$Path = "src/data",
  [int]$BatchSize = 200,
  [switch]$DeleteAfter
)

$ErrorActionPreference = "Stop"

if ($BatchSize -lt 1 -or $BatchSize -gt 500) {
  throw "BatchSize must be between 1 and 500."
}

$argsList = @("scraper/import_ndjson_to_convex.py", "--path", $Path, "--batch", $BatchSize)
if ($DeleteAfter) { $argsList += "--delete" }

Write-Host "Running NDJSON -> Convex importer..." -ForegroundColor Cyan
Write-Host ("python {0}" -f ($argsList -join " "))

& python @argsList

