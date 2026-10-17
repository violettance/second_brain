# Second Brain design tokens

The app UI follows Productora's light neobrutalist visual system. Shared values live in `tokens.css`; Tailwind utilities in `tailwind.config.js` point to those CSS variables.

Use semantic tokens for colors, spacing, typography, borders, shadows, and component dimensions. Prefer the existing semantic utilities (`bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-ink`, and the `brand-*` colors) over adding literal CSS colors or arbitrary utility values. For Canvas and chart APIs that cannot read CSS variables, resolve colors and numeric values through `tokens.ts`.

When a new visual value is needed, add or adjust a token here and map it through the existing Tailwind theme if a utility is useful. Keep content values and data-driven chart calculations in their components.

Public pages share `PublicSiteLayout` for the Productora logo, navigation, workspace action, and footer. Terms and privacy share `LegalPageLayout`; document text is kept in the route components. Legal line length, sidebar columns, reading line height, font weights, and disclosure rotation are tokenized. Pricing uses the same outlined surfaces and primary action as the landing page.
