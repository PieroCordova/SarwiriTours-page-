// src/middlewares/errores.js
module.exports = (err, req, res, next) => {
  console.error('Error capturado por middleware central:', err);

  const status = err.statusCode || err.status || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: mensaje
  });
};
