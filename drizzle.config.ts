import dotenv from "dotenv";
dotenv.config();
import { defineConfig } from "drizzle-kit";

// Get database credentials from environment (Railway MySQL)
const dbHost = process.env.MYSQLHOST;
const dbPort = parseInt(process.env.MYSQLPORT || '3306');
const dbUser = process.env.MYSQLUSER;
const dbPassword = process.env.MYSQLPASSWORD;
const dbName = process.env.MYSQLNAME;

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
