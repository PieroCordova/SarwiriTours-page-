// src/initDb.js - Script para inicializar la base de datos y cargar schema.sql
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const mysql = require('mysql2/promise');

async function inicializarBD() {
  console.log('Iniciando carga de la base de datos MySQL...');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT) || 3306;

  let connection;
  try {
    // Conectar sin especificar base de datos para crearla si no existe
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });

    console.log(`Conectado al servidor MySQL en ${host}:${port}`);

    const sqlPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando schema.sql...');
    await connection.query(sql);

    console.log('¡Base de datos `sarwiri_tours` y tablas inicializadas con éxito!');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  inicializarBD();
}

module.exports = inicializarBD;
