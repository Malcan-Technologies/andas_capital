"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ReceiptRedirect() {
	const params = useParams();
	const receiptId = params?.receiptId as string;

	useEffect(() => {
		if (receiptId) {
			// Redirect to the API endpoint for receipt download
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.kredit.my';
			const downloadUrl = `${apiUrl}/api/loans/receipt/${receiptId}`;
			
			// Redirect to the API endpoint
			window.location.href = downloadUrl;
		}
	}, [receiptId]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<h1 className="text-xl font-semibold text-gray-900 mb-2">
					Downloading Receipt
				</h1>
				<p className="text-gray-600">
					Please wait while we prepare your receipt download...
				</p>
				{receiptId && (
					<p className="text-sm text-gray-500 mt-4">
						Receipt ID: {receiptId}
					</p>
				)}
			</div>
		</div>
	);
}
