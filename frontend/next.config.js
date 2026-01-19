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
};

module.exports = config;
