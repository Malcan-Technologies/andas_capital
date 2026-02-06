/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	distDir: ".next",
	skipTrailingSlashRedirect: true,
	// Enable standalone output for Docker deployment
	output: "standalone",
	// Set turbopack root to this directory to avoid lockfile confusion
	turbopack: {
		root: __dirname,
	},
	images: {
		qualities: [100, 75],
	},
	// Security headers to mitigate clickjacking, MIME sniffing, and enforce HTTPS
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.andas.com.my; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
};

module.exports = config;
