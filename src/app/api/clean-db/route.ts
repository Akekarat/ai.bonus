import { NextResponse } from 'next/server';
import { openDb, initDb } from '../../../../lib/db';

export async function DELETE() {
  try {
    // Initialize database first to ensure it exists
    await initDb();
    const db = await openDb();
    
    // Check if games table exists
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='games'");
    if (!tableExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Games table does not exist',
        suggestion: 'Database may not be initialized yet'
      }, { status: 404 });
    }
    
    // Delete all records from the games table
    const result = await db.run('DELETE FROM games');
    
    // Reset the auto-increment counter (if using SQLite with auto-increment)
    await db.run('DELETE FROM sqlite_sequence WHERE name = "games"').catch(() => {
      // This table might not exist, ignore error
      console.log('sqlite_sequence table does not exist');
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database cleaned successfully',
      deletedCount: result.changes || 0
    });
  } catch (error) {
    console.error('Failed to clean database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Initialize database first to ensure it exists
    await initDb();
    const db = await openDb();
    
    // Check if games table exists
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='games'");
    if (!tableExists) {
      return NextResponse.json({ 
        message: 'Database status',
        totalGames: 0,
        note: 'Games table does not exist - database may not be initialized',
        endpoint: 'DELETE /api/clean-db to clean all games'
      });
    }
    
    // Get count of records before cleaning
    const result = await db.get('SELECT COUNT(*) as count FROM games');
    const count = result?.count || 0;
    
    return NextResponse.json({ 
      message: 'Database status',
      totalGames: count,
      endpoint: 'DELETE /api/clean-db to clean all games'
    });
  } catch (error) {
    console.error('Failed to get database status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 