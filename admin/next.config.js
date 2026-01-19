/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	typescript: {
		ignoreBuildErrors: true,
	},
	// Set turbopack root to this directory to avoid lockfile confusion
	turbopack: {
		root: __dirname,
	},
};

module.exports = nextConfig;
