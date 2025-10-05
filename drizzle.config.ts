
import { defineConfig } from "drizzle-kit";

// Get database credentials from environment (Railway MySQL)
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

console.log('Drizzle config - Database credentials:', { host: dbHost, port: dbPort, user: dbUser, database: dbName });

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  },
});
