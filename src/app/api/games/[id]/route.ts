import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGameResult, updateMultiWheelResults } from '../../../../../lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const game = await getGame(id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error retrieving game:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve game' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const game = await getGame(id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    if (game.played) {
      return NextResponse.json(
        { error: 'Game already played' },
        { status: 400 }
      );
    }
    
    // Handle multi-wheel results (CSV format)
    if (body.results && Array.isArray(body.results)) {
      await updateMultiWheelResults(id, body.results);
      return NextResponse.json({ success: true });
    }
    
    // Handle single wheel result (backward compatibility)
    const { result_label, result_image } = body;
    
    if (!result_label || !result_image) {
      return NextResponse.json(
        { error: 'Missing result data' },
        { status: 400 }
      );
    }
    
    await updateGameResult(id, result_label, result_image);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
} 