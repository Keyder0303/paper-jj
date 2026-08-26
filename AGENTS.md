# AGENTS.md — Contexto del Proyecto Paper Puente

> Sistema derivado y optimizado para comunicación centralizada, CRM, difusión y puente operativo.

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript Vanilla.
- **Backend / Puente Local**: Node.js (`wa-server/`) + Baileys + Express.
- **Base de Datos**: Supabase (PostgreSQL + Realtime + Storage).

## Estructura
```
.
├── admin/                  # Panel de administración, CRM y campañas
├── assets/                 # Estilos, scripts y librerías
├── vendedor/               # Módulo de ventas, POS y cotizaciones
└── wa-server/              # Motor de WhatsApp, correo, difusión y pasarela
```
