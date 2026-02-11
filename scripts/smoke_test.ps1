param(
  [string]$ApiBase = "http://localhost:8001",
  [string]$WebBase = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"

function Assert-StatusCode {
  param(
    [string]$Url,
    [int[]]$AllowedStatusCodes
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    $code = [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $code = [int]$_.Exception.Response.StatusCode.value__
    } else {
      throw
    }
  }

  if ($AllowedStatusCodes -notcontains $code) {
    throw "Unexpected status code $code for $Url (expected: $($AllowedStatusCodes -join ', '))"
  }
  Write-Host "OK $code - $Url"
}

Write-Host "Running smoke checks..."
Assert-StatusCode "$ApiBase/health" @(200)
Assert-StatusCode "$ApiBase/api/v1/mission-packs/" @(200)
Assert-StatusCode "$WebBase/" @(200)
Write-Host "Smoke checks passed."
