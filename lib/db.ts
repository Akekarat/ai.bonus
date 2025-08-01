import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface Game {
  id: string;
  created_at: string;
  played: boolean;
  result_label?: string;
  result_image?: string;
}

let dbInstance: Database | null = null;

export async function openDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }
  
  try {
    dbInstance = await open({
      filename: './database.sql',
      driver: sqlite3.Database
    });
    return dbInstance;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function initDb(): Promise<Database> {
  try {
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
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

export async function createGame(id: string): Promise<void> {
  try {
    const db = await openDb();
    await db.run(
      'INSERT INTO games (id, played) VALUES (?, 0)',
      [id]
    );
  } catch (error) {
    console.error('Error creating game:', error);
    throw new Error('Failed to create game');
  }
}

export async function getGame(id: string): Promise<Game | null> {
  try {
    const db = await openDb();
    const game = await db.get<Game>(
      'SELECT * FROM games WHERE id = ?',
      [id]
    );
    return game || null;
  } catch (error) {
    console.error('Error retrieving game:', error);
    throw new Error('Failed to retrieve game');
  }
}

export async function updateGameResult(
  id: string, 
  resultLabel: string, 
  resultImage: string
): Promise<void> {
  try {
    const db = await openDb();
    await db.run(
      'UPDATE games SET played = 1, result_label = ?, result_image = ? WHERE id = ?',
      [resultLabel, resultImage, id]
    );
  } catch (error) {
    console.error('Error updating game result:', error);
    throw new Error('Failed to update game result');
  }
}

export async function getAllGames(): Promise<Game[]> {
  try {
    const db = await openDb();
    return db.all<Game[]>('SELECT * FROM games ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error retrieving all games:', error);
    throw new Error('Failed to retrieve games');
  }
} 