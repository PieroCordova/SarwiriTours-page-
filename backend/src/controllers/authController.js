// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/registro - Registra un visitante
const registro = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const correoLimpio = String(correo).trim().toLowerCase();

    // Validar formato de correo básico
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correoLimpio)) {
      return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
    }

    if (String(contrasena).length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
    }

    // Verificar si el correo ya existe
    const [usuariosExistentes] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correoLimpio]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Cifrar contraseña con bcrypt
    const saltRounds = 10;
    const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

    // Insertar nuevo usuario con rol por defecto 'visitante'
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre.trim(), correoLimpio, contrasenaHash, 'visitante']
    );

    // Responder con código 201 y datos de usuario sin la contraseña
    return res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: {
        id: resultado.insertId,
        nombre: nombre.trim(),
        correo: correoLimpio,
        rol: 'visitante'
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login - Valida credenciales y entrega token JWT
const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Debe ingresar correo y contraseña' });
    }

    const correoLimpio = String(correo).trim().toLowerCase();

    // Buscar usuario por correo
    const [usuarios] = await db.query(
      'SELECT id, nombre, correo, contrasena, rol FROM usuarios WHERE correo = ?',
      [correoLimpio]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña con bcrypt
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT con payload seguro
    const secret = process.env.JWT_SECRET || 'sarwiri_secret_key_2026_jwt_token';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      },
      secret,
      { expiresIn }
    );

    // Responder con código 200, token y datos de usuario (sin password)
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registro,
  login
};
