# Documentación [Gestor de Tickets]

Aplicación web para seguimiento de tickets técnicos con autenticación Google, arquitectura full-stack en Next.js y persistencia en MongoDB Atlas.

## Tabla de contenidos

- [Resumen](#resumen)
- [Stack](#stack)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura](#arquitectura)
- [Frontend](#frontend)
- [Backend](#backend)
- [MongoDB](#mongodb)
- [Flujos principales](#flujos-principales)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Troubleshooting](#troubleshooting)
- [Seguridad y buenas prácticas](#seguridad-y-buenas-prácticas)

## Resumen

La app permite:

- autenticación con Google,
- creación/edición/seguimiento de tickets,
- checklist y branches por ticket,
- historial de cambios de estado,
- aislamiento de datos por usuario autenticado.

## Stack

- **Frontend**: Next.js App Router, React, TailwindCSS
- **Backend**: Route Handlers en Next.js (`src/app/api/...`)
- **Auth**: `next-auth` v4 (Google Provider, sesión JWT)
- **DB**: MongoDB Atlas + Mongoose
- **Lenguaje**: TypeScript

## Inicio rápido

### Requisitos

- Node.js 20 LTS (mínimo 18.18+)
- npm
- Cuenta de MongoDB Atlas
- Proyecto OAuth en Google Cloud

### Instalación

```bash
npm install
```

### Configuración local

1. Copiar `.env.example` a `.env.local`
2. Completar variables de entorno
3. Levantar:

```bash
npm run dev
```

## Variables de entorno

Necesarias en local y en Vercel:

- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET` (obligatoria en producción con next-auth v4)
- `NEXTAUTH_URL` (ej: `https://halfbaked-dev.vercel.app`)

## Arquitectura

### Estructura del proyecto

- `src/app`: páginas y layout (App Router)
- `src/app/api`: endpoints backend
- `src/components`: UI reusable
- `src/lib`: auth, conexión DB y lógica de dominio
- `src/models`: modelos/schemas Mongoose
- `src/types`: tipos de dominio

### Modelo de dominio principal

Entidad central: `Ticket`.

- owner por usuario (`ownerEmail`)
- estado principal (`mainStatus`)
- historial (`statusHistory`)
- checklist
- branches
- labels sanitizados

## Frontend

### Mapa de pantallas

- `src/app/page.tsx`: home/dashboard
- `src/app/tickets/new/page.tsx`: creación
- `src/app/tickets/[id]/page.tsx`: detalle
- `src/app/tickets/[id]/edit/page.tsx`: edición

### Componentes clave

- `src/components/TicketForm.tsx`: alta/edición
- `src/components/TicketCard.tsx`: vista resumen
- `src/components/LabelBadge.tsx`: etiquetas
- `src/components/AuthButtons.tsx`: login/logout

### Reglas de UX

- si no hay sesión, la home muestra CTA de login con Google
- si hay sesión, lista tickets del usuario
- estado inconsistente visible cuando `DONE` y checklist incompleto
- manejo de error de DB mostrado en home con mensaje legible

## Backend

### Endpoints

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/[id]`
- `PUT /api/tickets/[id]`
- `DELETE /api/tickets/[id]`
- `PATCH /api/tickets/[id]/status`
- `GET|POST /api/auth/[...nextauth]`

### Comportamiento

- todos los endpoints de tickets validan sesión
- sin sesión: `401 No autenticado`
- todas las consultas filtran por `ownerEmail`
- cambios de `mainStatus` se registran en `statusHistory`
- labels se filtran por lista permitida (`TICKET_LABELS`)

## MongoDB

### Conexión

Archivo: `src/lib/mongodb.ts`

- conexión vía `mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })`
- cache de conexión global (`global.mongooseCache`)
- validación de `MONGODB_URI` al momento de conectar

Flujo:

1. valida `MONGODB_URI`
2. reutiliza conexión si ya existe
3. crea promesa de conexión si no existe
4. guarda y retorna conexión cacheada

### Modelo Ticket

Archivo: `src/models/Ticket.ts`

Campos:

- `ownerEmail` (string, requerido, indexado)
- `title` (string, requerido)
- `description` (string)
- `mainStatus` (enum: `TODO | IN_PROGRESS | BLOCKED | DONE | QA | PROD`)
- `labels` (string[])
- `checklist[]`: `key`, `label`, `done`
- `branches[]`: `name`, `createdAt`
- `statusHistory[]`: `from`, `to`, `date`
- timestamps automáticos (`createdAt`, `updatedAt`)

### Aislamiento por usuario

Los tickets están segmentados por `ownerEmail`:

- listado: `find({ ownerEmail })`
- detalle/edición/borrado: `findOne({ _id, ownerEmail })` y variantes

Resultado: un usuario no puede leer/modificar tickets de otro.

## Flujos principales

### Login y sesión

1. usuario inicia con Google
2. NextAuth emite JWT de sesión
3. se persiste `session.user.email` vía callbacks
4. backend usa ese email para filtrar datos

### Crear ticket

1. frontend envía `POST /api/tickets`
2. backend valida sesión
3. sanitiza labels y checklist
4. guarda `ownerEmail` + `statusHistory` inicial

### Editar ticket

1. frontend envía `PUT /api/tickets/[id]`
2. backend verifica ownership
3. si cambia estado, agrega evento a `statusHistory`

## Despliegue en Vercel

Checklist mínimo:

- cargar variables de entorno en Vercel (Production)
- definir `NEXTAUTH_URL` con dominio final
- en Google OAuth agregar:
  - JavaScript Origin: dominio final
  - Redirect URI: `https://tu-dominio/api/auth/callback/google`
- redeploy luego de cambios en variables

## Troubleshooting

### Error: `NO_SECRET` (NextAuth)

Causa: falta `NEXTAUTH_SECRET` en producción.  
Solución: definir `NEXTAUTH_SECRET` y redeploy.

### Error: `redirect_uri_mismatch`

Causa: URI de callback no coincide con la configurada en Google OAuth.  
Solución: registrar URI exacta del dominio en uso.

### Error de conexión Atlas / whitelist

Mensaje típico: "Could not connect to any servers in your MongoDB Atlas cluster..."  
Solución:

1. Atlas -> Network Access
2. permitir `0.0.0.0/0` (o configuración de red equivalente para serverless)
3. validar usuario/clave en `MONGODB_URI`

### Error: `Define MONGODB_URI...`

Causa: variable faltante en entorno.  
Solución: cargar `MONGODB_URI` en el entorno correcto y redeploy.

## Seguridad y buenas prácticas

- no commitear secretos reales en `.env.example`
- mantener `.env.local` fuera de git
- rotar secretos si se exponen
- revisar Runtime Logs de Vercel ante errores 500
