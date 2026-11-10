// src/controllers/toursController.js
const db = require('../config/db');

// GET /api/tours - Lista tours con filtros opcionales (q, personas)
const listarTours = async (req, res, next) => {
  try {
    const { q, personas } = req.query;
    let query = 'SELECT * FROM tours WHERE 1=1';
    const params = [];

    // Filtro por palabra clave (nombre o descripción)
    if (q && q.trim() !== '') {
      query += ' AND (LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ? OR LOWER(categoria) LIKE ?)';
      const busqueda = `%${q.trim().toLowerCase()}%`;
      params.push(busqueda, busqueda, busqueda);
    }

    // Filtro por capacidad de personas (max_personas >= personas)
    if (personas && !isNaN(personas)) {
      query += ' AND max_personas >= ?';
      params.push(Number(personas));
    }

    query += ' ORDER BY id ASC';

    const [tours] = await db.query(query, params);
    return res.status(200).json(tours);
  } catch (error) {
    next(error);
  }
};

// GET /api/tours/:id - Detalle de un tour específico
const obtenerTourPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [tours] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);

    if (tours.length === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    return res.status(200).json(tours[0]);
  } catch (error) {
    next(error);
  }
};

// GET /api/tours/:id/disponibilidad?fecha=YYYY-MM-DD - Cupos disponibles por fecha
const obtenerDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Debe especificar el parámetro fecha (ej: ?fecha=2026-11-20)' });
    }

    // Verificar si el tour existe
    const [tours] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (tours.length === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    const tour = tours[0];

    // Consultar personas reservadas activas (excluyendo canceladas)
    const [resultadoReservas] = await db.query(
      "SELECT COALESCE(SUM(personas), 0) AS total_reservadas FROM reservas WHERE tour_id = ? AND fecha = ? AND estado != 'cancelada'",
      [id, fecha]
    );

    const personasReservadas = Number(resultadoReservas[0].total_reservadas);
    const cuposDisponibles = Math.max(0, tour.max_personas - personasReservadas);

    return res.status(200).json({
      tourId: tour.id,
      nombre: tour.nombre,
      fecha,
      maxPersonas: tour.max_personas,
      personasReservadas,
      cuposDisponibles
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tours - Crear un nuevo tour (solo admin)
const crearTour = async (req, res, next) => {
  try {
    const { nombre, categoria, duracion, precio, max_personas, maxPersonas, imagen, descripcion } = req.body;

    const capacidad = max_personas || maxPersonas;

    if (!nombre || !categoria || !duracion || precio === undefined || capacidad === undefined || !descripcion) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios: nombre, categoria, duracion, precio, max_personas, imagen, descripcion'
      });
    }

    if (Number(precio) <= 0 || Number(capacidad) <= 0) {
      return res.status(400).json({ error: 'El precio y la capacidad máxima deben ser números mayores a 0' });
    }

    const imagenDefecto = imagen || 'img/default-tour.jpg';

    const [resultado] = await db.query(
      'INSERT INTO tours (nombre, categoria, duracion, precio, max_personas, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre.trim(), categoria.trim(), duracion.trim(), Number(precio), Number(capacidad), imagenDefecto.trim(), descripcion.trim()]
    );

    const [nuevoTour] = await db.query('SELECT * FROM tours WHERE id = ?', [resultado.insertId]);

    return res.status(201).json({
      mensaje: 'Tour creado exitosamente',
      tour: nuevoTour[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tours/:id - Modificar un tour existente (solo admin)
const actualizarTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, duracion, precio, max_personas, maxPersonas, imagen, descripcion } = req.body;

    const [toursExistentes] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (toursExistentes.length === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    const tourActual = toursExistentes[0];
    const nuevoNombre = nombre !== undefined ? nombre.trim() : tourActual.nombre;
    const nuevaCategoria = categoria !== undefined ? categoria.trim() : tourActual.categoria;
    const nuevaDuracion = duracion !== undefined ? duracion.trim() : tourActual.duracion;
    const nuevoPrecio = precio !== undefined ? Number(precio) : tourActual.precio;
    const capacidad = max_personas !== undefined ? max_personas : maxPersonas;
    const nuevaCapacidad = capacidad !== undefined ? Number(capacidad) : tourActual.max_personas;
    const nuevaImagen = imagen !== undefined ? imagen.trim() : tourActual.imagen;
    const nuevaDescripcion = descripcion !== undefined ? descripcion.trim() : tourActual.descripcion;

    await db.query(
      'UPDATE tours SET nombre = ?, categoria = ?, duracion = ?, precio = ?, max_personas = ?, imagen = ?, descripcion = ? WHERE id = ?',
      [nuevoNombre, nuevaCategoria, nuevaDuracion, nuevoPrecio, nuevaCapacidad, nuevaImagen, nuevaDescripcion, id]
    );

    const [tourModificado] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: 'Tour modificado exitosamente',
      tour: tourModificado[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tours/:id - Eliminar un tour (solo admin)
const eliminarTour = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [toursExistentes] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (toursExistentes.length === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    await db.query('DELETE FROM tours WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: 'Tour eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarTours,
  obtenerTourPorId,
  obtenerDisponibilidad,
  crearTour,
  actualizarTour,
  eliminarTour
};
