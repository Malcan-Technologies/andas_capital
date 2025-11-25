import { NextRequest, NextResponse } from 'next/server';

const SIGNING_ORCHESTRATOR_URL = process.env.SIGNING_ORCHESTRATOR_URL || 'http://localhost:4010';
const SIGNING_ORCHESTRATOR_API_KEY = process.env.SIGNING_ORCHESTRATOR_API_KEY || process.env.DOCUSEAL_API_TOKEN || 'NwPkizAUEfShnc4meN1m3N38DG8ZNEyRmWPMjq8BXv8';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Call the signing orchestrator API to check certificate
    const url = `${SIGNING_ORCHESTRATOR_URL}/cert/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': SIGNING_ORCHESTRATOR_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to check certificate' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error checking certificate:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}