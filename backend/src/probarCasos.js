// src/probarCasos.js - Verificación automatizada de los 14 casos de prueba de la Entrega 2
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const http = require('http');
const app = require('./app');

async function ejecutarPruebas() {
  const PORT_TEST = 3055;
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT_TEST, resolve));
  const BASE_URL = `http://localhost:${PORT_TEST}`;

  console.log('====================================================');
  console.log(' INICIANDO VERIFICACIÓN DE LOS 14 CASOS DE PRUEBA');
  console.log('====================================================\n');

  let adminToken = '';
  let visitanteToken = '';
  let tourCreadoId = null;
  let reservaCreadaId = null;

  const resultados = [];

  const registrarResultado = (num, nombre, esperado, obtenido, ok) => {
    resultados.push({ num, nombre, esperado, obtenido, ok });
    const icono = ok ? '✓ EXITO' : '✗ FALLO';
    console.log(`[Caso ${num}] ${nombre}`);
    console.log(`   Esperado: ${esperado} | Obtenido: ${obtenido} -> ${icono}\n`);
  };

  try {
    // Caso 1: Registrar un usuario con datos válidos -> 201 y sin contraseña
    const correoRandom = `usuario_${Date.now()}@test.cl`;
    const res1 = await fetch(`${BASE_URL}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Usuario Prueba', correo: correoRandom, contrasena: '123456' })
    });
    const body1 = await res1.json();
    const ok1 = res1.status === 201 && body1.usuario && !body1.usuario.contrasena;
    registrarResultado(1, 'Registrar un usuario con datos válidos', '201 y sin contraseña', `${res1.status}${body1.usuario && !body1.usuario.contrasena ? ' (sin hash)' : ''}`, ok1);

    // Caso 2: Registrar un usuario con un correo ya existente -> 409
    const res2 = await fetch(`${BASE_URL}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Duplicado', correo: correoRandom, contrasena: '123456' })
    });
    registrarResultado(2, 'Registrar un usuario con un correo ya existente', '409', `${res2.status}`, res2.status === 409);

    // Caso 3: Iniciar sesión con credenciales correctas -> 200 y token JWT
    const res3Admin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'admin@sarwiri.cl', contrasena: 'admin123' })
    });
    const body3Admin = await res3Admin.json();
    adminToken = body3Admin.token;

    const res3User = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'visitante@correo.cl', contrasena: 'clave123' })
    });
    const body3User = await res3User.json();
    visitanteToken = body3User.token;

    const ok3 = res3Admin.status === 200 && Boolean(adminToken);
    registrarResultado(3, 'Iniciar sesión con credenciales correctas', '200 y token JWT', `${res3Admin.status} con token`, ok3);

    // Caso 4: Iniciar sesión con contraseña incorrecta -> 401
    const res4 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'admin@sarwiri.cl', contrasena: 'clave_erronea' })
    });
    registrarResultado(4, 'Iniciar sesión con contraseña incorrecta', '401', `${res4.status}`, res4.status === 401);

    // Caso 5: Listar tours buscando la palabra «sandboard» -> 200 y solo tours que coinciden
    const res5 = await fetch(`${BASE_URL}/api/tours?q=sandboard`);
    const body5 = await res5.json();
    const ok5 = res5.status === 200 && Array.isArray(body5) && body5.length > 0 && body5.every(t => t.nombre.toLowerCase().includes('sandboard') || t.descripcion.toLowerCase().includes('sandboard'));
    registrarResultado(5, 'Listar tours buscando la palabra «sandboard»', '200 y tours que coinciden', `${res5.status} (${body5.length} tours)`, ok5);

    // Caso 6: Listar tours con 12 personas -> 200 y solo tours con máximo mayor o igual a 12
    const res6 = await fetch(`${BASE_URL}/api/tours?personas=12`);
    const body6 = await res6.json();
    const ok6 = res6.status === 200 && Array.isArray(body6) && body6.every(t => t.max_personas >= 12);
    registrarResultado(6, 'Listar tours con 12 personas', '200 y max_personas >= 12', `${res6.status} (${body6.length} tours)`, ok6);

    // Caso 7: Consultar un tour inexistente -> 404
    const res7 = await fetch(`${BASE_URL}/api/tours/99999`);
    registrarResultado(7, 'Consultar un tour inexistente', '404', `${res7.status}`, res7.status === 404);

    // Caso 8: Crear una reserva con sesión iniciada -> 201, estado pendiente y total calculado
    const res8 = await fetch(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${visitanteToken}`
      },
      body: JSON.stringify({
        tourId: 1,
        fecha: '2026-11-20',
        personas: 2,
        nombre: 'Ana Pérez',
        correo: 'ana@correo.cl',
        telefono: '+56 9 1234 5678'
      })
    });
    const body8 = await res8.json();
    reservaCreadaId = body8.id;
    const ok8 = res8.status === 201 && body8.estado === 'pendiente' && body8.total === 50000;
    registrarResultado(8, 'Crear una reserva con sesión iniciada', '201, pendiente y total 50000', `${res8.status}, estado: ${body8.estado}, total: ${body8.total}`, ok8);

    // Caso 9: Crear una reserva sin token -> 401
    const res9 = await fetch(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tourId: 1,
        fecha: '2026-11-20',
        personas: 1,
        nombre: 'Sin Auth',
        correo: 'sin@token.cl'
      })
    });
    registrarResultado(9, 'Crear una reserva sin token', '401', `${res9.status}`, res9.status === 401);

    // Caso 10: Reservar más personas que el máximo del tour -> 400
    const res10 = await fetch(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${visitanteToken}`
      },
      body: JSON.stringify({
        tourId: 1, // Tour 1 tiene max_personas = 10
        fecha: '2026-12-01',
        personas: 50,
        nombre: 'Exceso Personas',
        correo: 'ana@correo.cl'
      })
    });
    registrarResultado(10, 'Reservar más personas que el máximo del tour', '400', `${res10.status}`, res10.status === 400);

    // Caso 11: Reservar con fecha anterior a hoy -> 400
    const res11 = await fetch(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${visitanteToken}`
      },
      body: JSON.stringify({
        tourId: 1,
        fecha: '2020-01-01',
        personas: 2,
        nombre: 'Fecha Pasada',
        correo: 'ana@correo.cl'
      })
    });
    registrarResultado(11, 'Reservar con fecha anterior a hoy', '400', `${res11.status}`, res11.status === 400);

    // Caso 12: Crear un tour como visitante -> 403
    const res12 = await fetch(`${BASE_URL}/api/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${visitanteToken}`
      },
      body: JSON.stringify({
        nombre: 'Tour Prohibido',
        categoria: 'Aventura',
        duracion: '1 hora',
        precio: 10000,
        max_personas: 5,
        descripcion: 'No debería crearse'
      })
    });
    registrarResultado(12, 'Crear un tour como visitante', '403', `${res12.status}`, res12.status === 403);

    // Caso 13: Crear, modificar y eliminar un tour como administrador -> 201, 200 y 200
    const res13Create = await fetch(`${BASE_URL}/api/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        nombre: 'Tour Salar del Huasco',
        categoria: 'Naturaleza',
        duracion: '10 horas',
        precio: 55000,
        max_personas: 8,
        imagen: 'img/huasco.jpg',
        descripcion: 'Excursión guiada por el Salar del Huasco y avistamiento de flamencos.'
      })
    });
    const body13Create = await res13Create.json();
    tourCreadoId = body13Create.tour ? body13Create.tour.id : null;

    const res13Update = await fetch(`${BASE_URL}/api/tours/${tourCreadoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ precio: 60000 })
    });

    const res13Delete = await fetch(`${BASE_URL}/api/tours/${tourCreadoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const ok13 = res13Create.status === 201 && res13Update.status === 200 && res13Delete.status === 200;
    registrarResultado(13, 'Crear, modificar y eliminar un tour como administrador', '201, 200 y 200', `${res13Create.status}, ${res13Update.status} y ${res13Delete.status}`, ok13);

    // Caso 14: Confirmar una reserva como administrador -> 200 y estado confirmada
    const res14 = await fetch(`${BASE_URL}/api/reservas/${reservaCreadaId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ estado: 'confirmada' })
    });
    const body14 = await res14.json();
    const ok14 = res14.status === 200 && body14.estado === 'confirmada';
    registrarResultado(14, 'Confirmar una reserva como administrador', '200 y estado confirmada', `${res14.status}, estado: ${body14.estado}`, ok14);

    console.log('====================================================');
    const todosOk = resultados.every(r => r.ok);
    console.log(` RESULTADO FINAL: ${todosOk ? 'TODOS LOS CASOS APROBADOS (14/14)' : 'ALGUNOS CASOS FALLARON'}`);
    console.log('====================================================');
  } catch (err) {
    console.error('Error durante la ejecución de las pruebas:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

ejecutarPruebas();
