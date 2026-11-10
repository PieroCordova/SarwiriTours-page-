// src/config/db.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sarwiri_tours',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobación de conexión inicial
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos MySQL (' + (process.env.DB_NAME || 'sarwiri_tours') + ')');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con MySQL:', error.message);
    console.log('Verifique las credenciales en el archivo .env y que el servicio MySQL esté ejecutándose.');
  }
})();

module.exports = pool;
