import { getChaiBuilder } from '@/chaibuilder.server'
import { createChaiMcpRouteHandlers } from 'chaipro/mcp'
import type { ChaiBuilderInstance } from 'chaipro/types'

/**
 * ChaiBuilder MCP (Model Context Protocol) endpoint.
 *
 * Mounts the built-in ChaiBuilder MCP tools registered by `mcpPlugin()` (see
 * `src/chaibuilder.config.ts`) as a Streamable HTTP transport at `/api/mcp`, so an
 * MCP-capable AI client can edit this site with the same permissions as the credential
 * it authenticates with. Point your client at `<site-origin>/api/mcp` and authenticate
 * with an `Authorization` header — the resolver deliberately ignores the browser session
 * cookie, so an open builder tab can't drive tool calls on the caller's behalf.
 */
const handlers = createChaiMcpRouteHandlers({
  serverInfo: {
    name: 'chaibuilder',
    version: '1.0.0',
    title: 'ChaiBuilder MCP',
  },
  // The handle is bound to this app's fully-typed config; the transport only needs the
  // structural `ChaiBuilderInstance` surface, so widen the generic at the boundary.
  getChaiBuilder: (request) =>
    getChaiBuilder({}, request) as Promise<ChaiBuilderInstance<Record<string, unknown>>>,
})

export const { GET, POST, DELETE } = handlers
