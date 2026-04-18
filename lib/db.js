import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Mantém a instância da conexão em cache
let db = null;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Cria a tabela de usuários caso não exista
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);
  }
  
  return db;
}
