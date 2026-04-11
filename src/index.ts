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
			return createMcpHandler(server, { enableJsonResponse: true })(request, env, ctx)
		}

		return new Response('Not found', { status: 404 })
	}
}
