# HyperHub - Tu Espacio Seguro

> Una red social disenada desde cero para personas con TDAH. No es otra red social adaptada -- es la primera construida entendiendo como funciona tu cerebro.

## Valores y Principios

- **Seguridad Primero**: Espacios seguros para la neurodivergencia
- **Sin Sobrecarga**: Interfaz limpia, sin ruido visual, respetuosa con tu bateria social
- **Tu Ritmo**: Sin algoritmos de engagement adictivo. Tu decides cuando y como interactuar
- **Accesibilidad Sensorial**: Preferencias visuales, de lectura y de notificaciones personalizables
- **Comunidad, No Competencia**: Sin likes publicos, sin metricas de vanidad

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL + Prisma 6 |
| Cache/Queues | Redis |
| Realtime | Socket.io (preparado) |
| Infra Dev | Docker Compose |

## Estructura del Monorepo

```
hyperhub/
├── apps/
│   └── web/              # Next.js 15 app principal
├── packages/
│   ├── db/               # Prisma schema, client y seeds
│   ├── shared/           # Tipos, constantes y utilidades compartidas
│   └── ui/               # Componentes UI compartidos
└── tooling/
    └── typescript/       # Configuracion TypeScript base
```

## Prerequisitos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.15.0
- **Docker** y **Docker Compose**

## Setup Rapido

```bash
# 1. Clonar el repositorio
git clone https://github.com/vanesarossi61/HyperHub.git
cd HyperHub

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Setup completo (Docker + dependencias + base de datos)
make setup

# 4. Configurar tus claves de Clerk en .env
# Obtener claves en https://dashboard.clerk.com

# 5. Iniciar el servidor de desarrollo
make dev
```

La app estara disponible en [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

| Comando | Descripcion |
|---------|------------|
| `make dev` | Inicia el servidor de desarrollo |
| `make build` | Build de produccion |
| `make lint` | Ejecuta ESLint en todos los paquetes |
| `make format` | Formatea el codigo con Prettier |
| `make db-push` | Sincroniza el schema Prisma con la DB |
| `make db-seed` | Ejecuta los seeds de la DB |
| `make db-studio` | Abre Prisma Studio |
| `make docker-up` | Inicia PostgreSQL y Redis |
| `make docker-down` | Detiene los servicios Docker |
| `make clean` | Limpia artifacts y node_modules |
| `make setup` | Setup completo desde cero |

## Contribucion

1. Crea un branch desde `main`: `git checkout -b feat/tu-feature`
2. Haz commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
3. Asegurate de que pase `make lint` y `make build`
4. Abre un Pull Request con descripcion detallada

## Licencia

MIT License - Ver [LICENSE](LICENSE) para mas detalles.
