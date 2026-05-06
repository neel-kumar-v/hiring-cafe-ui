param(
  [int]$BatchSize = 20,
  [int]$PollSeconds = 5,
  [bool]$PushFirstBatch = $true,
  [switch]$Reset = $false,
  [switch]$StartOnly = $false,
  [switch]$Cancel = $false
)

$ErrorActionPreference = "Stop"

if ($BatchSize -lt 1 -or $BatchSize -gt 500) {
  throw "BatchSize must be between 1 and 500."
}
if ($PollSeconds -lt 1 -or $PollSeconds -gt 300) {
  throw "PollSeconds must be between 1 and 300."
}

function Parse-ConvexJson {
  param(
    [Parameter(Mandatory = $true)][string]$Text
  )

  # Clean ANSI codes and control chars
  $clean = [Regex]::Replace($Text, "\x1B\[[0-9;]*[A-Za-z]", "")
  $clean = [Regex]::Replace($clean, "[\u0000-\u0008\u000B\u000C\u000E-\u001F]", "")

  $lastBrace = $clean.LastIndexOf("}")
  if ($lastBrace -lt 0) {
    throw "Could not find any '}' in Convex output: $clean"
  }

  # Convex output can contain multiple blocks (e.g. [DEBUG] { ... } then the actual JSON).
  # We try parsing from each '{' to the last '}' until we find a valid JSON object.
  # We want the LAST valid JSON object if multiple exist, but usually only the last one is valid
  # when combined with the final '}'.
  $firstBrace = -1
  $lastResult = $null

  while ($true) {
    $firstBrace = $clean.IndexOf("{", $firstBrace + 1)
    if ($firstBrace -lt 0 -or $firstBrace -ge $lastBrace) {
      break
    }

    $candidate = $clean.Substring($firstBrace, $lastBrace - $firstBrace + 1)
    try {
      $parsed = $candidate | ConvertFrom-Json -ErrorAction Stop
      if ($null -ne $parsed) {
        $lastResult = $parsed
      }
    } catch {
      # Not valid JSON, continue searching
    }
  }

  if ($null -eq $lastResult) {
    throw "Failed to parse Convex JSON output. No valid JSON object found. Output was: $clean"
  }

  return $lastResult
}

function Invoke-ConvexRun {
  param(
    [Parameter(Mandatory = $true)][string]$FunctionName,
    [Parameter(Mandatory = $true)]$ArgsObject,
    [bool]$UsePush = $false
  )

  $payload = $ArgsObject | ConvertTo-Json -Compress
  $convexArgs = @("exec", "convex", "run")
  if ($UsePush) {
    $convexArgs += "--push"
  }
  $convexArgs += @($FunctionName, $payload)

  $oldEAP = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $raw = & pnpm @convexArgs 2>&1
  $ErrorActionPreference = $oldEAP

  if ($LASTEXITCODE -ne 0) {
    throw ("convex run failed for '{0}': {1}" -f $FunctionName, ($raw -join [Environment]::NewLine))
  }
  if (-not $raw) {
    throw ("No output from convex run for '{0}'." -f $FunctionName)
  }

  $responseText = $raw | ForEach-Object { $_.ToString() }
  return Parse-ConvexJson -Text ($responseText -join [Environment]::NewLine)
}

function Format-StatusLine {
  param([Parameter(Mandatory = $true)]$Status)
  $processed = if ($null -eq $Status.processed) { 0 } else { [int]$Status.processed }
  $state = if ($null -eq $Status.state) { "unknown" } else { [string]$Status.state }
  $isDone = if ($null -eq $Status.isDone) { $false } else { [bool]$Status.isDone }
  $cursor = if ($null -ne $Status.cursor) { [string]$Status.cursor } else { "null" }
  return ("state={0} processed={1} isDone={2} cursor={3}" -f $state, $processed, $isDone, $cursor)
}

if ($Cancel) {
  $cancelResult = Invoke-ConvexRun -FunctionName "migrations:cancelJobCardsBackfill" -ArgsObject @{} -UsePush:$PushFirstBatch
  Write-Host ("Canceled. " + (Format-StatusLine -Status $cancelResult)) -ForegroundColor Yellow
  exit 0
}

Write-Host "Starting jobCards backfill..." -ForegroundColor Cyan
Write-Host ("batchSize={0} reset={1} pushFirstBatch={2}" -f $BatchSize, [bool]$Reset, $PushFirstBatch)

$start = Invoke-ConvexRun -FunctionName "migrations:backfillJobCards" -ArgsObject @{
  batchSize = $BatchSize
  reset = [bool]$Reset
  dryRun = $false
} -UsePush:$PushFirstBatch

Write-Host ("Started. " + (Format-StatusLine -Status $start))
if ($StartOnly) {
  exit 0
}

while ($true) {
  Start-Sleep -Seconds $PollSeconds
  $status = Invoke-ConvexRun -FunctionName "migrations:getJobCardsBackfillStatus" -ArgsObject @{}
  if ($null -eq $status) {
    Write-Host "No migration status found yet..."
    continue
  }

  Write-Host (Format-StatusLine -Status $status)
  $state = if ($null -eq $status.state) { "" } else { [string]$status.state }
  $isDone = if ($null -eq $status.isDone) { $false } else { [bool]$status.isDone }

  if ($state -eq "failed") {
    $errorMsg = if ($null -eq $status.error) { "unknown error" } else { $status.error }
    throw ("Migration failed: {0}" -f $errorMsg)
  }
  if ($state -eq "canceled") {
    Write-Host "Migration canceled." -ForegroundColor Yellow
    break
  }
  if ($isDone -or $state -eq "success") {
    Write-Host "Done. jobCards backfill migration completed." -ForegroundColor Green
    break
  }
}
