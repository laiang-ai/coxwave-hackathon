# Agents Workspace

This folder keeps multi-agent definitions isolated so multiple developers can work
in parallel without conflicts.

Structure
- agents/<agent-id>/config.ts: Agent configuration and factory.
- agents/<agent-id>/tools.ts: Tools used by the agent.
- tools/: Shared tools that multiple agents can reuse.
- registry.ts: Central registry to expose agents to the app.
- graph.ts: Handoff graph (orchestration) for composed agents.
- router.ts: Routing rules for request-level agent selection.
- types.ts: Shared types for registry and agents.

Add a new agent
1) Run `pnpm agent:new <agent-id> "<Display Name>"`.
2) Update `config.ts` and `tools.ts`.
3) Optional: add routing rules in `router.ts`.

Note
- Keep each agent self-contained to avoid merge conflicts.
- Avoid circular imports between agents; define handoffs in `graph.ts`.
- Routing defaults to `assistant` unless rules in `router.ts` match.
- API supports `agentId` (manual) or `routeStrategy: "auto" | "manual"` for routing.
