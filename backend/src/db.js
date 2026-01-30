import mysql from "mysql2/promise";
import "dotenv/config";

function buildPoolConfig() {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error(
      "DATABASE_URL is not set and DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are missing"
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
  };
}

const poolConfig = buildPoolConfig();

export const pool = mysql.createPool(
  typeof poolConfig === "string"
    ? poolConfig
    : {
        ...poolConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      }
);
