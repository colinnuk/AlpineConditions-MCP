import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import {
  AlpineConditionsRuntimeEnv,
  getForceOAuth,
  getOAuthAuthorizationServers,
  getOAuthResourceName,
  getOAuthScopes,
  setRuntimeEnvOverrides
} from './config.js'
import { registerTools } from './mcpTools.js'

export type Env = AlpineConditionsRuntimeEnv

type WorkerExecutionContext = {
	waitUntil(promise: Promise<unknown>): void
	passThroughOnException(): void
}

const jsonResponse = (body: unknown, init?: ResponseInit): Response => {
	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		},
		...init
	})
}

const getProtectedResourceMetadataUrl = (request: Request, resourcePath: string): string => {
	return new URL(`/.well-known/oauth-protected-resource${resourcePath}`, request.url).toString()
}

const buildProtectedResourceMetadata = (request: Request, resourcePath: string): Record<string, unknown> => {
	const resourceUrl = new URL(resourcePath, request.url).toString()
	const configuredAuthorizationServers = getOAuthAuthorizationServers()
	const scopesSupported = getOAuthScopes()
	const resourceName = getOAuthResourceName()

	return {
		resource: resourceUrl,
		authorization_servers:
			configuredAuthorizationServers.length > 0 ? configuredAuthorizationServers : [new URL('/', request.url).toString()],
		bearer_methods_supported: ['header'],
		...(scopesSupported.length > 0 ? { scopes_supported: scopesSupported } : {}),
		...(resourceName ? { resource_name: resourceName } : {})
	}
}

const getBearerToken = (request: Request): string | null => {
	const authorization = request.headers.get('authorization')?.trim()
	if (!authorization) {
		return null
	}

	const [scheme, token] = authorization.split(/\s+/, 2)
	if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
		return null
	}

	return token
}

const getChallengedResourcePath = (pathname: string): string => {
	if (pathname.startsWith('/sse')) {
		return '/sse'
	}

	return '/mcp'
}

const unauthorizedResponse = (request: Request): Response => {
	const resourcePath = getChallengedResourcePath(new URL(request.url).pathname)
	const metadataUrl = getProtectedResourceMetadataUrl(request, resourcePath)

	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': `Bearer error="invalid_token", error_description="Bearer token required", resource_metadata="${metadataUrl}"`
		}
	})
}

const getProtectedResourcePath = (pathname: string): string | null => {
	const prefix = '/.well-known/oauth-protected-resource'
	if (!pathname.startsWith(prefix)) {
		return null
	}

	const resourcePath = pathname.slice(prefix.length)
	return resourcePath.length > 0 ? resourcePath : '/'
}

export class AlpineConditionsMcp extends McpAgent {
	server = new McpServer({
		name: 'alpineconditions-mcp',
		version: '0.1.0'
	})

	async init(): Promise<void> {
		registerTools(this.server)
	}
}

export default {
	fetch(request: Request, env: Env, ctx: WorkerExecutionContext): Response | Promise<Response> {
		setRuntimeEnvOverrides(env)

		const url = new URL(request.url)
		const forceOAuth = getForceOAuth()

		const protectedResourcePath = getProtectedResourcePath(url.pathname)
		if (forceOAuth && protectedResourcePath) {
			return jsonResponse(buildProtectedResourceMetadata(request, protectedResourcePath))
		}

		if (url.pathname === '/mcp') {
			if (forceOAuth && request.method !== 'OPTIONS' && !getBearerToken(request)) {
				return unauthorizedResponse(request)
			}

			return AlpineConditionsMcp.serve('/mcp').fetch(request, env, ctx)
		}

		if (url.pathname.startsWith('/sse')) {
			if (forceOAuth && request.method !== 'OPTIONS' && !getBearerToken(request)) {
				return unauthorizedResponse(request)
			}

			return AlpineConditionsMcp.serveSSE('/sse').fetch(request, env, ctx)
		}

		return new Response('Not found', { status: 404 })
	}
}
