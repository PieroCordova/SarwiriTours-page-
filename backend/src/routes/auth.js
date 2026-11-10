// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas públicas de autenticación
router.post('/registro', authController.registro);
router.post('/login', authController.login);

module.exports = router;
