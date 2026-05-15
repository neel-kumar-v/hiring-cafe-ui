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
  $clean = [Regex]::Replace($clean, "(?m)^\s*\[convex\]\s*", "")

  # Try extracting valid JSON objects from any balanced { ... } region and keep the last one.
  $lastResult = $null
  for ($start = 0; $start -lt $clean.Length; $start++) {
    if ($clean[$start] -ne '{') { continue }

    $depth = 0
    $inString = $false
    $escape = $false
    for ($i = $start; $i -lt $clean.Length; $i++) {
      $ch = $clean[$i]

      if ($inString) {
        if ($escape) {
          $escape = $false
          continue
        }
        if ($ch -eq '\') {
          $escape = $true
          continue
        }
        if ($ch -eq '"') {
          $inString = $false
        }
        continue
      }

      if ($ch -eq '"') {
        $inString = $true
        continue
      }
      if ($ch -eq '{') {
        $depth++
        continue
      }
      if ($ch -eq '}') {
        $depth--
        if ($depth -eq 0) {
          $candidate = $clean.Substring($start, $i - $start + 1)
          try {
            $parsed = $candidate | ConvertFrom-Json -ErrorAction Stop
            if ($null -ne $parsed) {
              $lastResult = $parsed
            }
          } catch {
            # Not valid JSON, continue searching
          }
          break
        }
        if ($depth -lt 0) {
          break
        }
      }
    }
  }

  if ($null -ne $lastResult) {
    return $lastResult
  }

  # Fallback parser for mixed CLI output that includes non-JSON debug object literals.
  $processedMatch = [Regex]::Match($clean, '(?im)(?:"processed"|processed)\s*:\s*(\d+)')
  $isDoneMatch = [Regex]::Match($clean, '(?im)(?:"isDone"|isDone)\s*:\s*(true|false)')
  $cursorMatch = [Regex]::Match($clean, '(?im)(?:"cursor"|cursor)\s*:\s*["'']([^"'']+)["'']')
  $errorMatch = [Regex]::Match($clean, '(?im)(?:"error"|error)\s*:\s*["'']([^"'']+)["'']')
  $statusMatch = [Regex]::Match($clean, '(?im)"Status"\s*:\s*"([^"]+)"')

  if (-not $processedMatch.Success -and -not $isDoneMatch.Success -and -not $cursorMatch.Success -and -not $errorMatch.Success -and -not $statusMatch.Success) {
    throw "Failed to parse Convex JSON output. No valid JSON object found. Output was: $clean"
  }

  $statusText = if ($statusMatch.Success) { $statusMatch.Groups[1].Value } else { "" }
  $state = "unknown"
  if ($statusText -match "(?i)\brunning\b") {
    $state = "running"
  } elseif ($statusText -match "(?i)\bsuccess\b|\bcompleted\b|\bdone\b") {
    $state = "success"
  } elseif ($statusText -match "(?i)\bfail") {
    $state = "failed"
  } elseif ($statusText -match "(?i)\bcancel") {
    $state = "canceled"
  }

  $processed = if ($processedMatch.Success) { [int]$processedMatch.Groups[1].Value } else { 0 }
  $isDone = if ($isDoneMatch.Success) { [bool]::Parse($isDoneMatch.Groups[1].Value) } else { $false }
  $cursor = if ($cursorMatch.Success) { $cursorMatch.Groups[1].Value } else { $null }
  $error = if ($errorMatch.Success) { $errorMatch.Groups[1].Value } else { $null }

  return [pscustomobject]@{
    state = $state
    processed = $processed
    isDone = $isDone
    cursor = $cursor
    error = $error
  }
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

function Test-IsTimeoutError {
  param([Parameter(Mandatory = $true)][string]$Message)
  return (
    $Message -match "SystemTimeoutError" -or
    $Message -match "request timed out" -or
    $Message -match "execution timed out" -or
    $Message -match "timed out"
  )
}

