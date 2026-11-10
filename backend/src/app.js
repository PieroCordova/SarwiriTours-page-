// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, '../../')));

// Rutas de la API REST
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/reservas', require('./routes/reservas'));

// Manejo de rutas API no encontradas
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Middleware central de errores
app.use(require('./middlewares/errores'));

module.exports = app;
