# Kryptamo

A modern web app built with Vue 3, Vite, Tailwind CSS, and Vue Router.

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