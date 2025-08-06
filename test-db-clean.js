const { initDb, openDb } = require('./lib/db');

async function testDatabase() {
  try {
    console.log('Testing database initialization...');
    await initDb();
    
    console.log('Testing database connection...');
    const db = await openDb();
    
    console.log('Checking if games table exists...');
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='games'");
    console.log('Games table exists:', !!tableExists);
    
    if (tableExists) {
      console.log('Testing DELETE operation...');
      const result = await db.run('DELETE FROM games');
      console.log('Delete result:', result);
      console.log('Deleted rows:', result.changes);
    }
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 