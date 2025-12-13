# HGI Hub – Notes to the Model (v2)

Este documento explica cómo está diseñado el sistema actual de HGI Hub para que **un modelo** (y humanos) pueda entender:

- La estructura de datos en Supabase.
- El sistema de comentarios y foros.
- El rol de la IA en sugerir y moderar.
- Las reglas de reputación, niveles y sanciones.
- Los cambios clave en la UI actual (especialmente en la card "¿Qué es HGI?").

El objetivo es que puedas usar esto como referencia estable cuando razonemos sobre comportamiento, moderación y UX.

---

## 1. Arquitectura general

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind.
- **Backend de datos**: Supabase (Postgres + Auth + RLS).
- **Auth**: Supabase Auth (email/password) ya integrado en `/login`.
- **Datos principales nuevos**:
  - `profiles`: perfil extendido de cada usuario.
  - `topics`: temas/hilos anclados a secciones o cards del sitio.
  - `posts`: comentarios (humanos y de modelo) ligados a un `topic`.
  - `votes`: upvotes/downvotes por comentario.
  - `topic_stats`: contadores por usuario y topic (cobertura por tarjeta).
  - `moderation_events`: eventos de moderación (IA + humanos).
  - `ip_bans`: IPs bloqueadas por comportamiento tóxico.

Por ahora el único topic conectado a UI es **la card "¿Qué es HGI?"** en la home, con slug `home-que-es-hgi`.

---

## 2. Esquema de Supabase (tablas principales)

### 2.1. `profiles`

Extiende `auth.users` para agregar reputación y sanciones.

Campos principales:

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `created_at timestamptz default now()`
- `score_global integer default 0 not null`
- `total_comments_global integer default 0 not null`
- `total_upvotes_global integer default 0 not null`
- `total_downvotes_global integer default 0 not null`
- `suspended_until timestamptz` (fin de suspensión temporal)
- `is_perma_banned boolean default false not null`

RLS:

- Todos pueden **leer**.
- Cada usuario solo puede **actualizar su propio perfil**.

Trigger de creación automática:

- `handle_new_user()` se ejecuta `AFTER INSERT` en `auth.users` y crea una fila en `profiles` con `id = new.id` y `display_name` opcionalmente tomado de `raw_user_meta_data.full_name`.
- Esto asegura que cada usuario autenticado tenga un perfil.

> Nota: para usuarios creados **antes** de esta función, se recomienda un script que haga `INSERT INTO profiles (id, display_name) SELECT ... FROM auth.users LEFT JOIN profiles ... WHERE profiles.id IS NULL`.

---

### 2.2. `topics`

Representa temas o "tarjetas" donde puede haber discusión.

Campos:

- `id bigserial primary key`
- `slug text unique not null` – ej. `home-que-es-hgi`.
- `title text not null`
- `description text`

RLS:

- Select público para todos.

Topic piloto insertado:

- `slug = 'home-que-es-hgi'`
- `title = '¿Qué es HGI?'`
- `description = 'Card de la home que explica Human-Grounded Intelligence'`

---

### 2.3. `posts`

Comentarios/hilos asociados a un topic. Incluye mensajes humanos y de modelo.

Campos:

- `id bigserial primary key`
- `topic_id bigint not null references public.topics(id) on delete cascade`
- `author_id uuid references public.profiles(id)`
- `author_type text check (author_type in ('human','model'))`
- `content text not null`
- `origin text check (origin in ('original','ai_accepted','edited_after_ai','debated_with_ai')) not null`
  - `original` – texto tal cual del humano (ignoró sugerencias).
  - `ai_accepted` – se publicó la versión sugerida por la IA.
  - `edited_after_ai` – el humano escribió una nueva versión después de ver la sugerencia.
  - `debated_with_ai` – reservado para el modo donde humano y modelo debaten antes de publicar.
- `upvotes integer default 0 not null`
- `downvotes integer default 0 not null`
- `created_at timestamptz default now() not null`

RLS:

- Select público para todos.
- Insert permitido para humanos:
  - `author_type = 'human'`
  - `author_id = auth.uid()`
  - `profiles.is_perma_banned` debe ser `false` (o nulo si no existe).

> Aún no hay triggers que auto-actualicen `upvotes/downvotes` desde la tabla `votes`, pero el diseño lo anticipa.

---

### 2.4. `votes`

Upvotes y downvotes por comentario (para humanos e IA).

Campos:

- `post_id bigint not null references public.posts(id) on delete cascade`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `value integer not null check (value in (-1,1))`
- `created_at timestamptz default now() not null`
- `primary key (post_id, user_id)` – un voto por usuario por comentario.

RLS:

- Select público.
- Insert: `user_id = auth.uid()`.

