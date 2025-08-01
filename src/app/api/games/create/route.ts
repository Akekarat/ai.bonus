import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createGame } from '../../../../../lib/db';

export async function POST() {
  try {
    const gameId = uuidv4();
    await createGame(gameId);
    
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