"use client";

import { useEffect, useState } from "react";
import { AdminTokenStorage, refreshAdminAccessToken } from "@/lib/authUtils";
import { useRouter, usePathname } from "next/navigation";

// This component automatically refreshes the admin access token before it expires
export default function TokenRefresher() {
	const router = useRouter();
	const pathname = usePathname();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);

	useEffect(() => {
		// Helper to check if we're on a protected route
		const isProtectedRoute = () => {
			// All dashboard routes are protected
			return pathname?.startsWith("/dashboard");
		};

		// Check if we have tokens and are on a protected route
		const accessToken = AdminTokenStorage.getAccessToken();
		const refreshToken = AdminTokenStorage.getRefreshToken();

		// If no tokens and on protected route, redirect to login
		if (!refreshToken && isProtectedRoute()) {
			router.push("/login");
			return;
		}

		if (!accessToken && refreshToken && isProtectedRoute()) {
			// Try to refresh the token immediately if we have refresh token but no access token
			handleTokenRefresh();
		}

		// Handle visibility change (when user returns from another tab or sleep)
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible" && isProtectedRoute()) {
				// Check how long since last refresh attempt
				const currentTime = Date.now();
				// Only try refresh if it's been at least 5 seconds since last attempt
				if (currentTime - lastRefreshAttempt > 5000) {

					const token = AdminTokenStorage.getAccessToken();
					if (!token) {
						// No token, try refresh if we have refresh token
						const refreshToken =
							AdminTokenStorage.getRefreshToken();
						if (refreshToken) {
							handleTokenRefresh();
						} else {
							router.push("/login");
						}
						return;
					}

					// Check if token is expired or about to expire
					try {
						const payload = JSON.parse(atob(token.split(".")[1]));
						const expirationTime = payload.exp * 1000;
						const currentTime = Date.now();

						if (
							expirationTime < currentTime ||
							expirationTime - currentTime < 10 * 60 * 1000
						) {
							handleTokenRefresh();
						}
					} catch (error) {
						console.error(
							"Error decoding admin token on visibility change:",
							error
						);
						// If we can't decode the token, try to refresh it anyway
						handleTokenRefresh();
					}
				}
			}
		};

		// Handle network reconnection
		const handleOnline = () => {
			if (isProtectedRoute()) {
				// Check how long since last refresh attempt
				const currentTime = Date.now();
				// Only try refresh if it's been at least 5 seconds since last attempt
				if (currentTime - lastRefreshAttempt > 5000) {

					const token = AdminTokenStorage.getAccessToken();
					if (token) {
						// Check if token is valid
						try {
							const payload = JSON.parse(
								atob(token.split(".")[1])
							);
							const expirationTime = payload.exp * 1000;
							const currentTime = Date.now();

							if (
								expirationTime < currentTime ||
								expirationTime - currentTime < 10 * 60 * 1000
							) {
								handleTokenRefresh();
							}
						} catch (error) {
							handleTokenRefresh();
						}
					} else {
						// No token, try refresh if we have refresh token
						const refreshToken =
							AdminTokenStorage.getRefreshToken();
						if (refreshToken) {
							handleTokenRefresh();
						}
					}
				}
			}
		};

		// Set up event listeners
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("online", handleOnline);

		// Set up regular token refresh - check every minute
		const intervalId = setInterval(() => {
			const currentToken = AdminTokenStorage.getAccessToken();
			if (currentToken && isProtectedRoute()) {
				// Decode the token to check its expiration time
				try {
					const payload = JSON.parse(
						atob(currentToken.split(".")[1])
					);
					const expirationTime = payload.exp * 1000; // Convert to milliseconds
					const currentTime = Date.now();

					// If token will expire in the next 5 minutes, refresh it
					if (expirationTime - currentTime < 5 * 60 * 1000) {
						handleTokenRefresh();
					}
				} catch (error) {
					console.error("Error decoding admin token:", error);
					// If we can't decode the token, try to refresh it anyway
					handleTokenRefresh();
				}
			}
		}, 60000); // Check every minute

		// Cleanup event listeners
		return () => {
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange
			);
			window.removeEventListener("online", handleOnline);
			clearInterval(intervalId);
		};
	}, [pathname, router, lastRefreshAttempt]);

	const handleTokenRefresh = async () => {
		if (isRefreshing) return; // Prevent multiple simultaneous refresh attempts

		setIsRefreshing(true);
		setLastRefreshAttempt(Date.now());

		try {
			const refreshToken = AdminTokenStorage.getRefreshToken();
			if (!refreshToken) {
				// No refresh token, can't refresh
				router.push("/login");
				return;
			}

			const newToken = await refreshAdminAccessToken();
			if (!newToken) {
				// Failed to refresh, redirect to login
				router.push("/login");
			}
		} catch (error) {
			console.error("Admin token refresh failed:", error);

			// Don't redirect to login on network errors - might be temporary
			if (error instanceof TypeError && error.message.includes("fetch")) {
				console.error(
					"Network error during admin token refresh, will retry later"
				);
			} else {
				router.push("/login");
			}
		} finally {
			setIsRefreshing(false);
		}
	};

	// This component doesn't render anything
	return null;
}
