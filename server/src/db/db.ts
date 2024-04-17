import mysql from "mysql2/promise"

const db = mysql.createPool({
    host: Bun.env.DB_HOST,
    user: Bun.env.DB_USER,
    password: Bun.env.DB_PASSWORD,
    database: Bun.env.DB_NAME,
});

export default db
