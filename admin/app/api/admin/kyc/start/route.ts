import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { icNumber, fullName, email, phoneNumber } = body;

    if (!icNumber || !fullName || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: icNumber, fullName, email' },
        { status: 400 }
      );
    }

    // Forward request to backend admin KYC API
    const response = await fetch(`${BACKEND_URL}/api/admin/kyc/start-ctos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentName: fullName,
        documentNumber: icNumber,
        platform: 'web',
        adminRequest: true, // Flag to indicate this is an admin request
        adminUserId: decoded.userId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          id: data.kycId || data.id,
          ctosOnboardingUrl: data.ctosOnboardingUrl,
          status: data.status || 'IN_PROGRESS',
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to start KYC' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error starting admin KYC:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
