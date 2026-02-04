# Specification

## Summary
**Goal:** Build a minimal prototype app (“icp_quant_agent”) that can be configured to read ICPSwap/KongSwap on-chain pool state, display normalized market snapshots, compute cross-DEX deviation/arbitrage signals, and run a dry-run agent loop with history and simple strategy self-evaluation.

**Planned changes:**
- Create a minimal app shell with a coherent, distinctive visual theme and English-only UI text.
- Add a configuration UI for ICPSwap/KongSwap canister IDs, supported trading pairs, and pool identifiers; persist settings in a Motoko backend canister.
- Implement backend read-only canister calls to fetch pool/price state and expose a normalized snapshot API (with timestamp, identifiers, optional liquidity/reserve fields, and raw response).
- Build a “Market Watch” dashboard showing ICPSwap vs KongSwap snapshots side-by-side per configured pair/pool, with manual refresh, auto-refresh toggle, and per-row inline error display.
- Add analysis parameters (fees, slippage assumption, minimum profit threshold) and compute spread %, estimated net profit after costs, and a clear signal status with reasoning; indicate reduced-confidence when liquidity/reserve data is missing.
- Implement an “Agent” control panel with Start/Stop, a polling interval-driven decision loop (fetch → analyze → record decision), and a backend-persisted decision history view (dry-run only).
- Add an “Execution” mode scaffold (disabled by default) requiring explicit user acknowledgement; if not implemented, show a blocked state listing missing DEX integration details (method signatures/arguments).
- Add “Self-improvement” scaffolding: save versioned strategy parameter sets in backend and run a simple evaluation over stored history (counts by signal status at minimum).

**User-visible outcome:** Users can configure ICPSwap/KongSwap integration settings, view and refresh normalized on-chain snapshots side-by-side, see computed spreads and arbitrage signal statuses with cost assumptions, run a dry-run agent that logs decisions over time, view decision history, and save/evaluate strategy parameter versions—while execution remains explicitly disabled unless acknowledged and implemented.