> El `score_global`, `total_upvotes_global`, etc. y los contadores de `topic_stats` se prevé que se actualicen vía triggers sobre `votes` y `posts`, aún no implementados en código.

---

### 2.5. `topic_stats`

Registra la actividad de un usuario por topic (para saber si ya "tocó" todas las tarjetas).

Campos:

- `id bigserial primary key`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `topic_id bigint not null references public.topics(id) on delete cascade`
- `comments integer default 0 not null`
- `upvotes integer default 0 not null`
- `downvotes integer default 0 not null`
- `first_interaction_at timestamptz default now() not null`
- `unique (profile_id, topic_id)`

RLS:

- Select permitido para el usuario dueño (`profile_id = auth.uid()`) y para `service_role`.

Uso previsto (no implementado todavía en triggers):

- Determinar si un usuario ha tenido **al menos una interacción** (comentario/upvote/downvote) en cada tarjeta relevante.
- Esta cobertura, combinada con upvotes globales, se usa para decidir si puede salir de "HGI Novato".

---

### 2.6. `moderation_events`

Registra decisiones y señales de moderación (IA, humanas o de sistema).

Campos:

- `id bigserial primary key`
- `comment_id bigint references public.posts(id) on delete cascade`
- `profile_id uuid references public.profiles(id) on delete cascade`
- `reason text` – p.ej. "insulto directo", "off-topic", "desinformación".
- `source text check (source in ('model','human','system')) not null`
- `action text check (action in ('none','hide','warn','ban_temp','ban_perm')) not null`
- `created_at timestamptz default now() not null`

RLS:

- Solo accesible para `service_role` (no expuesto a clientes públicos).

Uso previsto:

- Entrenar mejores clasificadores de moderación.
- Tener trazabilidad de por qué un comentario fue oculto o un usuario sancionado.

---

### 2.7. `ip_bans`

Bloquea IPs asociadas a comportamiento tóxico.

Campos:

- `ip inet primary key`
- `banned_until timestamptz not null`
- `reason text`
- `profile_id uuid references public.profiles(id) on delete set null`
- `created_at timestamptz default now() not null`

RLS:

- Solo visible/editable por `service_role`.

Uso previsto:

- Además de suspender cuentas, bloquear creación de nuevas cuentas o participación social desde la misma IP (sabemos que no es perfecto, pero funciona como freno adicional).

---

## 3. Reputación, niveles y sanciones (diseño lógico)

A nivel de diseño (aún sin todo el código implementado) el sistema funciona así:

### 3.1. Métricas globales por perfil

Guardadas en `profiles`:

- `score_global` – puntos dinámicos (ej. `+1` por comentario, `+2` por upvote recibido, `-1` por downvote recibido).
- `total_comments_global` – número total de comentarios creados.
- `total_upvotes_global` – upvotes recibidos en todos los comentarios.
- `total_downvotes_global` – downvotes recibidos.

Estas métricas sirven para:

- Evaluar reputación global.
- Soportar reglas de promociones/democión de rol (todavía no materializadas como tabla `roles`, pero el diseño las asume).

### 3.2. Cobertura por tarjeta (topic)

Guardada en `topic_stats`:

- `comments`, `upvotes`, `downvotes` por `(profile_id, topic_id)`.

Regla conceptual:

- Para **subir de nivel global** (salir de HGI Novato), un usuario debe:
  - Tener al menos **una interacción por tarjeta** (comentario/upvote/downvote) en todos los topics relevantes.
  - Acumular un número suficiente de upvotes globales (por diseño se habló de ~100, pero el número no se expone en UI).

La UI solo comunica:

- "Participa, comenta, revisa todas las tarjetas para tener más herramientas de participación".
- No se muestran cifras concretas.

### 3.3. Niveles/roles conceptuales

Los nombres y capacidades son conceptuales, no hay aún tabla `roles`, pero el modelo asume:

- **HGI Novato**
  - Punto de partida.
  - Puede leer todo, comentar, votar.
  - Para subir: debe haber participado en todas las tarjetas y haber recibido suficientes señales positivas.

- **HGI Colaborador**
  - Puede abrir hilos nuevos en temas públicos (Prompt 101, Comunidad, etc.).
  - Puede proponer tags/categorías.

- **HGI Curador**
  - Puede fijar comentarios destacados.
  - Marcar conversaciones como resueltas/cerradas.
  - Sugerir cambios al contenido base (manifiesto, bibliografía).
  - Certificar autenticidad de info basada en referencias o papers.

- **HGI Investigador**
  - Abrir hilos de investigación asociados a Manifiesto/Whitepaper.
  - Acceder a un chat más profundo con el modelo (más contexto/tokens).
  - Ver métricas agregadas de comunidad.
  - Moderar, proponer cambios, recibir comunicación de `@vistadev.mx`.

