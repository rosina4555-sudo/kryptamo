# Kryptamo

**Pass-through cross-border remittance, powered by stablecoin rails.**

Kryptamo lets a sender pay from their own card or bank account and have the funds delivered straight into the recipient's local Mobile Money (MoMo) wallet — with no wallets or held balances in between. Stablecoins (USDC/USDT via HoneyCoin) are used as an invisible settlement rail. Recipients are identified by their registered `@username` (e.g. `@kwame`).

## How It Works

1. **Sign up / Sign in** — JWT-based auth; every write request sends `Authorization: Bearer <JWT_TOKEN>`.
2. **Recipient lookup** — Enter a recipient `@username`; Kryptamo verifies them and shows their verified MoMo holder name (e.g. "KWAME A. MENSAH (MTN Ghana)") before you proceed.
3. **Quote** — FX rate, network fee, and platform fee are locked for a strict **5-minute window**.
4. **Transfer** — Confirm the quote; a checkout webview/modal collects the sender's funds.
5. **Live tracking** — See the transfer flow through an 8-state machine in real time via WebSocket, from `FUNDING_PENDING` to `PAID_OUT`.

## Tech Stack

- [Vue 3](https://vuejs.org/) — Composition API with `<script setup>` SFCs
- [Vite](https://vite.dev/) — Build tool and dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first styling via the `@tailwindcss/vite` plugin
- [Vue Router 4](https://router.vuejs.org/) — Client-side routing

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:5173
```

## Commands

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the development server      |
| `npm run build`     | Build for production to `dist/`   |
| `npm run preview`   | Preview the production build      |

## Project Structure

```
src/
├── App.vue            # Root component (renders <RouterView />)
├── main.js            # App entry point
├── style.css          # Global styles (Tailwind import)
├── router/index.js    # Vue Router configuration
├── views/             # Page-level route components
└── components/        # Reusable components
```

## Conventions

- Route pages live in `src/views/`, reusable components in `src/components/`.
- Global styling uses Tailwind utility classes in templates; keep `style.css` minimal.
- Prefer Composition API (`<script setup>`) for all components.
- Full API & product spec: `kryptamo.docx` (local file, not tracked in git).