// src/controllers/reservasController.js
const db = require('../config/db');

// Función auxiliar para obtener la fecha de hoy en formato AAAA-MM-DD (hora local)
const obtenerFechaHoy = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

// POST /api/reservas - Crea una nueva reserva (Usuario autenticado)
const crearReserva = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const {
      tourId,
      tour_id,
      fecha,
      personas,
      nombre,
      nombre_contacto,
      correo,
      correo_contacto,
      telefono,
      telefono_contacto
    } = req.body;

    const idTour = tourId || tour_id;
    const nombreFinal = (nombre || nombre_contacto || req.usuario.nombre || '').trim();
    const correoFinal = (correo || correo_contacto || req.usuario.correo || '').trim().toLowerCase();
    const telefonoFinal = (telefono || telefono_contacto || '').trim();

    // 1. Validar campos obligatorios
    if (!idTour || !fecha || !personas || !nombreFinal || !correoFinal) {
      return res.status(400).json({
        error: 'Los campos tourId, fecha, personas, nombre y correo son obligatorios'
      });
    }

    const numPersonas = Number(personas);
    if (isNaN(numPersonas) || numPersonas < 1) {
      return res.status(400).json({ error: 'La cantidad de personas debe ser un número entero mayor o igual a 1' });
    }

    // 2. Validar que la fecha no sea anterior a hoy
    const hoyStr = obtenerFechaHoy();
    if (fecha < hoyStr) {
      return res.status(400).json({
        error: 'La fecha de la reserva no puede ser anterior a hoy'
      });
    }

    // 3. Consultar y verificar el tour
    const [tours] = await db.query('SELECT * FROM tours WHERE id = ?', [idTour]);
    if (tours.length === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    const tour = tours[0];

    // 4. Validar cantidad de personas contra el máximo del tour
    if (numPersonas > tour.max_personas) {
      return res.status(400).json({
        error: `La cantidad de personas no puede superar el máximo permitido para este tour (${tour.max_personas} personas)`
      });
    }

    // 5. Control de cupos disponibles en la fecha seleccionada
    const [resultadoReservas] = await db.query(
      "SELECT COALESCE(SUM(personas), 0) AS total_reservadas FROM reservas WHERE tour_id = ? AND fecha = ? AND estado != 'cancelada'",
      [idTour, fecha]
    );

    const personasReservadas = Number(resultadoReservas[0].total_reservadas);
    const cuposDisponibles = tour.max_personas - personasReservadas;

    if (numPersonas > cuposDisponibles) {
      return res.status(409).json({
        error: `No hay cupos suficientes para la fecha seleccionada. Cupos disponibles: ${cuposDisponibles}`
      });
    }

    // 6. Cálculo del total en el servidor (precio por persona * personas)
    const total = tour.precio * numPersonas;

    // 7. Insertar reserva en la base de datos con estado 'pendiente'
    const [resultado] = await db.query(
      `INSERT INTO reservas 
       (usuario_id, tour_id, fecha, personas, total, nombre_contacto, correo_contacto, telefono_contacto, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [usuarioId, idTour, fecha, numPersonas, total, nombreFinal, correoFinal, telefonoFinal]
    );

    // 8. Responder con código 201 Created y estructura idéntica a la especificación
    return res.status(201).json({
      id: resultado.insertId,
      estado: 'pendiente',
      tour: tour.nombre,
      fecha: fecha,
      personas: numPersonas,
      total: total
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reservas/mias - Lista las reservas del usuario autenticado
const obtenerMisReservas = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    const [reservas] = await db.query(
      `SELECT r.id, r.fecha, r.personas, r.total, r.estado, r.creado_en,
              r.nombre_contacto, r.correo_contacto, r.telefono_contacto,
              t.id AS tour_id, t.nombre AS tour, t.precio AS precio_unitario, t.imagen AS imagen_tour, t.duracion
       FROM reservas r
       JOIN tours t ON r.tour_id = t.id
       WHERE r.usuario_id = ?
       ORDER BY r.creado_en DESC`,
      [usuarioId]
    );

    return res.status(200).json(reservas);
  } catch (error) {
    next(error);
  }
};

// GET /api/reservas - Lista todas las reservas (solo admin)
const listarTodasReservas = async (req, res, next) => {
  try {
    const [reservas] = await db.query(
      `SELECT r.id, r.fecha, r.personas, r.total, r.estado, r.creado_en,
              r.nombre_contacto, r.correo_contacto, r.telefono_contacto,
              t.id AS tour_id, t.nombre AS tour,
              u.id AS usuario_id, u.nombre AS usuario_nombre, u.correo AS usuario_correo
       FROM reservas r
       JOIN tours t ON r.tour_id = t.id
       JOIN usuarios u ON r.usuario_id = u.id
       ORDER BY r.creado_en DESC`
    );

    return res.status(200).json(reservas);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reservas/:id/estado - Modificar estado de una reserva (solo admin)
const actualizarEstadoReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada'];
    if (!estado || !estadosPermitidos.includes(estado.toLowerCase())) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}`
      });
    }

    const estadoFinal = estado.toLowerCase();

    // Comprobar existencia de la reserva
    const [reservasExistentes] = await db.query('SELECT * FROM reservas WHERE id = ?', [id]);
    if (reservasExistentes.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estadoFinal, id]);

    return res.status(200).json({
      mensaje: 'Estado de reserva actualizado con éxito',
      id: Number(id),
      estado: estadoFinal
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearReserva,
  obtenerMisReservas,
  listarTodasReservas,
  actualizarEstadoReserva
};
