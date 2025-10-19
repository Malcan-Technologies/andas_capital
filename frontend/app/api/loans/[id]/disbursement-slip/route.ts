import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`📥 Fetching disbursement slip for loan: ${params.id}`);

    // Get loan to find applicationId
    const loanResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/api/loans/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!loanResponse.ok) {
      console.error(`❌ Loan fetch failed: ${loanResponse.status}`);
      return NextResponse.json(
        { message: 'Loan not found' },
        { status: 404 }
      );
    }

    const loanData = await loanResponse.json();
    
    // Handle both wrapped and unwrapped responses
    const loan = loanData.data || loanData;
    const applicationId = loan.applicationId || loan.application?.id;

    if (!applicationId) {
      console.error('❌ No applicationId found in loan data:', loan);
      return NextResponse.json(
        { message: 'Application ID not found for this loan' },
        { status: 404 }
      );
    }

    console.log(`📋 Application ID: ${applicationId}`);

    // Download disbursement slip from admin endpoint
    const slipResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/api/admin/disbursements/${applicationId}/payment-slip`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!slipResponse.ok) {
      const errorText = await slipResponse.text();
      console.error(`❌ Slip fetch failed: ${slipResponse.status}`, errorText);
      return NextResponse.json(
        { message: 'Payment slip not found' },
        { status: 404 }
      );
    }

    const blob = await slipResponse.blob();
    console.log(`✅ Disbursement slip downloaded successfully`);
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="disbursement-slip-${applicationId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('❌ Error downloading disbursement slip:', error);
    return NextResponse.json(
      { message: 'Failed to download payment slip',  error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

