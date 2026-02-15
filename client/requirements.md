## Packages
framer-motion | Complex animations for hero and scroll reveals
lucide-react | Iconography throughout the app
recharts | For the "Price Transparency Widget" (bar charts comparing prices)
clsx | Conditional class merging (standard utility)
tailwind-merge | Tailwind class merging (standard utility)
wouter | Routing (already in base, but confirming usage)
@tanstack/react-query | Data fetching (already in base)

## Notes
- Images: Using Unsplash for hero, factory, and product images with descriptive comments for stability.
- Charts: Recharts used for the price comparison visualization.
- Auth: Using `use-auth.ts` provided by the Replit Auth integration.
- Routing: Wouter used for lightweight routing.
- State: Local state for cart (simple context or persisted state would be ideal, implementing a simple custom hook for now).
