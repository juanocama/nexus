# Nexus - Carpooling Universitario

Aplicación de carpooling para la Universidad de La Sabana. Conecta estudiantes que comparten trayectos de forma segura y eficiente.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | NestJS + TypeORM + PostgreSQL |
| **Frontend** | React Native + Expo |
| **Autenticación** | JWT + Microsoft OAuth (pendiente) |
| **Base de datos** | PostgreSQL 16 |

## Estructura del Proyecto

```
├── api/                 # Backend NestJS
│   ├── src/
│   │   ├── modules/     # Módulos: auth, trips, bookings, etc.
│   │   └── config/      # Configuración de base de datos
│   └── .env.example     # Variables de entorno de ejemplo
├── app/                 # Frontend React Native/Expo
│   ├── app/             # Pantallas (expo-router)
│   └── src/             # Componentes, contexto, API client
├── database/
│   └── schema.sql       # Esquema completo de la base de datos
└── README.md
```

## Requisitos Previos

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** >= 9.x
- Para ejecutar la app móvil: **Expo Go** en tu dispositivo o un emulador

## Instalación y Configuración

### 1. Backend (API)

```bash
# Entrar al directorio del API
cd api

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env

# Crear la base de datos (en PostgreSQL)
psql -U postgres -c "CREATE DATABASE nexus;"

# Ejecutar el esquema
psql -U postgres -d nexus -f ../database/schema.sql

# Iniciar el servidor en modo desarrollo
npm run start:dev
```

El API estará disponible en `http://localhost:3000/api/v1`

### 2. Frontend (App)

```bash
# Entrar al directorio de la app
cd app

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start
```

**Opciones para ejecutar:**
- Presiona `i` para abrir en iOS Simulator
- Presiona `a` para abrir en Android Emulator
- Escanea el QR con **Expo Go** en tu dispositivo físico

### 3. Configurar la URL del API

En `app/src/utils/config.ts`, cambia `BASE_URL` para que apunte a tu IP local:

```typescript
API: {
  BASE_URL: __DEV__
    ? 'http://192.168.1.X:3000/api/v1'  // ← Reemplaza con tu IP real
    : 'https://api.nexus.unisabana.edu.co/api/v1',
},
```

Para encontrar tu IP:
- **Windows:** `ipconfig` (busca "IPv4")
- **Mac/Linux:** `ifconfig` o `ip addr`

## Comandos Útiles

### Backend
```bash
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Compilar para producción
npm run start:prod     # Ejecutar en producción
npm run lint           # Verificar código
```

### Frontend
```bash
npx expo start         # Iniciar servidor de desarrollo
npx expo start --web   # Abrir en navegador web
npx expo prebuild      # Generar proyectos nativos
```

## Endpoints del API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro con email institucional |
| POST | `/auth/login` | Login con JWT |
| POST | `/auth/microsoft` | Login con Microsoft OAuth |
| GET | `/trips` | Listar viajes disponibles |
| POST | `/trips` | Crear un viaje |
| GET | `/trips/:id` | Detalle de un viaje |
| POST | `/bookings` | Reservar asiento |
| GET | `/bookings` | Mis reservas |
| POST | `/payments` | Agregar método de pago |
| POST | `/reviews` | Calificar viaje |
| GET | `/notifications` | Notificaciones del usuario |

## Estado Actual

- [x] Backend completo con todos los módulos
- [x] Esquema de base de datos
- [x] Pantallas del frontend (UI)
- [x] Autenticación JWT integrada
- [x] Registro funcional con validación de dominio institucional
- [ ] Conexión de pantallas con endpoints reales (datos mock actualmente)
- [ ] Microsoft OAuth (pendiente registro en Azure AD)
