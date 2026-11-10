// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

// Valida el token JWT enviado en la cabecera Authorization y obtiene al usuario
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso no autorizado: token no proporcionado' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Debe ser: Bearer <token>' });
  }

  const token = partes[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sarwiri_secret_key_2026_jwt_token');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Restringe el acceso a rutas exclusivamente para usuarios con rol 'admin'
const soloAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  }

  next();
};

module.exports = {
  verificarToken,
  soloAdmin
};
