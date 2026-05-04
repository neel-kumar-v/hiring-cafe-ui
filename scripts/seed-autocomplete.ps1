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
    "description_keywords",
    "requirements_keywords",
    "bachelors_degree_titles",
    "associate_fields",
    "bachelor_fields",
    "master_fields",
    "doctorate_fields",
    "company_hq_country"
    # "scrape_state"
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

  # Build a real JSON object argument for Convex CLI (no manual escaping).
  $payload = @{
    type = $Type
    start = $Start
    count = $Count
  } | ConvertTo-Json -Compress

  # Capture output and surface CLI errors directly.
  $raw = & npx -y convex run --push "convex/autocompleteSeed:seedBatch" $payload 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw ("convex run failed for type='{0}' start={1} count={2}: {3}" -f $Type, $Start, $Count, ($raw -join [Environment]::NewLine))
  }
  if (-not $raw) {
    throw "No output from convex run. Ensure Convex is configured and reachable."
  }

  $text = ($raw -join [Environment]::NewLine)
  # Strip ANSI color sequences and odd control chars from spinner output.
  $text = [Regex]::Replace($text, "\x1B\[[0-9;]*[A-Za-z]", "")
  $text = [Regex]::Replace($text, "[\u0000-\u0008\u000B\u000C\u000E-\u001F]", "")

  $firstBrace = $text.IndexOf("{")
  $lastBrace = $text.LastIndexOf("}")
  if ($firstBrace -ge 0 -and $lastBrace -gt $firstBrace) {
    $jsonCandidate = $text.Substring($firstBrace, $lastBrace - $firstBrace + 1)
    try {
      return $jsonCandidate | ConvertFrom-Json
    } catch {
      # Fall through to key-value parsing below.
    }
  }

  # Fallback parser: handles both JSON (`"key": value`) and object-literal (`key: value`) output.
  $patterns = @{
    done      = '(?im)"?done"?\s*:\s*(true|false)'
    inserted  = '(?im)"?inserted"?\s*:\s*(\d+)'
    nextStart = '(?im)"?nextStart"?\s*:\s*(\d+)'
    processed = '(?im)"?processed"?\s*:\s*(\d+)'
    start     = '(?im)"?start"?\s*:\s*(\d+)'
    total     = '(?im)"?total"?\s*:\s*(\d+)'
    type      = '(?im)"?type"?\s*:\s*["'']?([A-Za-z0-9_]+)["'']?'
  }

  $parsed = [ordered]@{}
  foreach ($k in $patterns.Keys) {
    $m = [Regex]::Match($text, $patterns[$k])
    if (-not $m.Success) {
      throw "Failed to parse Convex result field '$k' from output: $text"
    }
    $parsed[$k] = $m.Groups[1].Value
  }

  try {
    return [pscustomobject]@{
      done = [bool]::Parse($parsed.done)
      inserted = [int]$parsed.inserted
      nextStart = [int]$parsed.nextStart
      processed = [int]$parsed.processed
      start = [int]$parsed.start
      total = [int]$parsed.total
      type = [string]$parsed.type
    }
  } catch {
    throw "Failed to parse Convex seed output: $text"
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

  $adaptiveBatchSize = $BatchSize
  $successesAtReducedSize = 0
  while ($true) {
    $result = $null
    $attemptBatchSize = $adaptiveBatchSize
    $hitTimeoutThisRound = $false
    while ($true) {
      try {
        $result = Invoke-SeedBatch -Type $t -Start $start -Count $attemptBatchSize
        break
      } catch {
        $msg = $_.Exception.Message
        $isTimeout =
          $msg -match "SystemTimeoutError" -or
          $msg -match "request timed out" -or
          $msg -match "execution timed out" -or
          $msg -match "timed out"

        if (-not $isTimeout -or $attemptBatchSize -le 1) {
          throw
        }

        $hitTimeoutThisRound = $true
        $successesAtReducedSize = 0
        $nextAttemptBatchSize = [Math]::Max(1, [int][Math]::Floor($attemptBatchSize / 2))
        if ($nextAttemptBatchSize -ge $attemptBatchSize) {
          $nextAttemptBatchSize = $attemptBatchSize - 1
        }
        Write-Host ("Timeout at start={0} with count={1}; retrying with count={2}" -f $start, $attemptBatchSize, $nextAttemptBatchSize) -ForegroundColor Yellow
        $attemptBatchSize = $nextAttemptBatchSize
      }
    }

    # Keep using the smaller size for this type once we hit a timeout.
    $adaptiveBatchSize = $attemptBatchSize
    if ($adaptiveBatchSize -lt $BatchSize) {
      if (-not $hitTimeoutThisRound) {
        $successesAtReducedSize++
        if ($successesAtReducedSize -ge 5) {
          $nextAdaptive = [Math]::Min($BatchSize, $adaptiveBatchSize * 2)
          if ($nextAdaptive -gt $adaptiveBatchSize) {
            Write-Host ("Stable for 5 batches at count={0}; trying count={1}" -f $adaptiveBatchSize, $nextAdaptive) -ForegroundColor DarkYellow
            $adaptiveBatchSize = $nextAdaptive
          }
          $successesAtReducedSize = 0
        }
      }
    } else {
      $successesAtReducedSize = 0
    }

    $inserted = if ($null -ne $result.inserted) { [int]$result.inserted } else { 0 }
    $processed = if ($null -ne $result.processed) { [int]$result.processed } else { 0 }
    $nextStart = if ($null -ne $result.nextStart) { [int]$result.nextStart } else { ($start + $adaptiveBatchSize) }
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

