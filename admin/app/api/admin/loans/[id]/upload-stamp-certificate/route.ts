import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const { id: loanId } = params;

    if (!loanId) {
      return NextResponse.json(
        { success: false, message: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    const response = await fetch(`${backendUrl}/api/admin/loans/${loanId}/upload-stamp-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        // Don't set Content-Type header, let fetch handle it for FormData
      },
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in upload-stamp-certificate API route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
