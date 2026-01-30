import mysql from "mysql2/promise";
import "dotenv/config";

function buildDatabaseUrl() {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "3306";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME;

  if (!host || !user || !password || !name) {
    throw new Error(
      "DATABASE_URL is not set and DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are missing"
    );
  }

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port}/${name}`;
}

const databaseUrl = buildDatabaseUrl();

export const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
