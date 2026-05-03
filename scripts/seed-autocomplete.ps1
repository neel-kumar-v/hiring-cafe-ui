param(
  [int]$BatchSize = 200,
  [switch]$Force = $false,
  [string[]]$Types = @(
    "companies",
    "industries",
    "company_activities",
    "currencies",
    "languages",
    "licenses",
    "investors",
    "round_types",
    "job_title",
    "technology_keywords",
    "bachelors_degree_titles",
    "associate_fields",
    "bachelor_fields",
    "master_fields",
    "doctorate_fields",
    "company_hq_country",
    "scrape_state"
  )
)

$ErrorActionPreference = "Stop"

$statePath = Join-Path $PSScriptRoot ".seed-autocomplete-state.json"

function Load-State {
  if (Test-Path $statePath) {
    try {
      $raw = Get-Content -Raw -Path $statePath
      if (-not $raw) { return @{} }
      $obj = $raw | ConvertFrom-Json
      if ($null -eq $obj) { return @{} }
      return $obj
    } catch {
      Write-Host "Warning: Failed to read state file at $statePath. Starting fresh." -ForegroundColor Yellow
      return @{}
    }
  }
  return @{}
}

function Save-State {
  param([Parameter(Mandatory = $true)]$State)
  ($State | ConvertTo-Json -Depth 6) | Set-Content -Path $statePath -Encoding UTF8
}

function Invoke-SeedBatch {
  param(
    [Parameter(Mandatory = $true)][string]$Type,
    [Parameter(Mandatory = $true)][int]$Start,
    [Parameter(Mandatory = $true)][int]$Count
  )

  # Convex CLI expects a JSON-ish argument string. In Windows PowerShell, passing
  # literal quotes can get tricky, so we pass a JSON string with escaped quotes.
  # Example: {\"type\":\"currencies\",\"start\":0,\"count\":10}
  $payload = '{{\"type\":\"{0}\",\"start\":{1},\"count\":{2}}}' -f $Type, $Start, $Count

  # Use the call operator so JSON stays a single argument on Windows PowerShell.
  $raw = & npx -y convex run --push "convex/autocompleteSeed:seedBatch" $payload

  if (-not $raw) {
    throw "No output from convex run. Ensure Convex is configured and reachable."
  }

  try {
    return $raw | ConvertFrom-Json
  } catch {
    throw "Failed to parse JSON from convex run output: $raw"
  }
}

if ($BatchSize -lt 1 -or $BatchSize -gt 2000) {
  throw "BatchSize must be between 1 and 2000."
}

$state = Load-State

foreach ($t0 in $Types) {
  # Allow passing comma-separated values like: -Types companies,industries
  $split = $t0 -split "\s*,\s*"
  foreach ($t in $split) {
    if (-not $t) { continue }

    $prev = $state.$t
    if (-not $Force -and $null -ne $prev -and $prev.done -eq $true) {
      Write-Host ""
      Write-Host "== Skipping $t (already done) ==" -ForegroundColor DarkGray
      continue
    }

  Write-Host ""
  Write-Host "== Seeding $t ==" -ForegroundColor Cyan

  $start = 0
  if (-not $Force -and $null -ne $prev -and $null -ne $prev.nextStart) {
    $start = [int]$prev.nextStart
  }

  while ($true) {
    $result = Invoke-SeedBatch -Type $t -Start $start -Count $BatchSize

    $inserted = if ($null -ne $result.inserted) { [int]$result.inserted } else { 0 }
    $processed = if ($null -ne $result.processed) { [int]$result.processed } else { 0 }
    $nextStart = if ($null -ne $result.nextStart) { [int]$result.nextStart } else { ($start + $BatchSize) }
    $total = if ($null -ne $result.total) { [int]$result.total } else { 0 }
    $done = if ($null -ne $result.done) { [bool]$result.done } else { $false }

    $pct = if ($total -gt 0) { [Math]::Round(($nextStart / $total) * 100, 1) } else { 0 }
    Write-Host ("start={0} processed={1} inserted={2} nextStart={3} total={4} ({5}%) done={6}" -f $start, $processed, $inserted, $nextStart, $total, $pct, $done)

    # Persist progress so reruns skip completed types (and resume partial runs).
    $state | Add-Member -NotePropertyName $t -NotePropertyValue @{
      done = $done
      nextStart = $nextStart
      total = $total
      updatedAt = (Get-Date).ToString("o")
    } -Force
    Save-State -State $state

    if ($done -or $nextStart -le $start) { break }
    $start = $nextStart
  }
}
}

Write-Host ""
Write-Host "All requested autocomplete types seeded." -ForegroundColor Green