function Format-StatusLine {
  param([Parameter(Mandatory = $true)]$Status)
  $processed = if ($null -eq $Status.processed) { 0 } else { [int]$Status.processed }
  $state = if ($null -eq $Status.state) { "unknown" } else { [string]$Status.state }
  $isDone = if ($null -eq $Status.isDone) { $false } else { [bool]$Status.isDone }
  $cursor = if ($null -ne $Status.cursor) { [string]$Status.cursor } else { "null" }
  return ("state={0} processed={1} isDone={2} cursor={3}" -f $state, $processed, $isDone, $cursor)
}

function Start-JobCardsBackfill {
  param(
    [Parameter(Mandatory = $true)][int]$RequestedBatchSize,
    [Parameter(Mandatory = $true)][bool]$ResetRequested,
    [Parameter(Mandatory = $true)][bool]$UsePush
  )

  $attemptBatchSize = $RequestedBatchSize
  while ($true) {
    try {
      $start = Invoke-ConvexRun -FunctionName "migrations:backfillJobCards" -ArgsObject @{
        batchSize = $attemptBatchSize
        reset = $ResetRequested
        dryRun = $false
      } -UsePush:$UsePush

      return @{
        StartResult = $start
        EffectiveBatchSize = $attemptBatchSize
      }
    } catch {
      $message = $_.Exception.Message
      $isTimeout = Test-IsTimeoutError -Message $message
      if (-not $isTimeout -or $attemptBatchSize -le 1) {
        throw
      }

      $nextBatchSize = [Math]::Max(1, [int][Math]::Floor($attemptBatchSize / 2))
      if ($nextBatchSize -ge $attemptBatchSize) {
        $nextBatchSize = $attemptBatchSize - 1
      }
      Write-Host ("Start timeout at batchSize={0}; retrying with batchSize={1}" -f $attemptBatchSize, $nextBatchSize) -ForegroundColor Yellow
      $attemptBatchSize = $nextBatchSize
    }
  }
}

if ($Cancel) {
  $cancelResult = Invoke-ConvexRun -FunctionName "migrations:cancelJobCardsBackfill" -ArgsObject @{} -UsePush:$PushFirstBatch
  Write-Host ("Canceled. " + (Format-StatusLine -Status $cancelResult)) -ForegroundColor Yellow
  exit 0
}

Write-Host "Starting jobCards backfill..." -ForegroundColor Cyan
Write-Host ("batchSize={0} reset={1} pushFirstBatch={2}" -f $BatchSize, [bool]$Reset, $PushFirstBatch)

$activeBatchSize = $BatchSize
$startWithReset = [bool]$Reset
$startAttempt = Start-JobCardsBackfill -RequestedBatchSize $activeBatchSize -ResetRequested $startWithReset -UsePush $PushFirstBatch
$start = $startAttempt.StartResult
$activeBatchSize = [int]$startAttempt.EffectiveBatchSize

Write-Host ("Started. " + (Format-StatusLine -Status $start))
if ($activeBatchSize -ne $BatchSize) {
  Write-Host ("Using reduced batchSize={0} after startup retries." -f $activeBatchSize) -ForegroundColor DarkYellow
}
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
    $isTimeoutFailure = Test-IsTimeoutError -Message ([string]$errorMsg)
    if ($isTimeoutFailure -and $activeBatchSize -gt 1) {
      $nextBatchSize = [Math]::Max(1, [int][Math]::Floor($activeBatchSize / 2))
      if ($nextBatchSize -ge $activeBatchSize) {
        $nextBatchSize = $activeBatchSize - 1
      }
      Write-Host ("Migration timed out at batchSize={0}; restarting with batchSize={1} (reset=true)." -f $activeBatchSize, $nextBatchSize) -ForegroundColor Yellow
      $startWithReset = $true
      $startAttempt = Start-JobCardsBackfill -RequestedBatchSize $nextBatchSize -ResetRequested $startWithReset -UsePush $false
      $start = $startAttempt.StartResult
      $activeBatchSize = [int]$startAttempt.EffectiveBatchSize
      Write-Host ("Restarted. " + (Format-StatusLine -Status $start))
      continue
    }

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
