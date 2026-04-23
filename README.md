# Gestor personal de tickets

Aplicacion web con Next.js (App Router), TypeScript, TailwindCSS y MongoDB Atlas (Mongoose).

## Requisitos

- Node.js 18.18+ (ideal 20 LTS)
- npm
- Cuenta de MongoDB Atlas

## Configuracion

1. Copia `.env.example` a `.env.local`
2. Configura `MONGODB_URI`
3. Instala dependencias:

```bash
npm install
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

## Endpoints

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id`
- `DELETE /api/tickets/:id`
- `PATCH /api/tickets/:id/status`

## Reglas implementadas

- Historial automatico en cambios de `mainStatus` (POST inicial, PUT y PATCH)
- Labels dinamicos y multiples
- Checklist editable
- Logica derivada:
  - `isComplete`
  - `progress`
  - `isInconsistent` (`DONE` incompleto)

## Estructura

- `src/models`: esquemas de Mongoose
- `src/lib`: conexion DB y logica de dominio
- `src/app/api`: rutas API
- `src/components`: componentes UI reutilizables
- `src/app`: paginas App Router
