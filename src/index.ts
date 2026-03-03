import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { setBaseUrlOverride } from './config.js'
import { registerTools } from './mcpTools.js'

export type Env = {
	ALPINECONDITIONS_BASE_URL?: string
}

type WorkerExecutionContext = {
	waitUntil(promise: Promise<unknown>): void
	passThroughOnException(): void
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
		setBaseUrlOverride(env.ALPINECONDITIONS_BASE_URL)

		const url = new URL(request.url)
		if (url.pathname === '/mcp') {
			return AlpineConditionsMcp.serve('/mcp').fetch(request, env, ctx)
		}

		return new Response('Not found', { status: 404 })
	}
}
