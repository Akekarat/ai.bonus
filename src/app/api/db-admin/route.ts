import { NextResponse } from 'next/server';
import { openDb, getAllGames, initDb } from '../../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Initialize database first to ensure it exists
    await initDb();
    const db = await openDb();
    
    // Check if games table exists
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='games'");
    if (!tableExists) {
      return NextResponse.json({
        message: 'Database status',
        totalGames: 0,
        playedGames: 0,
        unplayedGames: 0,
        note: 'Games table does not exist - database may not be initialized'
      });
    }
    
    switch (action) {
      case 'status':
        // Get database status
        const countResult = await db.get('SELECT COUNT(*) as count FROM games');
        const playedResult = await db.get('SELECT COUNT(*) as count FROM games WHERE played = 1');
        const unplayedResult = await db.get('SELECT COUNT(*) as count FROM games WHERE played = 0');
        
        return NextResponse.json({
          message: 'Database status',
          totalGames: countResult?.count || 0,
          playedGames: playedResult?.count || 0,
          unplayedGames: unplayedResult?.count || 0
        });
        
      case 'list':
        // List all games (limit to 50 for performance)
        const games = await getAllGames();
        return NextResponse.json({
          message: 'All games',
          games: games.slice(0, 50),
          total: games.length,
          showing: Math.min(50, games.length)
        });
        
      case 'stats':
        // Get detailed statistics
        const stats = await db.get(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN played = 1 THEN 1 ELSE 0 END) as played,
            SUM(CASE WHEN played = 0 THEN 1 ELSE 0 END) as unplayed,
            AVG(CASE WHEN wheel_count IS NOT NULL THEN wheel_count ELSE 1 END) as avgWheels
          FROM games
        `);
        
        return NextResponse.json({
          message: 'Database statistics',
          stats
        });
        
      default:
        return NextResponse.json({
          message: 'Database admin API',
          endpoints: {
            'GET /api/db-admin?action=status': 'Get database status',
            'GET /api/db-admin?action=list': 'List all games (max 50)',
            'GET /api/db-admin?action=stats': 'Get detailed statistics',
            'DELETE /api/db-admin?action=clean': 'Clean all games',
            'DELETE /api/db-admin?action=clean-unplayed': 'Clean only unplayed games'
          }
        });
    }
  } catch (error) {
    console.error('Database admin error:', error);
    return NextResponse.json(
      { 
        error: 'Database admin operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
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
    
    switch (action) {
      case 'clean':
        // Clean all games
        const cleanResult = await db.run('DELETE FROM games');
        return NextResponse.json({
          success: true,
          message: 'All games deleted successfully',
          deletedCount: cleanResult.changes || 0
        });
        
      case 'clean-unplayed':
        // Clean only unplayed games
        const result = await db.run('DELETE FROM games WHERE played = 0');
        return NextResponse.json({
          success: true,
          message: 'Unplayed games deleted successfully',
          deletedCount: result.changes || 0
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use clean or clean-unplayed' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database clean error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 