# Sarwiri Tours - Sistema Web de Reservas Turísticas

Proyecto integral desarrollado para la asignatura **Tecnologías Web**, Universidad de Tarapacá.  
Comprende el sitio web público responsivo (**Entrega 1 – Front End**) y la API REST con base de datos relacional MySQL (**Entrega 2 – Back End**).

---

## 📌 Resumen de lo Realizado

### 1. Front End y Experiencia de Usuario
- **Páginas desarrolladas y estilizadas**:
  - `index.html`: Portada con imagen hero de Iquique, buscador dinámico con filtros por palabra clave y cantidad de personas, y catálogo de tarjetas de tours cargadas dinámicamente.
  - `tour.html`: Ficha de detalle de cada tour con imagen representativa, descripción, precio por persona, duración y selector de fecha con comprobación de cupos en tiempo real contra MySQL.
  - `reserva.html`: Formulario de reserva con validaciones de campos (nombre, correo, teléfono) y cálculo de total.
  - `confirmacion.html`: Vista de confirmación con resumen de la reserva realizada.
  - `destinos.html`: Galería con los 6 destinos turísticos emblemáticos de Tarapacá y sus descripciones patrimoniales.
  - `contacto.html`: Información de atención de la agencia, horarios y enlace directo a WhatsApp.
- **Diseño Responsivo y Estilos**:
  - Implementación con **Bootstrap 5.3** y hoja de estilos personalizada `styles.css`.
  - Paleta de colores cálidos acordes al desierto y costa de Tarapacá (naranjo `#e8710a`, amarillo `#f2b705`).
- **Integración con JavaScript (`main.js`)**:
  - Conexión asíncrona (`fetch`) con la API REST (`http://localhost:3000/api`).
  - Modo **fallback automático**: si el servidor backend o la base de datos no están activos, el catálogo y las páginas continúan funcionando fluidamente con datos locales.
  - Manejo de autenticación automática con token JWT en `localStorage`.

---

### 2. Back End y API REST (Node.js + Express + MySQL)
- **Servidor HTTP y Middlewares**:
  - `src/server.js`: Punto de arranque en puerto configurable (3000 por defecto).
  - `src/app.js`: Configuración de Express, CORS, parseo de JSON, servicio de estáticos (HTML, CSS, JS, imágenes) y middleware centralizado de errores.
  - Carga tolerante de entorno (`dotenv`) con resolución de ruta absoluta, permitiendo iniciar scripts tanto desde la carpeta raíz como desde `backend/`.
- **Base de Datos Relacional (`sarwiri_tours`)**:
  - Esquema MySQL (`backend/sql/schema.sql`) estructurado en 3 tablas:
    - `usuarios`: Administradores y visitantes con contraseñas cifradas.
    - `tours`: Nombre, categoría, duración, precio, capacidad máxima, imagen y descripción.
    - `reservas`: Vínculo entre usuario y tour, fecha, personas, total, datos de contacto y estado (`pendiente`, `confirmada`, `cancelada`).
  - Script de inicialización automatizada: `npm run init-db` (o `node backend/src/initDb.js`).
- **Seguridad**:
  - Cifrado unidireccional de contraseñas mediante **`bcryptjs`** (salt de 10 rondas).
  - Autenticación mediante **JSON Web Tokens (JWT)** con middleware `verificarToken` y control de acceso basado en roles con `soloAdmin`.
- **Rutas y Endpoints**:
  - `POST /api/auth/registro` y `POST /api/auth/login`.
  - `GET /api/tours` (con soporte para `?q=` y `?personas=`).
  - `GET /api/tours/:id` y `GET /api/tours/:id/disponibilidad?fecha=YYYY-MM-DD`.
  - `POST`, `PUT` y `DELETE /api/tours` (exclusivo administradores).
  - `POST /api/reservas` (con validación de fecha futura, capacidad máxima y cálculo automático de total).
  - `GET /api/reservas/mias` y administración con `PATCH /api/reservas/:id/estado`.

---

### 3. Integración de Imágenes Reales (`img/`)
Se asignaron e integraron todas las imágenes de la carpeta `img/` tanto en el Front End como en el Back End:

| Archivo | Asignación en el Proyecto | Ubicación / Uso |
| :--- | :--- | :--- |
| **`cerrodragoniqq.jpg`** | Tour 1: *Sandboard en Cerro Dragón* | Catálogo, vista de detalle y tarjeta en `destinos.html`. |
| **`Humberstoneiqq.jpg`** | Tour 2: *Oficina Salitrera Humberstone* | Catálogo, vista de detalle y tarjeta en `destinos.html`. |
| **`parapenteiqq.jpg`** | Tour 3: *Parapente en Alto Hospicio* | Catálogo, vista de detalle y tarjeta en `destinos.html`. |
| **`picaiqq.jpg`** | Tour 4: *Oasis de Pica y Matilla* | Catálogo, vista de detalle y tarjeta en `destinos.html`. |
| **`baquedanoiqq.jpg`** | Tour 5: *City Tour Histórico de Iquique* | Catálogo, detalle y tarjeta Paseo Baquedano en `destinos.html`. |
| **`kayakiqq.jpg`** | Tour 6: *Kayak en Playa Cavancha* | Catálogo, detalle y tarjeta Playa Cavancha en `destinos.html`. |
| **`skyviewiqq.jpg`** | Portada Principal (*Sky View* de Iquique) | Imagen hero panorámica de fondo en `index.html`. |
| **`iqq.jpg`** | Imagen de Ciudad de Iquique | Fotografía ilustrativa en `contacto.html`. |

