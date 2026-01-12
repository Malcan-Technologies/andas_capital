import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string; filename: string }> }
) {
  const params = await props.params;
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const { id: loanId, filename } = params;

    if (!loanId || !filename) {
      return NextResponse.json(
        { success: false, message: 'Loan ID and filename are required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    const response = await fetch(`${backendUrl}/api/admin/loans/${loanId}/pdf-letters/${filename}/download`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to download PDF letter' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to download PDF letter' },
        { status: response.status }
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer();
    
    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in download PDF letters API route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
