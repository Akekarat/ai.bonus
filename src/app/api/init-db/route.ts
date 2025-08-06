import { NextResponse } from 'next/server';
import { initDb } from '../../../../lib/db';
import { migrateDatabase } from '../../../../lib/migrate-db';

export async function POST() {
  try {
    await initDb();
    await migrateDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized and migrated successfully' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 