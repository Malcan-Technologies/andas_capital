/**
 * Utility function to generate proper API URLs and avoid the /api/api duplication
 * This provides a transition strategy that will work with both URL patterns
 */

// The base API URL from environment variables
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Formats an API endpoint URL properly to avoid /api/api duplication
 * @param endpoint - API endpoint path (should start with /)
 * @returns Properly formatted API URL
 */
export function getApiUrl(endpoint: string): string {
	// Remove any leading slashes from the endpoint
	const cleanEndpoint = endpoint.startsWith("/")
		? endpoint.slice(1)
		: endpoint;

	// Check if the endpoint already starts with "api/"
	const apiPrefix = cleanEndpoint.startsWith("api/") ? "" : "api/";

	// Ensure baseUrl doesn't end with a slash
	const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

	// Combine the parts
	return `${cleanBaseUrl}/${apiPrefix}${cleanEndpoint}`;
}

/**
 * Makes a fetch request to the API
 * @param endpoint - API endpoint path (should start with /)
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export async function fetchApi<T>(
	endpoint: string,
	options?: RequestInit
): Promise<T> {
	const url = getApiUrl(endpoint);
	const response = await fetch(url, options);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			`API request failed: ${response.status} ${
				response.statusText
			} ${JSON.stringify(errorData)}`
		);
	}

	return response.json();
}

/**
 * Makes an authenticated fetch request to the API
 * @param endpoint - API endpoint path (should start with /)
 * @param token - Authorization token
 * @param options - Additional fetch options
 * @returns Promise with the fetch response
 */
export async function fetchAuthApi<T>(
	endpoint: string,
	token: string,
	options?: RequestInit
): Promise<T> {
	const headers = {
		Authorization: `Bearer ${token.replace(/^"|"$/g, "")}`,
		"Content-Type": "application/json",
		...(options?.headers || {}),
	};

	return fetchApi<T>(endpoint, {
		...options,
		headers,
	});
}