> **Compatibilidad retroactiva**: Además de referenciar los nombres reales, se generaron copias alias (`tour1.jpg` a `tour6.jpg`, `portada.jpg`, `contacto.jpg`, `destino1.jpg` a `destino6.jpg`) para asegurar que si existen datos previos en la base de datos o en la caché del navegador, ninguna imagen falle al cargarse.

---

### 4. Pruebas y Validación
- **14 casos de prueba automatizados** en `backend/src/probarCasos.js` (`npm test`) que validan:
  1. Registro con datos válidos (código 201 y contraseña omitida en la respuesta).
  2. Registro con correo duplicado (código 409).
  3. Login exitoso de administrador y visitante (código 200 y entrega de token JWT).
  4. Login con contraseña incorrecta (código 401).
  5. Búsqueda por palabra clave en tours (código 200).
  6. Filtrado por cantidad de personas (código 200).
  7. Consulta de tour inexistente (código 404).
  8. Creación de reserva con token (código 201 y total calculado).
  9. Intento de reserva sin token (código 401).
  10. Intento de reserva que supera la capacidad máxima (código 400).
  11. Intento de reserva con fecha en el pasado (código 400).
  12. Intento de crear tour por parte de un visitante (código 403).
  13. Ciclo completo de administración (crear, modificar y eliminar tour con token admin).
  14. Consulta de cupos disponibles por fecha (código 200).
- **Colección para Insomnia**: archivo `backend/insomnia_collection.json` listo para importar, con todas las solicitudes organizadas en carpetas, variables de entorno y tokens de prueba.

---

## 📂 Estructura de Archivos

```text
Proyecto-Tecnologia-Web/
├── img/                               # Fotografías reales de los tours y destinos
│   ├── baquedanoiqq.jpg
│   ├── cerrodragoniqq.jpg
│   ├── Humberstoneiqq.jpg
│   ├── iqq.jpg
│   ├── kayakiqq.jpg
│   ├── parapenteiqq.jpg
│   ├── picaiqq.jpg
│   └── skyviewiqq.jpg
├── index.html                         # Página principal con catálogo y buscador
├── tour.html                          # Detalle y verificación de cupos
├── reserva.html                       # Formulario de reserva
├── confirmacion.html                  # Confirmación de reserva
├── destinos.html                      # Destinos turísticos de la región
├── contacto.html                      # Datos de contacto y WhatsApp
├── styles.css                         # Hoja de estilos del proyecto
├── main.js                            # Lógica frontend y conexión a la API
├── README.md                          # Este archivo de documentación general
└── backend/                           # API REST y persistencia MySQL
    ├── package.json                   # Dependencias y scripts
    ├── .env                           # Variables de entorno locales
    ├── .env.example                   # Plantilla de variables de entorno
    ├── insomnia_collection.json       # Colección exportada de Insomnia
    ├── README.md                      # Documentación técnica específica del backend
    ├── sql/
    │   └── schema.sql                 # Esquema MySQL y datos semilla
    └── src/
        ├── server.js                  # Inicialización del servidor HTTP
        ├── app.js                     # Configuración de Express y middlewares
        ├── initDb.js                  # Script para crear y poblar la BD
        ├── probarCasos.js             # Verificación de los 14 casos de prueba
        ├── config/
        │   └── db.js                  # Pool de conexiones MySQL
        ├── controllers/
        │   ├── authController.js      # Lógica de autenticación
        │   ├── toursController.js     # Lógica de tours y cupos
        │   └── reservasController.js  # Lógica de reservas
        ├── middlewares/
        │   ├── auth.js                # Middlewares JWT y control de roles
        │   └── errores.js             # Middleware de errores
        └── routes/
            ├── auth.js                # Endpoints de autenticación
            ├── tours.js               # Endpoints de tours
            └── reservas.js            # Endpoints de reservas
```

---

## 🚀 Guía de Puesta en Marcha

### Requisitos Previos
- **Node.js** (v18 o superior) y **npm**.
- **MySQL Server** (XAMPP, WampServer o servicio local) iniciado en el puerto 3306.

---

### Paso a Paso

#### 1. Instalar dependencias del backend
Abre una terminal en la carpeta `backend`:
```bash
cd backend
npm install
```

#### 2. Configurar la conexión a MySQL
Verifica que las credenciales del archivo `backend/.env` coincidan con tu MySQL local:
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
*(Si usas XAMPP con usuario `root` y sin contraseña, deja `DB_PASSWORD=` vacío).*

#### 3. Inicializar la base de datos
Ejecuta el script integrado para crear la base de datos `sarwiri_tours`, sus tablas y los tours iniciales:
```bash
npm run init-db
```

#### 4. Iniciar el servidor
- En modo desarrollo (con recarga automática):
  ```bash
  npm run dev
  ```
- O en modo normal:
  ```bash
  npm start
  ```
El backend quedará escuchando en `http://localhost:3000` y servirá de inmediato tanto la API REST como las páginas web del frontend.

#### 5. Abrir la aplicación en el navegador
Puedes acceder directamente a:
```
http://localhost:3000/index.html
```
*(O también puedes abrir directamente `index.html` con Live Server o doble clic, ya que `main.js` se conecta al backend vía CORS o usa el fallback local).*

---

## 👥 Usuarios de Prueba Precargados

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@sarwiri.cl` | `admin123` | Acceso total: CRUD de tours, gestión de reservas |
| **Visitante** | `visitante@correo.cl` | `clave123` | Consultar catálogo, verificar cupos, crear reservas |

---

## 🧪 Ejecución de Pruebas

Para validar los 14 casos de prueba de la API REST de forma automática:
```bash
cd backend
npm test
```
Para realizar pruebas manuales mediante interfaz gráfica, importa el archivo `backend/insomnia_collection.json` en **Insomnia**.

