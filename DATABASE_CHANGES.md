# Database Changes for Multi-Wheel Support

## Overview
The database schema has been updated to support multi-wheel games and prevent reloading from allowing multiple spins.

## Schema Changes

### New Columns Added to `games` table:
- `wheel_count` (INTEGER, DEFAULT 1): Number of wheels in the game
- `results_csv` (TEXT): CSV format string of result labels (e.g., "Bonus 10%,Free Spin,Bonus 20%")

### Updated Functions:
- `createGame(id, wheelCount)`: Now accepts wheel count parameter
- `updateMultiWheelResults(id, results[])`: New function to save multi-wheel results in CSV format

## API Changes

### PUT /api/games/[id]
Now supports two formats:

1. **Multi-wheel results (new):**
```json
{
  "results": ["Bonus 10%", "Free Spin", "Bonus 20%"]
}
```

2. **Single wheel results (backward compatible):**
```json
{
  "result_label": "Bonus 10%",
  "result_image": "/images/bonus10.svg"
}
```

## Game Page Changes

### Key Features:
1. **One-time spin**: Game can only be spun once, even if user reloads the URL
2. **Database persistence**: Results are saved to SQLite immediately after spinning
3. **Reload protection**: If user reloads URL after spinning, they see only the results table
4. **Multi-wheel support**: Results are stored in CSV format for easy parsing

### Flow:
1. User visits game URL
2. If game not played: Show spin button and wheels
3. User clicks spin → Wheels spin → Results saved to database
4. If user reloads URL: Show only results table (no spin button)

## Migration
The database will automatically migrate when the application starts. Existing single-wheel games will continue to work with the old format.

## Testing
Run the database initialization API to ensure schema is updated:
```bash
curl -X POST http://localhost:3000/api/init-db
```

---

## Database Cleaning & Admin API Usage

### Simple Clean API (`/api/clean-db`)
- **GET**: Check database status (total games count)
- **DELETE**: Clean all games from database

**Examples:**
```bash
# Check database status
curl http://localhost:3000/api/clean-db

# Clean all games
curl -X DELETE http://localhost:3000/api/clean-db
```

### Advanced Admin API (`/api/db-admin`)
- **GET** with actions:
  - `?action=status` — Get database status (total, played, unplayed games)
  - `?action=list` — List all games (max 50)
  - `?action=stats` — Get detailed statistics (including average wheel count)
  - No action — Show available endpoints
- **DELETE** with actions:
  - `?action=clean` — Delete all games
  - `?action=clean-unplayed` — Delete only unplayed games

**Examples:**
```bash
# Get database status
tcurl http://localhost:3000/api/db-admin?action=status

# List all games
curl http://localhost:3000/api/db-admin?action=list

# Clean only unplayed games
curl -X DELETE http://localhost:3000/api/db-admin?action=clean-unplayed

# Get detailed statistics
curl http://localhost:3000/api/db-admin?action=stats
``` 