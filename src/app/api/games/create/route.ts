import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createGame } from '../../../../../lib/db';

export async function POST(req: Request) {
  try {
    let wheelCount = 1;
    try {
      const body = await req.json();
      console.log('[API] received body:', body);

      if (body && body.wheelCount) {
        wheelCount = Number(body.wheelCount);
      }
    } catch (e) {
      // No body or invalid JSON, fallback to default
      wheelCount = 1;
    }
    const safeWheelCount = Math.max(1, Math.min(Number(wheelCount) || 1, 100));
    const uuid = uuidv4();
    const gameId = `${String(safeWheelCount).padStart(2, '0')}_${uuid}`;
    await createGame(gameId, safeWheelCount);
    
    return NextResponse.json({ 
      gameId, 
      url: `/game/${gameId}` 
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
} 