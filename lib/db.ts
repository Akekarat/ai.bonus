import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface Game {
  id: string;
  created_at: string;
  played: boolean;
  result_label?: string;
  result_image?: string;
}

export async function openDb(): Promise<Database> {
  return open({
    filename: './database.sql',
    driver: sqlite3.Database
  });
}

export async function initDb(): Promise<Database> {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      played BOOLEAN DEFAULT 0,
      result_label TEXT,
      result_image TEXT
    );
  `);
  return db;
}

export async function createGame(id: string): Promise<void> {
  const db = await openDb();
  await db.run(
    'INSERT INTO games (id, played) VALUES (?, 0)',
    [id]
  );
}

export async function getGame(id: string): Promise<Game | null> {
  const db = await openDb();
  const game = await db.get<Game>(
    'SELECT * FROM games WHERE id = ?',
    [id]
  );
  return game || null;
}

export async function updateGameResult(
  id: string, 
  resultLabel: string, 
  resultImage: string
): Promise<void> {
  const db = await openDb();
  await db.run(
    'UPDATE games SET played = 1, result_label = ?, result_image = ? WHERE id = ?',
    [resultLabel, resultImage, id]
  );
}

export async function getAllGames(): Promise<Game[]> {
  const db = await openDb();
  return db.all<Game[]>('SELECT * FROM games ORDER BY created_at DESC');
} 