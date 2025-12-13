# HGI Hub
 
 HGI Hub es un sitio/experimento construido con **Next.js (App Router)** para aterrizar y discutir **Human-Grounded Intelligence (HGI)**: menos hype, más contexto humano, y herramientas para que humanos + modelos colaboren sin que la plataforma se convierta en circo.
 
 Este repo ya tiene:
 
 - **Contenido estático** (Manifiesto, Prompt 101, Roadmap, Bibliografía, Whitepaper).
 - **Auth** con Supabase (email/password) en `/login`.
 - **Foros por “topic”** conectados a Supabase (piloto) dentro de modales (cards clickeables).
 - **Endpoint de “moderación/sugerencia” por IA** (`/api/moderar-comentario`) opcionalmente conectado a OpenAI.
 - **Formulario de suscripciones a comunidad** (`/comunidad` → `/api/suscripciones` → tabla `suscripciones`).
 
 
 ## Estado del proyecto (verificado en el código)
 
 - **UI principal**: lista y navegable.
 - **Foros (topics/posts)**: lectura + publicación ya conectadas a Supabase.
 - **Votos (up/down)**: el UI muestra contadores `upvotes/downvotes` desde la tabla `posts`, pero **no hay UI para votar** todavía.
 - **Moderación real / reputación / niveles / sanciones**: el diseño está descrito en `notes-2-the-model.md`, pero gran parte es **plan/arquitectura**, no implementación completa.
 
 
 ## Tech stack
 
 - **Next.js** `16.0.7` (App Router)
 - **React** `19.2.0`
 - **TypeScript**
 - **Tailwind CSS v4** (vía `@tailwindcss/postcss`)
 - **Supabase** (`@supabase/supabase-js`) para Auth + Postgres
 - **Framer Motion** para animaciones de modales y transiciones
 
 
 ## Estructura del repo (lo importante)
 
 - `src/app/`
   - **Rutas/páginas** (App Router):
     - `/` (`src/app/page.tsx`) home con cards + foros embebidos.
     - `/login` (Supabase Auth email/password).
     - `/comunidad` (form de suscripción).
     - `/manifiesto`, `/prompt-101`, `/roadmap`, `/bibliografia`, `/whitepaper`.
   - `src/app/api/`
     - `POST /api/moderar-comentario` (sugerencias IA).
     - `POST /api/suscripciones` (alta de email/rol en Supabase).
 - `src/components/`
   - `QueEsHGIDiscussion.tsx`: modal + conversación para el topic `home-que-es-hgi`.
   - `TopicDiscussionCard.tsx`: componente genérico para cualquier `topic` por `slug`.
   - `Navbar`, `Footer`, `Card`, `PageContainer`, `SectionTitle`, `BackgroundOrbits`.
 - `src/lib/`
   - `supabaseClient.ts`: `getSupabaseClient()` con cache y validación de env.
   - `useUser.ts`: hook para sesión en cliente.
   - `db.ts`: wrapper mínimo (por ahora solo `suscripciones.create`).
 - `src/types/`
   - Tipos para bibliografía, roadmap y suscripciones.
 - `public/`
   - Assets (incluye `hgi-logo.png`).
 
 Nota: existe un folder `components/` también en la raíz del repo. El código del sitio usa imports `@/components/...` apuntando a `src/components/...` (ver `tsconfig.json`). Si estás editando UI, **lo “authoritative” está en `src/components/`**.
 
 
 ## Variables de entorno
 
 Este proyecto depende de Supabase en runtime (cliente). Si faltan estas variables, `getSupabaseClient()` truena con error explícito.
 
 - `NEXT_PUBLIC_SUPABASE_URL`
 - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 
 Opcional (solo si quieres IA real en `/api/moderar-comentario`):
 
 - `OPENAI_API_KEY`
 
 Archivos relevantes:
 
 - `.env.example` trae el formato.
 - `.env.local` **NO debe commitearse** (está ignorado por `.gitignore`).
 
 
 ## Base de datos (Supabase) — lo que el frontend espera
 
 El frontend asume que existen estas tablas en `public`:
 
 - `topics`
   - mínimo: `id`, `slug`
 - `posts`
   - mínimo: `id`, `topic_id`, `author_id`, `author_type`, `content`, `origin`, `upvotes`, `downvotes`
 - `suscripciones`
   - mínimo: `id`, `email`, `nombre`, `rol`, `created_at`
 
 El documento `notes-2-the-model.md` describe el diseño completo (incluyendo `profiles`, `votes`, `topic_stats`, `moderation_events`, `ip_bans` y reglas de reputación). Ese documento es la **referencia de arquitectura/diseño**.
 
 
 ## Topics activos (slugs usados en UI)
 
 La app consulta topics por `slug` (y falla con mensaje si no existen). Slugs usados hoy:
 
 - Home:
   - `home-que-es-hgi` (componente especializado `QueEsHGIDiscussion`)
   - `home-por-que-importa`
   - `home-manifiesto`
   - `home-prompt-101`
   - `home-comunidad`
 - Prompt Engineering 101:
   - `prompt101-reglas`
   - `prompt101-system-prompt`
   - `prompt101-ejemplos`
   - `prompt101-errores`
   - `prompt101-evaluacion`
   - `prompt101-contrato`
 
 Si estás montando Supabase desde cero, necesitas insertar estos `topics` (por lo menos `slug` + `id` autogenerado) para que los modales puedan leer y publicar.
 
 
 ## API (Next.js Route Handlers)
 
 ### `POST /api/moderar-comentario`
 
 - **Input**
 
 ```json
 { "content": "texto" }
 ```
 
 - **Output**
 
 ```json
 { "suggested": "texto", "explanation": "texto" }
 ```
 
 - **Comportamiento**
   - Si no existe `OPENAI_API_KEY`, responde una sugerencia “dummy” (no bloquea el flujo).
   - Si existe `OPENAI_API_KEY`, llama a `https://api.openai.com/v1/chat/completions` con modelo `gpt-4o-mini`.
 
 
 ### `POST /api/suscripciones`
 
 - **Input**
 
 ```json
 { "email": "tu@correo", "nombre": "opcional", "rol": "dev|investigador|educador|curioso|otro" }
 ```
 
 - **Output**
 
 ```json
 { "message": "..." }
 ```
 
 - Inserta en la tabla `suscripciones` usando `src/lib/db.ts`.
 
 
 ## Desarrollo local
 
 1. Instala dependencias:
 
 ```bash
 npm install
 ```
 
 2. Crea `.env.local` (puedes copiar de `.env.example`) y pon tus credenciales de Supabase.
 
 3. Corre el server:
 
 ```bash
 npm run dev
 ```
 
 Abre `http://localhost:3000`.
 
 
 ## Scripts
 
 - `npm run dev` — Next dev server
 - `npm run build` — build producción
 - `npm run start` — server producción
 - `npm run lint` — ESLint
 
 
 ## Qué falta (intencionalmente, para no mentir)
 
 Lo siguiente se menciona o se anticipa en UI/diseño, pero **no está completo** en este repo todavía:
 
 - UI de **upvote/downvote** (aunque existen campos y ordenamiento por `upvotes`/`downvotes`).
 - Triggers/automatizaciones para mantener contadores (`profiles`, `topic_stats`, votos).
 - Modo `debated_with_ai` (en UI se menciona como “modo arcoíris”, pero no existe flujo de debate ni transcript).
 - Panel `/admin` real (en `/login` se menciona como “más adelante”).
 
 
 ## Documentación clave
 
 - `notes-2-the-model.md`: explicación detallada de arquitectura, esquema y reglas (fuente principal para entender HGI Hub).
