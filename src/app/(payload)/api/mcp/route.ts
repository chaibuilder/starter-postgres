import { registerCustomBlocks } from '@/blocks'
import { getChaiBuilder } from '@/chaibuilder.server'
import { createChaiMcpRouteHandlers } from 'chaipro/mcp'
import { loadWebBlocks } from 'chaipro/web-blocks'

type ChaiMcpRouteOptions = Parameters<typeof createChaiMcpRouteHandlers>[0]

// The block tools convert blocks to and from HTML, which needs the full block
// registry — the same registration the editor and public renderer do at module
// load. A route handler is its own module graph, so without this the registry is
// empty here and add_custom_block/web-block HTML can't resolve any block type.
loadWebBlocks()
registerCustomBlocks()

// Publishing a large page, generating a layout or translating a page can run
// longer than a platform's default function timeout; the block tools are CPU-bound.
export const maxDuration = 300
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ChaiBuilder MCP (Model Context Protocol) endpoint.
 *
 * Mounts the built-in ChaiBuilder MCP tools registered by `mcpPlugin()` (see
 * `src/chaibuilder.config.ts`) as a Streamable HTTP transport at `/api/mcp`, so an
 * MCP-capable AI client can edit this site with the same permissions as the credential
 * it authenticates with. Point your client at `<site-origin>/api/mcp` and authenticate
 * with an `Authorization` header — the resolver deliberately ignores the browser session
 * cookie, so an open builder tab can't drive tool calls on the caller's behalf.
 *
 * @see https://www.chaibuilder.com/docs/ai/mcp-setup
 */
const handlers = createChaiMcpRouteHandlers({
  serverInfo: {
    name: 'chaibuilder',
    version: '1.0.0',
    title: 'ChaiBuilder MCP',
  },
  // The handle is bound to this app's fully-typed config; the transport only needs the
  // structural `ChaiBuilderInstance<any>` surface, so widen the resolver to its expected type.
  getChaiBuilder: ((request) =>
    getChaiBuilder({}, request)) as ChaiMcpRouteOptions['getChaiBuilder'],
  // A refused request reaches the client as a bare 401/403, and MCP clients then fall back to
  // an OAuth flow this site does not offer, which buries the cause. Say why in the server log
  // (never the key itself) so a failing connection can be diagnosed from the host's logs.
  onAuthFailure: ({ reason, request, userId, missingPermission }) => {
    let cause: string
    if (reason === 'forbidden') {
      cause = `user ${userId} lacks the "${missingPermission}" permission`
    } else if (!request.headers.get('authorization')) {
      cause = 'no Authorization header was sent'
    } else if (!userId) {
      cause =
        'the API key did not match any user: check the key, that "Enable API Key" is saved on ' +
        'the user, and that `payload migrate` has been run against this database'
    } else {
      cause = `user ${userId} is not an active member of this site (CHAIBUILDER_APP_KEY)`
    }
    console.warn(`[mcp] Refused ${request.method} /api/mcp: ${cause}.`)
  },
})

export const { GET, POST, DELETE } = handlers
