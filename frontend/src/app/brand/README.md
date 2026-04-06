# Brand Feature Structure

Use this feature-first structure for brand-side pages.

## Folders

- `dashboard/`: brand dashboard route and its local components.
- `campaign/`: campaign routes and campaign-only logic.
- `influencers/`: influencer discovery and shortlist logic for brands.

## Recommended Layout Per Feature

- `page.tsx`: route UI composition.
- `layout.tsx`: optional route-level wrapper.
- `types.ts`: feature-specific types.
- `components/`: presentational or route-local reusable components.
- `hooks/`: custom hooks for stateful logic.
- `utils/`: pure helper functions and mappers.

## Shared Components

Use shared UI in `src/components/`:

- `ui/buttons/`
- `ui/cards/`
- `ui/feedback/`
- `layout/`
- `navigation/`

Keep feature logic inside the feature folder and only move truly reusable UI to `src/components`.
