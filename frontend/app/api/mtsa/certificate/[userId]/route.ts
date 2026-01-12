import { NextRequest, NextResponse } from 'next/server';

// SIGNING_ORCHESTRATOR_URL should be the base URL without /api suffix
// e.g., https://sign.kredit.my or http://localhost:4010
const SIGNING_ORCHESTRATOR_URL = process.env.SIGNING_ORCHESTRATOR_URL || 'http://localhost:4010';
const SIGNING_ORCHESTRATOR_API_KEY = process.env.SIGNING_ORCHESTRATOR_API_KEY || process.env.DOCUSEAL_API_TOKEN || 'NwPkizAUEfShnc4meN1m3N38DG8ZNEyRmWPMjq8BXv8';

// Helper to build orchestrator API URL
function getOrchestratorApiUrl(path: string): string {
  const baseUrl = SIGNING_ORCHESTRATOR_URL.replace(/\/+$/, '');
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api${apiPath}`;
}

export async function GET(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Call the signing orchestrator API to check certificate
    const url = getOrchestratorApiUrl(`/cert/${userId}`);
    
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