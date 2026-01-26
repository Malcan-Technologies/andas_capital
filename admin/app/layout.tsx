import { Inter, Rethink_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ 
	subsets: ["latin"],
	variable: "--font-inter",
});

const rethinkSans = Rethink_Sans({ 
	subsets: ["latin"],
	variable: "--font-rethink-sans",
});

export const metadata = {
	title: "Andas Capital | Admin",
	description: "Admin dashboard for Andas Capital",
	icons: {
		icon: [
			{ url: "/favicon.svg" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={`h-full bg-gray-50 ${inter.variable} ${rethinkSans.variable}`}>
			<body className={`h-full ${inter.className}`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
