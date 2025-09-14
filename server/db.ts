
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// Parse the JDBC URL to get connection details
const dbHost = process.env.DB_HOST || 'db2.sillydevelopment.co.uk';
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER || 'u77272_CezJ7ZJDoG';
const dbPassword = process.env.DB_PASSWORD || '4R.u8LGwD10VjCh84af=k4Vh';
const dbName = process.env.DB_NAME || 's77272_axiom';

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  throw new Error(
    "Database credentials must be set. Please check your environment variables.",
  );
}

// Create MySQL connection
export const connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  multipleStatements: true,
});

export const db = drizzle(connection, { schema, mode: 'default' });
