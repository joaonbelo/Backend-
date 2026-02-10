import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./kut.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      barbershop_name TEXT,
      plan_active INTEGER DEFAULT 0
    )
  `);
});

export default db;