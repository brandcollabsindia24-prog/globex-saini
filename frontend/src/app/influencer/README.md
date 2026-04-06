# Influencer Feature Architecture

This folder uses a feature-first structure for scalability and performance.

## Route Segments

- `dashboard/`: influencer dashboard orchestration and section modules.
- `campaigns/`: campaign listing/detail route logic.
- `profile/`: influencer profile workflows.
- `wallet/`: wallet, transactions, and withdrawals.

## Shared Influencer Components

- `components/dashboard/`: dashboard-only reusable UI blocks.
- `components/campaign/`: campaign-specific reusable blocks.
- `components/profile/`: profile-specific reusable blocks.
- `components/ui/`: shared presentational primitives for influencer routes.

## Per-Feature Conventions

Each feature can use:

- `components/`: feature-local UI.
- `hooks/`: stateful logic and data orchestration.
- `services/`: API adapters and server interaction code.
- `utils/`: pure helpers and formatters.
- `types.ts`: feature-specific type definitions.

## Scalability and Performance Notes

- Keep page files thin and move logic to `hooks/` and `services/`.
- Prefer memoized section components and co-located feature modules.
- Use route-level code splitting and dynamic imports for heavy sections.
- Keep shared UI lightweight and avoid business logic in shared primitives.
