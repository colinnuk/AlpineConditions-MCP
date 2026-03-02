$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$bundleDir = Join-Path $projectRoot '.mcpb_build'
$bundleZip = Join-Path $projectRoot 'alpineconditions.mcpb.zip'
$bundleOut = Join-Path $projectRoot 'alpineconditions.mcpb'
$distDir = Join-Path $projectRoot 'dist'
$nodeModulesDir = Join-Path $projectRoot 'node_modules'
$packageJsonPath = Join-Path $projectRoot 'package.json'

if (!(Test-Path $distDir)) {
  throw "Missing dist directory. Run 'npm run build' first."
}

if (!(Test-Path $nodeModulesDir)) {
  throw "Missing node_modules directory. Run 'npm install' first."
}

$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$version = $packageJson.version

if (Test-Path $bundleDir) { Remove-Item -Recurse -Force $bundleDir }
if (Test-Path $bundleZip) { Remove-Item -Force $bundleZip }
if (Test-Path $bundleOut) { Remove-Item -Force $bundleOut }

New-Item -ItemType Directory -Path $bundleDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $bundleDir 'server') | Out-Null

$manifest = @{
  manifest_version = '0.1'
  name = 'com.alpineconditions.mcp'
  display_name = 'Alpine Conditions'
  version = $version
  description = 'Mountain weather and geolocation tools for alpineconditions.com'
  author = @{
    name = 'Alpine Conditions'
  }
  server = @{
    type = 'node'
    entry_point = 'server/index.js'
    mcp_config = @{
      command = 'node'
      args = @('${__dirname}/server/index.js')
      env = @{
        ALPINECONDITIONS_BASE_URL = 'https://apigateway.alpineconditions.com'
      }
    }
  }
  tools = @(
    @{
      name = 'get_weather_forecast'
      description = 'Load weather forecast data for coordinates.'
    },
    @{
      name = 'get_location_name_from_geolocation'
      description = 'Resolve a human-readable location name from the geolocation endpoint.'
    }
  )
} | ConvertTo-Json -Depth 8

$manifest | Set-Content -Path (Join-Path $bundleDir 'manifest.json') -Encoding UTF8

Copy-Item -Recurse -Force (Join-Path $distDir '*') (Join-Path $bundleDir 'server')
Copy-Item -Recurse -Force $nodeModulesDir (Join-Path $bundleDir 'server\node_modules')

Compress-Archive -Path (Join-Path $bundleDir '*') -DestinationPath $bundleZip -CompressionLevel Optimal
Move-Item -Force $bundleZip $bundleOut
Remove-Item -Recurse -Force $bundleDir

Write-Host "Created bundle: $bundleOut"
