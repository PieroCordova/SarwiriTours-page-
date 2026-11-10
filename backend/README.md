# Sarwiri Tours - Backend API REST

Proyecto desarrollado para la **Entrega N° 2 – Desarrollo Back End** de la asignatura **Tecnologías Web**, Universidad de Tarapacá.

## Descripción del Proyecto

El Backend de **Sarwiri Tours** implementa la lógica de negocio y persistencia de datos mediante una API REST en Node.js y Express con base de datos relacional MySQL. Da soporte a las Historias de Usuario:
- **HU08**: Registro e inicio de sesión con token JWT y contraseñas cifradas con bcrypt.
- **HU09**: Reserva de un tour en línea con cálculo automático de totales y validación de cupos por fecha.
- **HU10**: Gestión del catálogo de tours (CRUD) y administración de estados de reserva para administradores.
- **HU01 - HU04**: Conexión de catálogo, búsqueda por palabra clave, filtrado por capacidad y cupos disponibles.

---

## Estructura del Proyecto

```text
backend/
├── src/
│   ├── server.js               # Punto de entrada y arranque del servidor
│   ├── app.js                  # Configuración de Express, middlewares y rutas
│   ├── initDb.js               # Script utilitario para crear la BD y cargar el esquema
│   ├── probarCasos.js          # Script automatizado con los 14 casos de prueba
│   ├── config/
│   │   └── db.js               # Conexión y Pool de MySQL (mysql2/promise)
│   ├── routes/
│   │   ├── auth.js             # Rutas /api/auth (registro, login)
│   │   ├── tours.js            # Rutas /api/tours (catálogo, filtros, CRUD)
│   │   └── reservas.js         # Rutas /api/reservas (crear, mis reservas, admin)
│   ├── controllers/
│   │   ├── authController.js   # Lógica de registro, login y tokens JWT
│   │   ├── toursController.js  # Lógica de consulta, cupos y administración de tours
│   │   └── reservasController.js # Lógica de reservas, validaciones y estados
│   └── middlewares/
│       ├── auth.js             # verificarToken y soloAdmin
│       └── errores.js          # Manejador central de errores HTTP
├── sql/
│   └── schema.sql              # Creación de tablas MySQL y datos iniciales
├── insomnia_collection.json    # Colección lista para importar en Insomnia
├── .env                        # Variables de entorno locales
├── .env.example                # Plantilla de variables de entorno
├── package.json                # Dependencias y scripts de ejecución
└── README.md                   # Documentación e instrucciones
```

---

## Requisitos Previos

- **Node.js** (v18 o superior) y **npm**.
- **MySQL Server** (v8.0 o compatible) en ejecución.

---

## Instrucciones de Instalación y Puesta en Marcha

### 1. Instalar dependencias
Desde la terminal, situarse en la carpeta `backend` e instalar los paquetes:
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno (`.env`)
Copie el archivo `.env.example` como `.env` (si no existe) y configure sus credenciales de MySQL:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=sarwiri_tours
DB_PORT=3306
JWT_SECRET=sarwiri_secret_key_2026_jwt_token
JWT_EXPIRES_IN=24h
```

### 3. Ejecutar el script de base de datos (`schema.sql`)
Puede inicializar la base de datos automáticamente ejecutando el script integrado:
```bash
npm run init-db
```
*O si prefiere hacerlo manualmente desde MySQL Workbench o consola:*
```bash
mysql -u root -p < sql/schema.sql
```

### 4. Iniciar el servidor
- **Modo Desarrollo** (con reinicio automático al guardar cambios mediante nodemon):
  ```bash
  npm run dev
  ```
- **Modo Producción**:
  ```bash
  npm start
  ```
El servidor quedará escuchando en: `http://localhost:3000`

---

## Usuarios de Prueba Iniciales (Cargados en schema.sql)

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@sarwiri.cl` | `admin123` |
| **Visitante** | `visitante@correo.cl` | `clave123` |

---

## Endpoints de la API REST

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Registra un visitante con nombre, correo y contraseña | Público |
| `POST` | `/api/auth/login` | Valida credenciales y entrega token JWT | Público |

### Tours (`/api/tours`)
| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tours` | Lista los tours; admite filtros query `?q=` y `?personas=` | Público |
| `GET` | `/api/tours/:id` | Detalle completo de un tour | Público |
| `GET` | `/api/tours/:id/disponibilidad?fecha=YYYY-MM-DD` | Consulta cupos disponibles por fecha | Público |
| `POST` | `/api/tours` | Crea un nuevo tour | Administrador |
| `PUT` | `/api/tours/:id` | Modifica un tour existente | Administrador |
| `DELETE` | `/api/tours/:id` | Elimina un tour | Administrador |

### Reservas (`/api/reservas`)
| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reservas` | Registra una reserva calculando el total y validando cupos | Usuario autenticado |
| `GET` | `/api/reservas/mias` | Lista las reservas del usuario en sesión | Usuario autenticado |
| `GET` | `/api/reservas` | Lista todas las reservas del sistema | Administrador |
| `PATCH` | `/api/reservas/:id/estado` | Cambia el estado de una reserva (`pendiente`, `confirmada`, `cancelada`) | Administrador |

---

## Verificación de Casos de Prueba (Tabla 5 del Informe)

Para verificar los 14 casos de prueba descritos en el informe, ejecute:
```bash
npm test
```

### Pruebas con Insomnia
1. Abra **Insomnia**.
2. Vaya a **Application** -> **Preferences / Data** -> **Import Data** -> **From File**.
3. Seleccione el archivo `backend/insomnia_collection.json`.
4. La colección «Sarwiri Tours API» quedará configurada con todas las peticiones organizadas en carpetas, tokens de prueba y variables de entorno.
