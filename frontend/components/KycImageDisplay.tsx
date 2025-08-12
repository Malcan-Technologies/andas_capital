"use client";

import { useEffect, useState } from "react";
import { TokenStorage } from "@/lib/authUtils";

interface KycImageDisplayProps {
	imageId: string;
}

export default function KycImageDisplay({ imageId }: KycImageDisplayProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchImage() {
			try {
				setLoading(true);
				setError(null);

				// Get the access token using TokenStorage
				const accessToken = TokenStorage.getAccessToken();
				if (!accessToken) {
					throw new Error("No access token available");
				}

				// Fetch the image with authentication
				const response = await fetch(`/api/kyc/images/${imageId}`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				if (!response.ok) {
					// If unauthorized, the token might be expired - redirect to login
					if (response.status === 401 || response.status === 403) {
						throw new Error("Authentication failed. Please log in again.");
					}
					throw new Error(`Failed to fetch image: ${response.status}`);
				}

				// Create a blob URL for the image
				const blob = await response.blob();
				const objectUrl = URL.createObjectURL(blob);
				setImageUrl(objectUrl);
			} catch (err) {
				console.error("Error fetching KYC image:", err);
				setError(err instanceof Error ? err.message : "Failed to load image");
			} finally {
				setLoading(false);
			}
		}

		if (imageId) {
			fetchImage();
		}

		// Cleanup function to revoke the object URL
		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
		};
	}, [imageId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
					<p className="text-gray-600 font-body">Loading image...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
						<svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h4 className="text-lg font-semibold text-gray-700 font-heading mb-2">
						Failed to Load Image
					</h4>
					<p className="text-gray-500 font-body">
						{error}
					</p>
				</div>
			</div>
		);
	}

	if (!imageUrl) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
						<svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<h4 className="text-lg font-semibold text-gray-700 font-heading mb-2">
						No Image Available
					</h4>
					<p className="text-gray-500 font-body">
						The image could not be loaded.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-full max-h-full overflow-hidden">
			<img
				src={imageUrl}
				alt="KYC Document"
				className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-sm"
				onLoad={() => console.log("KYC image loaded successfully")}
				onError={() => setError("Failed to display image")}
			/>
		</div>
	);
}
