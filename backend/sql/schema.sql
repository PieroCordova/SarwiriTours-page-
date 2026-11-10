-- ========================================================
-- Gestor de Reservas de Turismo: Sarwiri Tours
-- Entrega N° 2 – Desarrollo Back End
-- Base de datos: MySQL
-- ========================================================

CREATE DATABASE IF NOT EXISTS sarwiri_tours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sarwiri_tours;

-- --------------------------------------------------------
-- Tabla: usuarios
-- --------------------------------------------------------
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('visitante', 'admin') DEFAULT 'visitante',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Tabla: tours
-- --------------------------------------------------------
CREATE TABLE tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  duracion VARCHAR(50) NOT NULL,
  precio INT NOT NULL,
  max_personas INT NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL
);

-- --------------------------------------------------------
-- Tabla: reservas
-- --------------------------------------------------------
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tour_id INT NOT NULL,
  fecha DATE NOT NULL,
  personas INT NOT NULL,
  total INT NOT NULL,
  nombre_contacto VARCHAR(100) NOT NULL,
  correo_contacto VARCHAR(100) NOT NULL,
  telefono_contacto VARCHAR(20),
  estado ENUM('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- ========================================================
-- Datos Iniciales (Seed Data)
-- ========================================================

-- 1. Usuarios de prueba
-- Contraseña para admin@sarwiri.cl: admin123
-- Contraseña para visitante@correo.cl: clave123
INSERT INTO usuarios (id, nombre, correo, contrasena, rol) VALUES
(1, 'Administrador Sarwiri', 'admin@sarwiri.cl', '$2a$10$qEBI/suHZNRhoX6fTe4POe0omlbCIrvredjJ3mhPJeTs4Nk5gGhyi', 'admin'),
(2, 'Ana Pérez', 'visitante@correo.cl', '$2a$10$YzTMA5Qxs/0Pg/PYZcWVKO2.RsveDWmG5/05xXz5bz4GsRPhznim.', 'visitante');

-- 2. Tours iniciales (de la Entrega 1)
INSERT INTO tours (id, nombre, categoria, duracion, precio, max_personas, imagen, descripcion) VALUES
(1, 'Sandboard en Cerro Dragón', 'Aventura', '3 horas', 25000, 10, 'img/cerrodragoniqq.jpg', 'Desliza por las dunas del Cerro Dragón con vista a la ciudad y al mar. Incluye tabla e instructor.'),
(2, 'Oficina Salitrera Humberstone', 'Cultura', '5 horas', 30000, 15, 'img/Humberstoneiqq.jpg', 'Recorre el antiguo pueblo salitrero, Patrimonio de la Humanidad, y conoce la historia del salitre.'),
(3, 'Parapente en Alto Hospicio', 'Aventura', '2 horas', 60000, 4, 'img/parapenteiqq.jpg', 'Vuela sobre la costa de Iquique en un vuelo tándem acompañado de un piloto profesional.'),
(4, 'Oasis de Pica y Matilla', 'Cultura', '8 horas', 40000, 12, 'img/picaiqq.jpg', 'Visita el oasis de Pica, sus piscinas naturales y el pueblo de Matilla. Prueba los frutos de la zona.'),
(5, 'City Tour Histórico de Iquique', 'Cultura', '3 horas', 15000, 20, 'img/baquedanoiqq.jpg', 'Paseo por la Plaza Prat, el Teatro Municipal, la calle Baquedano y los edificios históricos.'),
(6, 'Kayak en Playa Cavancha', 'Aventura', '2 horas', 20000, 8, 'img/kayakiqq.jpg', 'Navega por la costa de Iquique en kayak y observa lobos marinos y aves.');
