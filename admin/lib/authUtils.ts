import Cookies from "js-cookie";

/**
 * Token storage utility functions to handle both localStorage and cookies
 */
export const AdminTokenStorage = {
	// Access token functions
	getAccessToken: (): string | null => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return null;
		}

		return (
			localStorage.getItem("adminToken") ||
			Cookies.get("adminToken") ||
			null
		);
	},

	// 15 minutes expiration, matching the JWT expiration in the backend
	setAccessToken: (token: string, expiresInDays: number = 0.01): void => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return;
		}

		localStorage.setItem("adminToken", token);
		Cookies.set("adminToken", token, { expires: expiresInDays });
	},

	removeAccessToken: (): void => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem("adminToken");
		Cookies.remove("adminToken");
	},

	// Refresh token functions
	getRefreshToken: (): string | null => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return null;
		}

		return (
			localStorage.getItem("adminRefreshToken") ||
			Cookies.get("adminRefreshToken") ||
			null
		);
	},

	// 90 days expiration, matching the backend JWT refresh token expiration
	setRefreshToken: (token: string, expiresInDays: number = 90): void => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return;
		}

		localStorage.setItem("adminRefreshToken", token);
		Cookies.set("adminRefreshToken", token, { expires: expiresInDays });
	},

	removeRefreshToken: (): void => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem("adminRefreshToken");
		Cookies.remove("adminRefreshToken");
	},

	// Clear all tokens
	clearTokens: (): void => {
		AdminTokenStorage.removeAccessToken();
		AdminTokenStorage.removeRefreshToken();
	},
};

/**
 * Handles token refresh when access token expires
 * @returns A promise resolving to a new access token or null if refresh fails
 */
export const refreshAdminAccessToken = async (): Promise<string | null> => {
	try {
		const refreshToken = AdminTokenStorage.getRefreshToken();

		if (!refreshToken) {
			console.error("No refresh token available");
			return null;
		}

		const response = await fetch("/api/admin/refresh", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			console.error(
				"refreshAdminAccessToken - Error response:",
				response.status
			);
			const errorText = await response.text();
			console.error(
				"refreshAdminAccessToken - Error details:",
				errorText
			);
			throw new Error("Failed to refresh token");
		}

		const data = await response.json();

		// Store the new tokens
		AdminTokenStorage.setAccessToken(data.accessToken);
		AdminTokenStorage.setRefreshToken(data.refreshToken);

		return data.accessToken;
	} catch (error) {
		console.error("Error refreshing token:", error);
		// Clear tokens on refresh failure
		AdminTokenStorage.clearTokens();
		return null;
	}
};

/**
 * Makes an authenticated API request with automatic token refresh
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the response
 */
export const fetchWithAdminTokenRefresh = async <T>(
	url: string,
	options: RequestInit = {}
): Promise<T> => {
	// First try with existing access token
	let accessToken = AdminTokenStorage.getAccessToken();

	if (!accessToken) {
		throw new Error("No access token available");
	}

	// Set up headers with authorization
	const headers: Record<string, string> = {
		...(options.headers as Record<string, string> || {}),
		Authorization: `Bearer ${accessToken}`,
	};

	// Only set Content-Type for non-FormData requests
	if (!(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	// Determine the full URL to use
	let fullUrl = url;

	// If this is a relative URL starting with /api (not for Next.js API routes)
	// then we need to decide where to route it
	if (
		url.startsWith("/api/") &&
		!url.startsWith("/api/users/") &&
		!url.startsWith("/api/admin/refresh") &&
		!url.startsWith("/api/admin/login") &&
		!url.startsWith("/api/admin/logout") &&
		!url.startsWith("/api/admin/daily-stats") &&
		!url.startsWith("/api/admin/monthly-stats") &&
		!url.startsWith("/api/admin/settings") &&
		!url.startsWith("/api/admin/bank-accounts") &&
		!url.startsWith("/api/admin/company-settings")
	) {
		// For API calls to admin endpoints, route them to the backend
		const isAdminEndpoint = url.includes("/api/admin/");

		if (isAdminEndpoint) {
			// These should go to the backend
			const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
			fullUrl = `${backendUrl}${url}`;
		}
	}

	// Make the initial request
	let response = await fetch(fullUrl, { ...options, headers });

	// If unauthorized, try to refresh the token and retry the request
	if (response.status === 401 || response.status === 403) {
		const newAccessToken = await refreshAdminAccessToken();

		if (!newAccessToken) {
			throw new Error("Failed to refresh access token");
		}

		// Update headers with new access token
		headers["Authorization"] = `Bearer ${newAccessToken}`;

		// Retry the request
		response = await fetch(fullUrl, { ...options, headers });
	}

	if (!response.ok) {
		// Try to get the error message from the response body
		let errorMessage = `API request failed with status: ${response.status}`;
		try {
			const errorData = await response.json();
			if (errorData.message) {
				errorMessage = errorData.message;
			}
		} catch (e) {
			// If we can't parse the response, use the generic message
		}
		
		const error = new Error(errorMessage);
		(error as any).status = response.status;
		throw error;
	}

	return response.json();
};

/**
 * Checks if the admin is authenticated and refreshes token if needed
 * @returns Promise resolving to true if authenticated, false otherwise
 */
export const checkAdminAuth = async (): Promise<boolean> => {
	try {
		// Try to use current token
		const accessToken = AdminTokenStorage.getAccessToken();

		if (!accessToken) {
			// No access token available, try to refresh
			const newToken = await refreshAdminAccessToken();
			return !!newToken;
		}

		// Verify token validity by making a request to /api/admin/me
		try {
			interface UserData {
				id: string;
				fullName?: string;
				phoneNumber?: string;
				email?: string;
				role: string;
			}

			const userData = await fetchWithAdminTokenRefresh<UserData>(
				"/api/admin/me"
			);

			// Verify that the user has ADMIN or ATTESTOR role
			const hasAdminAccess = userData.role === "ADMIN" || userData.role === "ATTESTOR";
			return hasAdminAccess;
		} catch (error) {
			console.error("checkAdminAuth - User data fetch error:", error);
			// Token is invalid, try to refresh
			const newToken = await refreshAdminAccessToken();
			return !!newToken;
		}
	} catch (error) {
		console.error("Auth check failed:", error);
		return false;
	}
};
