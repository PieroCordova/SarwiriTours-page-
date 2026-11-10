// src/routes/reservas.js
const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

// Rutas de usuario autenticado
router.post('/', verificarToken, reservasController.crearReserva);
router.get('/mias', verificarToken, reservasController.obtenerMisReservas);

// Rutas de administrador
router.get('/', verificarToken, soloAdmin, reservasController.listarTodasReservas);
router.patch('/:id/estado', verificarToken, soloAdmin, reservasController.actualizarEstadoReserva);

module.exports = router;