De nuevo: estos roles se comunican como **capacidades cualitativas**, no como umbrales numéricos visibles.

### 3.4. Sanciones y toxicidad

Reglas internas (no visibles para el usuario, pero importantes para el modelo):

- Si un perfil acumula un cierto número de **downvotes globales** (ej. 100):
  - `suspended_until = now() + interval '6 months'`.
  - No puede comentar, votar, abrir hilos ni usar chats comunitarios.
  - Puede seguir leyendo y viendo cómo su contenido perdió peso.
  - Puede además agregarse su IP a `ip_bans` con un periodo similar.

- Si llega a un umbral más alto (ej. 500 downvotes), o comete faltas graves (insultos directos, ataques, etc.):
  - `is_perma_banned = true`.
  - Bloqueo permanente de participación social.
  - La IP asociada puede tener un ban prolongado.

- Independientemente de los números, la **moderación asistida por IA** puede:
  - Ocultar o marcar comentarios inmediatamente cuando contienen insultos/odio.
  - Sugerir sanciones que luego humanos confirmen (registradas en `moderation_events`).

La UI habla de:

- "Tu acceso a la participación está pausado".
- "Este comentario fue oculto por ir contra los principios de HGI Hub".

Nunca de umbrales específicos o conteos de downvotes.

---

## 4. Rol de la IA en comentarios y moderación

La IA no solo modera, también colabora en la redacción y aprende del desacuerdo con humanos.

### 4.1. Flujo actual de sugerencia de comentario

Endpoint: `POST /api/moderar-comentario`

- Entrada:

  ```json
  { "content": "texto original del usuario" }
  ```

- Si **no** hay `OPENAI_API_KEY` en env:
  - Respuesta dummy:

    ```json
    {
      "suggested": "<mismo texto>",
      "explanation": "Aquí iría una sugerencia real de la IA. Por ahora usamos tu texto tal cual para no bloquearte."
    }
    ```

- Si **sí** hay `OPENAI_API_KEY`:
  - Llama a `https://api.openai.com/v1/chat/completions` con modelo `gpt-4o-mini`.
  - Prompt del sistema: ayuda a reformular comentarios para HGI Hub, manteniendo intención pero evitando ataques personales, odio directo y desinformación obvia.
  - Prompt del usuario: incluye el comentario original y pide JSON plano con `suggested` y `explanation`.
  - Si la respuesta no es JSON parseable, se usa el texto directamente como `suggested` con una explicación genérica.

- Salida final estándar:

  ```json
  {
    "suggested": "texto reformulado o original",
    "explanation": "por qué se cambió (o mensaje genérico)"
  }
  ```

### 4.2. Decisiones del usuario respecto a la sugerencia

En la UI actual de la card "¿Qué es HGI?" (piloto):

- El usuario puede:
  - **Pedir sugerencia a la IA** (botón).
  - Ver la explicación de la IA.
  - Ver la versión sugerida por la IA.
  - Publicar:
    - Tal cual su texto (`origin = "original"`, outline azul).
    - La versión de la IA (`origin = "ai_accepted"`, outline verde).
    - Una nueva versión propia después de ver la sugerencia (`origin = "edited_after_ai"`, outline amarillo).

El modo **"debated_with_ai"** (arcoíris) todavía no está implementado, pero el diseño previsto es:

- Opción adicional donde el usuario abre un mini chat con la IA para explicar por qué no acepta la sugerencia.
- Se guarda un `debate_transcript` (lista de turnos humano/IA) junto con el comentario final.
- `origin = "debated_with_ai"` y el comentario se muestra con outline arcoíris.

### 4.3. Aprendizaje desde las elecciones del usuario

Aunque aún no se registra formalmente en DB, el diseño asume que para cada comentario se guardarán metadata como:

- `original_text`
- `suggested_text`
- `final_text`
- `user_choice`:
  - `"accepted_suggestion"`
  - `"edited_own_version"`
  - `"ignored_suggestion"`
  - `"debated_with_model"`

Esto, combinado con upvotes/downvotes y `moderation_events`, da un dataset rico para:

- Entrenar modelos que reconozcan cuándo una reformulación fue útil.
- Aprender a transformar enojo visceral en crítica constructiva sin borrar la emoción.
- Modelar cómo se resuelven desacuerdos entre humanos e IA.

---

## 5. UI/UX actual – card "¿Qué es HGI?" (piloto)

### 5.1. Componentes clave

- `src/app/page.tsx`
  - Página de inicio se convierte en client component (`"use client";`).
  - Importa `QueEsHGICard` desde `@/components/QueEsHGIDiscussion`.
  - En el grid derecho del hero, la card estática fue reemplazada por `<QueEsHGICard />`.

