import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'assetflow_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Verify connection pool
  const conn = await pool.getConnection();
  console.log('MySQL Database pool connected successfully.');
  conn.release();
} catch (error) {
  console.error('⚠️ MySQL Connection Error:', error.message);
  console.log('Backend will run, but API endpoints will require MySQL to be active. Verify DB_USER/DB_PASS settings in server/.env.');
}

export const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. Check MySQL connection.');
  }
  const [rows] = await pool.query(text, params);
  return rows;
};

export default pool;
