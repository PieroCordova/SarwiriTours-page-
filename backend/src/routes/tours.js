// src/routes/tours.js
const express = require('express');
const router = express.Router();
const toursController = require('../controllers/toursController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

// Rutas públicas
router.get('/', toursController.listarTours);
router.get('/:id/disponibilidad', toursController.obtenerDisponibilidad);
router.get('/:id', toursController.obtenerTourPorId);

// Rutas de administración (requieren rol admin)
router.post('/', verificarToken, soloAdmin, toursController.crearTour);
router.put('/:id', verificarToken, soloAdmin, toursController.actualizarTour);
router.delete('/:id', verificarToken, soloAdmin, toursController.eliminarTour);

module.exports = router;
