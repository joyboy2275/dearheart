# Dear, Always — implementation plan

## Product and approach

Build a responsive public-facing community where people can write a quote, letter, or short dedication for a love they lost, still cherish, hold one-sidedly, cannot let go of, or can never have. The form lets a writer choose a dedication category, optionally name themselves and the recipient, and decide whether to publish under a name or anonymously. Public entries appear on a filterable message wall and have an individual shareable page. Private entries stay off the public wall and use an unguessable, link-accessible page; the page must explain that anyone with this private link can read it. Readers can report a public entry for moderation review.

Implement with the initialized React 19 / Vite / TypeScript frontend, Express/tRPC backend, and Drizzle/MySQL database. Additive dedication and report tables back the writing, publishing, and reporting flows. Public endpoints validate inputs and return only public wall records; slug lookup powers individual pages, including private bearer-link pages. Do not add login or require a real name: privacy and authorship are writer-controlled. Persist moderation reports without claiming that a report automatically removes a post. The server shares one managed database between development and published environments, so apply only additive migrations and never seed or delete real user content.

## Project structure

- `client/src/pages/Home.tsx`: landing, message composer, category-filtered wall, and client-side mutation/query states.
- `client/src/pages/Note.tsx`: individual dedication route and user-facing report dialog.
- `client/src/App.tsx`: `/` and `/note/:slug` routes, with the existing `/404` behavior.
- `client/src/index.css`: shared editorial palette, type, responsive layout, cards, form, and reduced-motion styling.
- `client/public/`: static route manifest; the two custom editorial illustrations are served directly from their reserved Manus managed-storage paths.
- `server/routers.ts`: public tRPC procedures for list, detail, create, and report.
- `server/db.ts`: typed Drizzle queries and inserts for dedications and reports.
- `drizzle/schema.ts`, `drizzle/`: additive relational schema and checked-in SQL migration.
- Root `plan.md`, `TODO.md`, `app.config.ts`: design/implementation record, deliverable status, and project logo metadata.

## Design direction

Three possible styles (tail probabilities, sampled from the low-probability tails):
- Candlelit archive — keepsake-paper editorial, dried botanical details, restrained oxblood and warm cream. **0.071**
- Midnight correspondence — inky navy, silver moonlight, quiet celestial marks. **0.038**
- Confession ledger — sharp monochrome typography and vivid red editorial stamps. **0.019**

Selected: **Candlelit archive**, an intimate, contemporary correspondence archive rather than a generic romance landing page.

- **Design Movement:** Contemporary literary editorial blended with handmade ephemera and intimate letter-writing.
- **Core Principles:** Give the writing room to breathe; make privacy obvious before someone shares; treat different kinds of love with equal tenderness; keep discovery calm and unhurried.
- **Color Philosophy:** Warm paper and ink feel like a page someone kept. A small, unmistakable pomegranate-rose red brings the emotional pulse; muted sage and lilac distinguish accents without turning the page saccharine.
- **Layout Paradigm:** A spacious, asymmetrical editorial opening with a left-aligned invitation and a custom still-life on the right; below, a narrow writing column opens into a loose archive of slightly offset, readable letter-cards. Avoid a rigid dashboard/grid feel.
- **Signature Elements:** Small hand-drawn heart/seal mark; fine paper-rule borders with a torn-edge hint; delicate pressed-flower image used only at planned editorial moments.
- **Interaction Philosophy:** Private/public choice appears before submission and uses plain language. Category chips are quiet and easy to change. Submission responds with a gentle confirmation; reporting is available but not visually punitive.
- **Animation:** Soft fade/short upward arrival for hero and cards; subtle hover lift only; no looping effects or dramatic motion; disable nonessential movement under `prefers-reduced-motion`.
- **Typography System:** Cormorant Garamond for literary headlines and large pull-quotes; DM Sans for interface, labels, helper copy, and body text. Headlines have generous line-height, UI text stays compact and legible.
- **Brand Essence:** A small, anonymous archive for words people still carry — tender, honest, respectful.
- **Brand Voice:** Gentle and direct, never melodramatic or pushy. Example: “Some words deserve a place to land.” “Keep it just for you, or leave a light on for someone else.”
- **Wordmark & Logo:** “Dear, Always” set as a custom editorial wordmark beside a tiny one-line heart/seal symbol, not a stock-script love logo.
- **Signature Brand Color:** Pomegranate rose, a deep muted red used sparingly for the main invitation and emotional accents.

## Data and behavior

Dedications have a random, high-entropy public slug, message text, optional title/author/recipient, a category (lost, cherished, one-sided, obsessive longing, or unattainable), anonymity, privacy, and creation time. Public wall queries return only public entries with bounded pagination and optional category filtering. Creation is anonymous and does not require a user account. Public and private entries each receive an individual link; private links are bearer links, not account-locked storage. Reports store a dedication reference, reason, optional context, and time; a reporting UI is available on public pages. Validate category, message length, name/title lengths, and report reason on the server. Keep the report action discreet and include a reminder that this archive is for writing feelings, not contacting or tracking someone.

## Runtime and dependencies

Use the starter's existing libraries and platform-managed MySQL capability; no extra framework or paid dependency is needed. Expose functions as tRPC procedures under the existing `/api/trpc` mount. Keep the Node listener at the configured port 3000 and use the supplied health route. Serve a valid static `public/manus-routes.json` before starting Vite, synchronized with `/` and `/note/:slug`. Preserve current project config and `publishing.auto_publish: false`; save a canonical Manus checkpoint, but do not publish without a separate user request.
