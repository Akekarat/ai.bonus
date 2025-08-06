import { openDb } from './db';

export async function migrateDatabase() {
  try {
    const db = await openDb();
    
    // Add new columns if they don't exist
    await db.exec(`
      ALTER TABLE games ADD COLUMN wheel_count INTEGER DEFAULT 1;
    `).catch(() => {
      // Column might already exist, ignore error
      console.log('wheel_count column already exists');
    });
    
    await db.exec(`
      ALTER TABLE games ADD COLUMN results_csv TEXT;
    `).catch(() => {
      // Column might already exist, ignore error
      console.log('results_csv column already exists');
    });
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
} 