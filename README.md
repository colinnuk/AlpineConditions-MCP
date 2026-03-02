# AlpineConditions-MCP

An MCP server for alpineconditions.com focused on mountain weather.

## What this can do now

- `get_mountain_weather_forecast`
  - Inputs: `latitude`, `longitude`, optional `models`
  - Loads forecast data from `https://www.alpineconditions.com/weatherforecastapi/weatherForecast`
  - Includes mountain-focused summary fields (snowfall totals, freezing level, wind gusts, rain-snow level)

- `get_location_name_from_geolocation`
  - Uses `https://www.alpineconditions.com/geolocation`
  - Resolves a human-readable location via `https://www.alpineconditions.com/weatherforecastapi/location`

## Setup

```bash
npm install
npm run build
```

## Run

```bash
npm start
```

For development:

```bash
npm run dev
```

## Configuration

- `ALPINECONDITIONS_BASE_URL` (optional)
  - Default: `https://www.alpineconditions.com`
  - Useful for local testing or alternate environments.

## Notes

This server intentionally uses a self-contained API client under `src/services` and does not depend on frontend app modules from other repositories.
