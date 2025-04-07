/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	swcMinify: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	distDir: ".next",
	skipMiddlewareUrlNormalize: true,
	skipTrailingSlashRedirect: true,
};

module.exports = config;
