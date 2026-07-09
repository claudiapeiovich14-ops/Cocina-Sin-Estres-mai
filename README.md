# Chef AI — Cocina Sin Estrés

Micro Activo Interactivo (frontend-only) que resuelve "¿qué cocino hoy?" en menos de un minuto.

No backend, no base de datos, no cuentas de usuario. Motor de decisión mock del lado del cliente que combina tiempo disponible, ingredientes, restricciones, objetivo del día y clima para armar una receta personalizada — con una animación "el Chef AI está pensando" como momento central de la experiencia.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion

## Desarrollo

```bash
npm install
npm run dev
```

## Estructura

- `app/page.tsx` — máquina de estados con las 23 pantallas del flujo.
- `lib/ai/decisionEngine.ts` — motor de decisión + regeneración ("no me convence").
- `lib/ai/mockChefAI.ts` — adaptador para recetas favoritas pegadas por el usuario.
- `lib/data/recipes.ts` — banco de recetas (bilingüe, es/en).
- `lib/i18n/strings.ts` — textos de la interfaz en español e inglés.
- `components/screens/AiThinking.tsx` — la animación central de "calculando tu resultado".

## Idioma y país

Son selectores independientes: el idioma controla los textos de la interfaz: el país controla ingredientes sugeridos, moneda y contexto local. Por ahora español e inglés están completos; el resto de los idiomas del PRD quedan preparados en la estructura para sumarse después.
