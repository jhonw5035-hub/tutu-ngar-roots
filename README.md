# Tu Tu Ngar Design System

Step 1: Design Foundation Only



Set up the design foundation for Tu Tu Ngar, a pre-booked shared transportation platform for Yangon. This step is visual system only — no pages, no logic, no Supabase calls. Just the design tokens and a basic layout shell.

Brand direction

Simple and effective — not decorative. This is a transit/booking utility people will use quickly and often, often outdoors in daylight, so clarity and legibility matter more than flourish. Keep chrome minimal: generous whitespace, clear hierarchy, no unnecessary ornament.

Color system

Light theme

Primary: #F75514 (warm orange-red — used for primary actions, active states, key highlights)

Background: #FFFBF8 (warm white)

Text primary: near-black derived from the navy below (e.g. #0B2942) for strong contrast on warm white

Text secondary/muted: a desaturated warm gray, not pure gray — keep it in the same warm family as the background

Borders/dividers: a very light warm-gray, barely-there

Dark theme

Primary: #F75514 (same accent — keep it identical across themes so the brand color never shifts)

Background: #0B2942 (deep navy)

Text primary: warm white #FFFBF8 for strong contrast on navy

Text secondary/muted: a desaturated blue-gray sitting between the navy and warm white

Borders/dividers: a subtle lighter navy, low contrast against the background

Implement both as proper theme tokens (CSS variables or Tailwind theme config) with a light/dark toggle, not just two hardcoded palettes — every component should reference the tokens, not literal hex values, so future pages inherit theming automatically.

Use the orange primary deliberately and sparingly: primary buttons, active nav state, selected states (e.g. a selected seat, a selected route), and small accent moments like icons or badges. It should never become a background wash — let the warm white / deep navy carry each theme, with orange as the single point of energy.

Typography

A clean, highly legible sans-serif for UI text and body copy — prioritize readability at small sizes over character, since this is used for scanning times, prices, and seat availability quickly.

A slightly firmer/heavier weight for headings and key numbers (departure times, prices, seat counts) so they scan fast.

Confirm the chosen font(s) render Myanmar Unicode script correctly, or pair with a fallback font stack that does — this app will carry Burmese labels alongside English.

Set a clear, restrained type scale (not more than 5-6 sizes) — this is a utility product, not an editorial one.

Layout shell

Top nav or header: logo/wordmark treatment for "Tu Tu Ngar" (Burmese: တူတူငှား), theme toggle, minimal — this app will have three distinct sites (passenger, driver, admin) so keep the shell generic enough to reskin lightly per site later (e.g. via a small badge/label indicating which portal you're in).

Standard page container with consistent max-width and padding, mobile-first — most passengers and drivers will use this on a phone.

Base components to establish now: primary button, secondary button, input field, card, badge/tag (for status like "confirmed," "in progress"), and a simple bottom nav or sidebar pattern suitable for a mobile-first booking app.

Respect safe-area padding for mobile and keep tap targets large enough for one-handed use.

What NOT to do in this step

No route selection, booking flow, or dashboard pages yet — one blank/demo page is enough to show the shell and components working.

No Supabase or auth wiring — pure front-end tokens and layout only.

No decorative animation beyond simple, tasteful hover/focus states — keep motion minimal and purposeful, consistent with the "simple and effective" direction.

Build this as a reusable design system (tokens + component primitives) that every later prompt (Passenger site, Driver site, Admin site) will build on top of.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tutu-ngar-roots.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2c8cd9d-fac2-453c-9ebc-29e8c5dd8b1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
