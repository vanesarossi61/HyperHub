# HyperHub - Tu Espacio Seguro

> Una red social disenada desde cero para personas con TDAH. No es otra red social adaptada -- es la primera construida entendiendo como funciona tu cerebro.

## Valores y Principios

- **Seguridad Primero**: Espacios seguros para la neurodivergencia
- **Sin Sobrecarga**: Interfaz limpia, sin ruido visual, respetuosa con tu bateria social
- **Tu Ritmo**: Sin algoritmos de engagement adictivo. Tu decides cuando y como interactuar
- **Accesibilidad Sensorial**: Preferencias visuales, de lectura y de notificaciones personalizables
- **Comunidad, No Competencia**: Sin likes publicos, sin metricas de vanidad

## Roadmap del Proyecto

| Fase | Nombre | Estado | Descripcion |
|------|--------|--------|-------------|
| 1 | Infraestructura | COMPLETA | Monorepo Turborepo, Clerk auth, Prisma schema, Docker Compose, configs |
| 2 | Usuarios y Arquitectura Sensorial | COMPLETA | Onboarding 4 pasos, perfiles neurodivergentes, bateria social, preferencias sensoriales |
| 3 | Feed y Sistema de Contenido | COMPLETA | Posts con tone tags, reacciones neurodivergentes, lectura bionica, anti-rabbit hole, bookmarks |
| 4 | Comunicacion y Mensajeria | COMPLETA | Chat 1:1 y grupal, safe exit, cola de mensajes por bateria, notificaciones adaptativas, tone tags obligatorios |
| 5 | Radar de Hiperfocos | PENDIENTE | Matching por intereses, debates flash, descubrimiento de hiperfocos |
| 6 | Baul de Proyectos Abandonados | PENDIENTE | Hiperfoco Relay, rescate de proyectos, colaboracion |

## Features Implementadas

### Bateria Social
Sistema unico que adapta toda la experiencia segun tu nivel de energia:
- **Verde**: Interaccion completa, notificaciones normales
- **Amarillo**: Mensajes demorados, interacciones breves
- **Rojo**: Mensajes en cola, modo observador
- **Fantasma**: Invisible, sin notificaciones, recarga total

### Preferencias Sensoriales
- 4 presets predefinidos (Calma Total, Modo Foco, Alta Energia, Ultra Minimal)
- Control granular de animaciones, densidad, contraste, fuentes
- Lectura bionica y fuente para dislexia
- Notificaciones adaptadas a sensibilidad

### Feed Neurodivergente
- Tone tags obligatorios en cada post (Entusiasmo, Rant, Debate, Info Dump, Pregunta, Ayuda)
- 7 reacciones disenadas para la comunidad (Same Here, Brain Explode, Hiperfoco, Spoon Gift, etc.)
- Anti-Rabbit Hole: nudges suaves para evitar scrolleo compulsivo
- Lectura bionica y resumenes TL;DR

### Mensajeria Segura (Fase 4)
- Chat 1:1, grupal (hasta 8) y Safe Spaces moderados
- **Safe Exit**: Boton para pausar conversaciones sin culpa ni explicaciones
- Cola de mensajes adaptada a bateria (RED = cola, LURKER = silencio)
- Slow mode configurable en safe spaces
- Notificaciones con prioridad por nivel de bateria
- Quiet hours y modo digest

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL + Prisma 6 |
| Cache/Queues | Redis (ioredis) |
| Realtime | Socket.io (preparado) |
| API | REST + tRPC |
| Infra Dev | Docker Compose |

## Estructura del Monorepo

```
hyperhub/
├── apps/
│   └── web/                    # Next.js 15 app principal
│       └── src/
│           ├── app/            # App Router pages y API routes
│           │   ├── (auth)/     # Sign-in, sign-up, webhooks Clerk
│           │   ├── api/        # REST endpoints (profile, battery, sensory, posts)
│           │   ├── feed/       # Feed page
│           │   └── messages/   # Mensajeria page
│           ├── components/     # React components
│           │   ├── layout/     # Navbar, Sidebar, BatteryIndicator
│           │   ├── onboarding/ # 4-step onboarding flow
│           │   ├── feed/       # PostCard, PostComposer, FeedFilters, etc.
│           │   └── chat/       # ConversationList, ChatWindow, MessageComposer
│           ├── hooks/          # Custom React hooks
│           ├── lib/            # Utilities (prisma, redis, bionic, dopamine)
│           └── types/          # App-level type re-exports
├── packages/
│   ├── db/                     # Prisma schema, client, seeds
│   ├── shared/                 # Tipos, constantes, utilidades compartidas
│   └── ui/                     # Componentes UI compartidos
└── tooling/
    └── typescript/             # Configuracion TypeScript base
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
