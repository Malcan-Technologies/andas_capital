/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	output: "standalone",
	experimental: {
		// This disables the warning about Font Optimization
		optimizeFonts: true,
	},
};

module.exports = nextConfig;
