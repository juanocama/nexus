param(
  [string]$ApiBaseUrl = $env:API_BASE_URL,
  [string]$Token = $env:TOKEN,
  [string]$BookingId = $env:BOOKING_ID,
  [int]$Threads = $(if ($env:THREADS) { [int]$env:THREADS } else { 10 }),
  [int]$Loops = $(if ($env:LOOPS) { [int]$env:LOOPS } else { 5 }),
  [int]$RampSeconds = $(if ($env:RAMP_SECONDS) { [int]$env:RAMP_SECONDS } else { 5 }),
  [string]$CollectionStatus = $(if ($env:COLLECTION_STATUS) { $env:COLLECTION_STATUS } else { 'approved' }),
  [string]$PreferenceId = $(if ($env:PREFERENCE_ID) { $env:PREFERENCE_ID } else { "jmeter-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" }),
  [string]$JMeterImage = $(if ($env:JMETER_IMAGE) { $env:JMETER_IMAGE } else { 'justb4/jmeter:latest' }),
  [switch]$NoStartApi,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$apiDir = Join-Path $repoRoot 'api'
$resultsDir = Join-Path $PSScriptRoot 'results'
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null

if (-not $ApiBaseUrl) {
  $ApiBaseUrl = 'http://host.docker.internal:3000/api/v1'
}

if (-not $BookingId) {
  $BookingId = '66666666-6666-6666-6666-666666666666'
}

if (-not $Token) {
  $Token = (& node (Join-Path $apiDir 'scripts/create-test-jwt.js')).Trim()
}

if (-not $Token) {
  throw 'TOKEN is required. Pass -Token, set TOKEN, or run from a machine that can execute api/scripts/create-test-jwt.js.'
}

function Convert-ToHostProbeUrl([string]$BaseUrl) {
  return $BaseUrl.
    Replace('host.docker.internal', 'localhost').
    Replace('host.containers.internal', 'localhost')
}

function Test-ApiReady([string]$BaseUrl, [string]$BearerToken) {
  $probeBaseUrl = (Convert-ToHostProbeUrl $BaseUrl).TrimEnd('/')
  $probeUrl = "$probeBaseUrl/trips"

  try {
    $response = Invoke-WebRequest `
      -UseBasicParsing `
      -Uri $probeUrl `
      -Headers @{ Authorization = "Bearer $BearerToken" } `
      -TimeoutSec 3
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-ApiReady([string]$BaseUrl, [string]$BearerToken, [int]$TimeoutSeconds) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-ApiReady $BaseUrl $BearerToken) {
      return $true
    }
    Start-Sleep -Seconds 2
  }
  return $false
}

function Is-LocalApi([string]$BaseUrl) {
  return $BaseUrl -match '://(host\.docker\.internal|host\.containers\.internal|localhost|127\.0\.0\.1)(:|/)'
}

$startedApiJob = $null
if (-not (Test-ApiReady $ApiBaseUrl $Token)) {
  if ((Is-LocalApi $ApiBaseUrl) -and -not $NoStartApi) {
    Write-Host "API is not reachable yet. Starting local API for the JMeter run..."
    if (-not $SkipBuild) {
      Push-Location $apiDir
      try {
        npm.cmd run build
      } finally {
        Pop-Location
      }
    }

    $startedApiJob = Start-Job -ArgumentList $apiDir -ScriptBlock {
      param([string]$JobApiDir)
      Set-Location $JobApiDir
      node dist/main.js
    }

    if (-not (Wait-ApiReady $ApiBaseUrl $Token 45)) {
      if ($startedApiJob) {
        Stop-Job $startedApiJob -ErrorAction SilentlyContinue
        Remove-Job $startedApiJob -ErrorAction SilentlyContinue
      }
      throw "API did not become reachable at $(Convert-ToHostProbeUrl $ApiBaseUrl). Start the API manually or pass -ApiBaseUrl for the running server."
    }
  } else {
    throw "API is not reachable at $(Convert-ToHostProbeUrl $ApiBaseUrl). Start the API before running JMeter, or use a reachable API_BASE_URL."
  }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$jtl = "/jmeter/results/payment-verify-$stamp.jtl"
$report = "/jmeter/results/payment-verify-report-$stamp"
$hostJmeterDir = (Resolve-Path $PSScriptRoot).Path

Write-Host "Running Apache JMeter payment traffic"
Write-Host "API_BASE_URL=$ApiBaseUrl"
Write-Host "BOOKING_ID=$BookingId"
Write-Host "THREADS=$Threads LOOPS=$Loops RAMP_SECONDS=$RampSeconds"
Write-Host "Results: $resultsDir"

$dockerArgs = @(
  'run',
  '--rm',
  '-v',
  "${hostJmeterDir}:/jmeter",
  $JMeterImage,
  '-n',
  '-t',
  '/jmeter/payment-verify.jmx',
  '-l',
  $jtl,
  '-e',
  '-o',
  $report,
  "-JAPI_BASE_URL=$ApiBaseUrl",
  "-JTOKEN=$Token",
  "-JBOOKING_ID=$BookingId",
  "-JPREFERENCE_ID=$PreferenceId",
  "-JCOLLECTION_STATUS=$CollectionStatus",
  "-JTHREADS=$Threads",
  "-JLOOPS=$Loops",
  "-JRAMP_SECONDS=$RampSeconds"
)

try {
  docker @dockerArgs
  $dockerExit = $LASTEXITCODE
  if ($dockerExit -ne 0) {
    throw "Docker/JMeter failed with exit code $dockerExit."
  }
} finally {
  if ($startedApiJob) {
    Stop-Job $startedApiJob -ErrorAction SilentlyContinue
    Remove-Job $startedApiJob -ErrorAction SilentlyContinue
  }
}

Write-Host "JMeter finished."
Write-Host "JTL: $(Join-Path $resultsDir "payment-verify-$stamp.jtl")"
Write-Host "HTML report: $(Join-Path $resultsDir "payment-verify-report-$stamp\index.html")"
