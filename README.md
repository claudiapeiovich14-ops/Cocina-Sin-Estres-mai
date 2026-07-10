# Chef AI — Cocina Sin Estrés

Micro Activo Interactivo (frontend-only) que resuelve "¿qué cocino hoy?" en menos de un minuto.

No backend, no base de datos, no cuentas de usuario. Motor de decisión mock del lado del cliente que combina tiempo disponible, ingredientes, restricciones, objetivo del día y clima para armar una receta personalizada — con una animación "el Chef AI está pensando" como momento central de la experiencia.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion

## Desarrollo

\`\`\`bash
npm install
npm run dev
\`\`\`

## Estructura

- `app/page.tsx` — máquina de estados con las pantallas del flujo.
- `lib/decisionEngine.ts` — motor de decisión + regeneración ("no me convence").
- `lib/mockChefAI.ts` — adaptador para recetas favoritas pegadas por el usuario.
- `lib/recipes.ts` — banco de recetas y snacks (bilingüe, es/en).
- `lib/occasionMenus.ts` — menús curados para ocasiones especiales.
- `lib/strings.ts` — textos de la interfaz en español e inglés.
- `components/AiThinking.tsx` — la animación central de "calculando tu resultado".

## Idioma y país

Son selectores independientes: el idioma controla los textos de la interfaz: el país controla ingredientes sugeridos, moneda y contexto local. Por ahora español e inglés están completos; el resto de los idiomas del PRD quedan preparados en la estructura para sumarse después.

## Deploy a GitHub Pages

La app es 100% frontend, así que se exporta como sitio estático (`next.config.js` usa `output: "export"`) y se publica con GitHub Actions en cada push a `main` (ver `.github/workflows/deploy.yml`).

Paso único manual: en el repo de GitHub, ir a **Settings → Pages** y elegir **Source: GitHub Actions**. Después de eso, cada push a `main` la vuelve a publicar sola en `https://<usuario>.github.io/Cocina-Sin-Estres-mai/`.

\`\`\`bash
GITHUB_ACTIONS=true npm run build   # genera ./out con el basePath del repo, igual que en CI
\`\`\`
