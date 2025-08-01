import { initDb } from './db';

export async function initializeDatabase() {
  try {
    await initDb();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
} 