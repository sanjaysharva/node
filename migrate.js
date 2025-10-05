import fs from "fs";
import mysql from "mysql2/promise";

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "db2.sillydevelopment.co.uk",
      user: process.env.DB_USER || "u77272_CezJ7ZJDoG",
      password: process.env.DB_PASS || "4R.u8LGwD10VjCh84af=k4Vh",
      database: process.env.DB_NAME || "s77272_axiom",
      multipleStatements: true,
    });

    const sql = fs.readFileSync("./migrations/mysql_schema.sql", "utf8");
    await connection.query(sql);

    console.log("✅ Migration completed successfully!");
    await connection.end();
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
