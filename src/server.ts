import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerTools } from './mcpTools.js'

export const createMcpServer = () => {
  const server = new McpServer({
    name: 'alpineconditions-mcp',
    version: '0.1.0'
  })

  registerTools(server)

  return server
}
