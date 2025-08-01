import { NextResponse } from 'next/server';
import { loadWheelConfig } from '../../../../lib/wheelConfig';

export async function GET() {
  try {
    const config = await loadWheelConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading wheel config:', error);
    return NextResponse.json(
      { error: 'Failed to load wheel configuration' },
      { status: 500 }
    );
  }
} 