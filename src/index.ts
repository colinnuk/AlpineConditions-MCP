import { createMcpHandler } from 'agents/mcp'
import { setBaseUrlOverride } from './config.js'
import { createMcpServer } from './server.js'

export type Env = {
	ALPINECONDITIONS_BASE_URL?: string
}

type WorkerExecutionContext = {
	waitUntil(promise: Promise<unknown>): void
	passThroughOnException(): void
}

export default {
	fetch(request: Request, env: Env, ctx: WorkerExecutionContext): Response | Promise<Response> {
		setBaseUrlOverride(env.ALPINECONDITIONS_BASE_URL)

		const url = new URL(request.url)
		if (url.pathname === '/mcp') {
			const server = createMcpServer()
			// OpenAI's MCP client only sends Accept: application/json, but WorkerTransport
			// validates that text/event-stream is also declared (per the Streamable HTTP spec).
			// Patch the header so validation passes; enableJsonResponse ensures JSON responses.
			const accept = request.headers.get('Accept') ?? ''
			const mcpRequest = accept.includes('text/event-stream') ? request : (() => {
				const headers = new Headers(request.headers)
				headers.set('Accept', accept ? `${accept}, text/event-stream` : 'application/json, text/event-stream')
				return new Request(request, { headers })
			})()
			return createMcpHandler(server, { enableJsonResponse: true })(mcpRequest, env, ctx)
		}

		return new Response('Not found', { status: 404 })
	}
}