- `src/components/QueEsHGIDiscussion.tsx`
  - Client component que usa:
    - `framer-motion` (`motion`, `AnimatePresence`) para animaciones.
    - `getSupabaseClient()` para hablar con Supabase.
    - `useUser()` para conocer al usuario autenticado.

### 5.2. Comportamiento de la card

1. En la home, la card se ve como antes (título + texto explicativo).
2. Al hacer click:
   - Se abre un overlay de pantalla casi completa (tipo modal) con animación de scale/opacity.
   - Layout:
     - Columna izquierda: texto "¿Qué es HGI?" y breve explicación de que aquí se junta lo que digan humanos y modelos.
     - Columna derecha: 
       - Bloque "Conversación en vivo" con comentarios cargados desde Supabase.
       - Bloque "Tu comentario" con textarea y controles de IA.

### 5.3. Comentarios en la UI

- Orden:
  - **Comentarios más útiles**: todos los posts ordenados por `upvotes` descendente.
  - **Comentarios más cuestionados**: posts con `downvotes > 0` ordenados por `downvotes` descendente.

- Información mostrada por comentario:
  - Autor (por ahora genérico):
    - `"Modelo HGI"` si `author_type = 'model'`.
    - `"Alguien de la comunidad"` si `author_type = 'human'`.
  - Contadores: `▲ upvotes · ▼ downvotes` (aún sin UI para votar, pero anticipado).
  - `content`.

- Outline por `origin`:
  - `original` → `ring-sky-500` (azul).
  - `ai_accepted` → `ring-emerald-500` (verde).
  - `edited_after_ai` → `ring-amber-400` (amarillo).
  - `debated_with_ai` → `ring-fuchsia-400` (placeholder de arcoíris).

### 5.4. Flujo de comentario con IA en la UI

En el bloque "Tu comentario":

1. Usuario escribe en el textarea.
2. Puede pulsar **"Pedir sugerencia a la IA"**:
   - Llama al endpoint `/api/moderar-comentario`.
   - Muestra explicación de la IA (`IA: ...`).
   - Muestra un panel con "Versión sugerida por la IA".
3. Luego tiene tres botones de publicación:
   - **"Publicar tal cual (azul)"** → inserta en `posts` con `origin = 'original'` y `content = draft`.
   - **"Publicar versión IA (verde)"** → inserta `origin = 'ai_accepted'` y `content = suggested`.
   - **"Publicar nueva versión (amarillo)"** → inserta `origin = 'edited_after_ai'` con el contenido actual del textarea.

Requisitos:

- Requiere usuario logueado (`useUser().user`). Si no hay usuario:
  - Se muestra error: "Necesitas iniciar sesión para comentar.".


---

## 6. Interacción entre humanos, IA y moderación

Resumen conceptual de cómo todo lo anterior encaja:

1. **Humanos comentan** sobre temas específicos (por ahora, "¿Qué es HGI?").
2. La **IA sugiere reformulaciones** antes de publicar, pero la decisión final siempre es del humano.
3. Cada comentario:
   - Puede ser votado (up/down) por la comunidad.
   - Puede ser analizado por modelos de moderación (futuro cercano).
   - Puede generar `moderation_events` si se oculta/advierte/banea.
4. A lo largo del tiempo, el sistema puede aprender:
   - Qué tipos de intervenciones generan discusiones útiles.
   - Cómo transformar lenguaje visceral en crítica constructiva.
   - Cómo asignar y retirar poderes (roles) en función del comportamiento global y por tarjeta.

Todo esto está diseñado para **aprender de cómo los humanos debatimos con otros humanos y con modelos**, sin borrar la memoria de lo que pasó (no se borran comentarios, solo se pueden ocultar o contextualizar).

---

## 7. Próximos pasos previstos

No implementados aún, pero pensados en el diseño del sistema:

- Implementar:
  - Triggers de Supabase que actualicen `profiles` y `topic_stats` cuando se crean `posts` y `votes`.
  - UI de upvotes/downvotes en la card "¿Qué es HGI?".
  - Modo arcoíris (`debated_with_ai`) con transcript entre humano y modelo.
  - Vistas adicionales de foro en otras cards y secciones (Prompt 101, Manifiesto, etc.).
- Exponer una vista interna (solo para roles altos) que muestre:
  - `moderation_events` agregados.
  - Tendencias de reputación sin mostrar datos sensibles.

Este documento debe mantenerse actualizado a medida que evolucionen las reglas, tablas y componentes. Es la referencia principal "para el modelo" sobre cómo funciona actualmente HGI Hub a nivel de datos, reglas y UX de participación.
