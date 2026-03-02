# AlpineConditions-MCP

An MCP server for alpineconditions.com weather and geolocation tools.

## What this can do now

- `get_weather_forecast`
  - Inputs: `latitude`, `longitude`, optional `models`
  - Loads forecast data from `https://apigateway.alpineconditions.com/weatherforecastapi/weatherForecast`
  - Returns structured forecast JSON with:
    - `overviewByModel` (high-level stats)
    - `sixHourlyByModel` (6-hour chunked summaries for easier LLM interpretation)
  - Includes model guidance for selected models and location-aware high-resolution/Blend availability

- `get_location_name_from_geolocation`
  - Uses `https://apigateway.alpineconditions.com/geolocation`
  - Resolves a human-readable location via `https://apigateway.alpineconditions.com/weatherforecastapi/location`

- `get_weather_model_guidance`
  - Inputs: `latitude`, `longitude`
  - Returns location-specific model guidance, including:
    - whether Alpine Conditions Blend is available
    - which high-resolution models are available at that location
    - model-specific usage guidance

## Setup

```bash
npm install
npm run build
```

## Run

```bash
npm start
```

## Build MCP Bundle

```bash
npm run build:mcpb
```

This creates `alpineconditions.mcpb` in the repository root for import into Claude Desktop.

## Production Test Suite

```bash
npm run test:prod
```

This runs live integration tests against `https://www.alpineconditions.com`.

For development:

```bash
npm run dev
```

## Configuration

- `ALPINECONDITIONS_BASE_URL` (optional)
  - Default: `https://apigateway.alpineconditions.com`
  - Useful for local testing or alternate environments.

## Notes

This server intentionally uses a self-contained API client under `src/services` and does not depend on frontend app modules from other repositories.
