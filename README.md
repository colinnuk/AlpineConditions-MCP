# AlpineConditions-MCP

An HTTP MCP server for alpineconditions.com weather and geolocation tools, designed for Cloudflare Workers.

The server can also run in an OAuth-protected mode for hosted deployments, so MCP clients can authenticate and the upstream Alpine Conditions API can receive a stable per-user partition token.

## What this can do now

- `get_weather_forecast`
  - Inputs: `latitude`, `longitude`, optional `models`
  - Loads forecast data from `https://apigateway.alpineconditions.com/weatherforecastapi/weatherForecast`
  - Returns structured forecast JSON with:
    - `overviewByModel` (high-level stats)
    - `sixHourlyByModel` (6-hour chunked summaries for easier LLM interpretation)
  - Includes compact model context for LLM use (`used` and concise `selectedModelNotes`)
  - Use `get_weather_model_guidance` for full location-wide model guidance details

- `get_historical_weather_estimate`
  - Inputs: `latitude`, `longitude`
  - Loads historical estimate data from `https://apigateway.alpineconditions.com/weatherforecastapi/historicalestimate`
  - Returns structured estimate JSON with:
    - `overview` (high-level stats for the recent historical window)
    - `sixHourly` (6-hour chunked summaries over the historical timeline)

- `get_location_name_from_geolocation`
  - Uses `https://apigateway.alpineconditions.com/geolocation`
  - Resolves a human-readable location via `https://apigateway.alpineconditions.com/weatherforecastapi/location`

- `get_weather_model_guidance`
  - Inputs: `latitude`, `longitude`
  - Returns location-specific model guidance, including:
    - whether Alpine Conditions Blend is available
    - which high-resolution models are available at that location
    - model-specific usage guidance

- `get_avalanche_bulletin`
  - Inputs: `latitude`, `longitude`
  - Loads avalanche bulletin data from `https://apigateway.alpineconditions.com/avalancheapi`
  - Internally resolves area ID by coordinates, then loads the latest area bulletin
  - Returns structured bulletin JSON including area metadata, danger ratings, problems, and terrain/travel advice

## Public Link
- https://mcp.alpineconditions.com/mcp
- [MCP Inspector](https://mcp.ziziyi.com/inspector?serverUrl=https%3A%2F%2Fmcp.alpineconditions.com%2Fmcp&transport=streamable-http)

## Setup

```bash
npm install
npm run build
```

## Run locally (Worker dev server)

```bash
npm run dev
```

MCP endpoint: `http://127.0.0.1:8787/mcp`

## Deploy (Cloudflare Workers)

```bash
npm run deploy
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

## Configuration

- `ALPINECONDITIONS_BASE_URL` (optional)
  - Default: `https://apigateway.alpineconditions.com`
  - Useful for local testing, alternate environments, or pointing hosted MCP traffic at a non-rate-limited authenticated upstream.
  - In Cloudflare Workers, set this as a Worker environment variable.

- `ALPINECONDITIONS_FORCE_OAUTH` (optional)
  - Default: off
  - When enabled, `/mcp` and `/sse` require a bearer token and the worker serves MCP OAuth protected-resource metadata from `/.well-known/oauth-protected-resource/mcp`.

- `ALPINECONDITIONS_OAUTH_AUTHORIZATION_SERVERS` (optional)
  - Comma-separated list of OAuth authorization server base URLs to advertise in MCP protected-resource metadata.
  - If omitted, the worker falls back to its own origin, which only works if OAuth metadata and endpoints are available there.

- `ALPINECONDITIONS_OAUTH_SCOPES` (optional)
  - Comma-separated OAuth scopes to advertise for MCP clients.

- `ALPINECONDITIONS_OAUTH_RESOURCE_NAME` (optional)
  - Human-readable protected resource name returned in MCP OAuth metadata.

- `ALPINECONDITIONS_PARTITION_HEADER_NAME` (optional)
  - Default: `X-AlpineConditions-User-Id`
  - Header name sent upstream with a stable per-user partition token derived from the bearer token.

- `ALPINECONDITIONS_USER_ID_CLAIMS` (optional)
  - Comma-separated JWT claim names to try when deriving the upstream partition token.
  - Default order: `sub,oid,email,preferred_username,upn`
  - If none of those claims are present, the server falls back to a short SHA-256 hash of the bearer token.

## Notes

This server intentionally uses a self-contained API client under `src/services` and does not depend on frontend app modules from other repositories.
