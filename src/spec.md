# Specification

## Summary
**Goal:** Implement Version 11.1 backend-only triangular shadow arbitrage simulation for the fixed ICP → ckBTC → BOB → ICP route using ICPSwap pool IDs, with failure handling, recovery, and minimal lab logging.

**Planned changes:**
- Add a backend triangular shadow simulation entry point that always starts with a fixed input notional of exactly 100 ICP and clearly reports that notional in its returned/logged result payload.
- Implement constant-product (x*y=k) swap simulation with a 0.3% fee applied on each of the three legs using the strict pool route: xmiu5 (ICP/ckBTC) → 73nps (ckBTC/BOB) → sys7q (BOB/ICP).
- Enforce leg failure conditions in shadow mode: stop the forward path if pool data fetch fails for any leg or if computed slippage for any leg exceeds 0.5%, and return which leg failed and why (fetch failure vs slippage breach).
- Implement Short-circuit Recovery simulation on failure: convert remaining virtual assets back to ICP via the most liquid direct fallback pool selected by 1-minute moving average TVL computed from existing ring-buffer snapshots, using xmiu5 for ckBTC/ICP and ybilh for BOB/ICP.
- Persist only one Evolutionary Lab record per run containing the final net virtual profit/loss (net shadow return), with no per-leg persistence and no UI/path visualizer additions.

**User-visible outcome:** The backend can run a Version 11.1 triangular shadow simulation starting from 100 ICP, returning per-leg outputs and final virtual ICP (or recovery result on failure), while logging only the final net virtual P/L to the Evolutionary Lab.
