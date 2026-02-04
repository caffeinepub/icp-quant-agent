# Specification

## Summary
**Goal:** Finalize Version 10 by making backend tick tracking and agent startup environment-aware, exposing a clear “System Ready” status to the dashboard, adding persistent timer-start failure notifications, and synchronizing frontend refreshes to backend tick state.

**Planned changes:**
- Backend: Add persistent `last_update_id` that increments only when a valid live price sample is fetched and written to the ring buffer; expose an API to query `last_update_id`.
- Backend: Implement environment-aware `startAgent` behavior (Mainnet forces live source ON + starts 10s timer + immediate fetch; Dev respects live-source toggle but ensures 10s timer is running and fetches immediately only if live source is ON).
- Backend + Frontend: Add a status API exposing `isMainnet`, `liveSourceEnabled`, `timerRunning`, and computed `systemReady`; show “System Ready” on the dashboard as a green shield when true and a clearly not-ready state with English explanation when false.
- Backend + Frontend: Detect/report 10-second timer start failures and surface a persistent “Canister Timeout” warning in a Notification Center UI (not only a toast).
- Frontend: Poll backend `last_update_id` every 10 seconds and refresh tick-dependent widgets (including the 1-minute volatility chart) only when `last_update_id` changes.
- Both: Update candid/types and React Query hooks to match Version 10 API changes and ensure clean builds for release.

**User-visible outcome:** The dashboard shows whether the system is ready (green shield only when on Mainnet, live source enabled, and timer running), displays a persistent “Canister Timeout” warning if the timer cannot start, and updates tick-driven charts/widgets exactly once per backend tick based on `last_update_id`.
