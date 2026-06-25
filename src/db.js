import mysql from "mysql2/promise";
import { config } from "./config.js";

let pool;

async function ensureTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS email_generations (
      id INT NOT NULL AUTO_INCREMENT,
      prompt TEXT NOT NULL,
      tone VARCHAR(50) NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      model VARCHAR(120) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_email_generations_created_at (created_at DESC),
      INDEX idx_email_generations_tone (tone)
    )
  `);
}

async function createPool() {
  const nextPool = mysql.createPool({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const connection = await nextPool.getConnection();
  try {
    await ensureTable(connection);
  } finally {
    connection.release();
  }

  return nextPool;
}

export async function getDb() {
  if (!pool) {
    pool = await createPool();
  }

  return pool;
}
