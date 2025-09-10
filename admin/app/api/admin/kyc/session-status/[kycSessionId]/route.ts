import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function GET(
  request: NextRequest,
  { params }: { params: { kycSessionId: string } }
) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { kycSessionId } = params;

    if (!kycSessionId) {
      return NextResponse.json(
        { success: false, message: 'KYC Session ID is required' },
        { status: 400 }
      );
    }

    console.log('Admin checking KYC session status:', kycSessionId);

    // Forward request to backend admin KYC API - use the existing session status endpoint
    const response = await fetch(`${BACKEND_URL}/api/admin/kyc/${kycSessionId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Set cache-busting headers
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    if (response.ok) {
      return NextResponse.json({
        success: true,
        status: data.status,
        ctosResult: data.ctosResult,
        ctosStatus: data.ctosStatus,
        isApproved: data.status === 'APPROVED',
        isCompleted: data.status === 'APPROVED' || data.status === 'REJECTED',
        completedAt: data.completedAt
      }, { headers });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to get KYC session status' },
        { status: response.status, headers }
      );
    }
  } catch (error) {
    console.error('Error getting admin KYC session status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
