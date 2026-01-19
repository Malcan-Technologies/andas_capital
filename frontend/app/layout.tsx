import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({ 
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		template: "%s | Andas Capital",
		default: "Andas Capital - Trusted Financing Partner in Malaysia",
	},
	description:
		"Andas Capital provides flexible financing solutions tailored to your needs. Fast approvals, competitive rates, and personalized service for businesses and individuals across Malaysia.",
	keywords: [
		"business loans",
		"personal loans",
		"SME financing",
		"financing",
		"malaysia",
		"fintech",
		"andas capital",
	],
	metadataBase: new URL("https://andas.com.my"),
	openGraph: {
		title: "Andas Capital - Trusted Financing Partner in Malaysia",
		description:
			"Flexible financing solutions with fast approvals and competitive rates for businesses and individuals.",
		url: "https://andas.com.my",
		siteName: "Andas Capital",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Andas Capital - Trusted Financing Partner",
			},
		],
		locale: "en_MY",
		type: "website",
	},
	icons: {
		icon: [
			{ url: "/favicon.svg" },
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
		],
		other: [
			{
				rel: "mask-icon",
				url: "/safari-pinned-tab.svg",
				color: "#1a365d",
			},
		],
	},
	manifest: "/site.webmanifest",
	twitter: {
		card: "summary_large_image",
		title: "Andas Capital - Trusted Financing Partner in Malaysia",
		description:
			"Flexible financing solutions with fast approvals and competitive rates for businesses and individuals.",
		images: ["/og-image.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-site-verification",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${poppins.className} min-h-screen`}>
				<Providers>
					<div className="w-full min-h-screen">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
