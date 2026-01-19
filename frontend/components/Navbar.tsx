"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { Menu, Phone, LayoutDashboard, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
	{ href: "#how-it-works", label: "How It Works" },
	{ href: "#products", label: "Products" },
	{ href: "#why-us", label: "Why Us" },
	{ href: "#faq", label: "FAQ" },
	{ href: "/about", label: "About", isPage: true },
];

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	const isHomePage = pathname === "/";

	useEffect(() => {
		const checkUserLoggedIn = () => {
			const token =
				document.cookie.includes("token=") ||
				localStorage.getItem("token");
			const refreshToken =
				document.cookie.includes("refreshToken=") ||
				localStorage.getItem("refreshToken");
			setIsLoggedIn(!!(token || refreshToken));
		};

		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		checkUserLoggedIn();
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		e.preventDefault();
		setSheetOpen(false);
		
		if (isHomePage) {
			// On homepage, scroll to section
			const id = href.replace("#", "");
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		} else {
			// Not on homepage, navigate to homepage with hash
			router.push("/" + href);
		}
	};

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? "bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
					: "bg-white/80 backdrop-blur-md border-b border-gray-100"
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Logo size="lg" variant="white" linkTo="/" />
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-1">
						{/* Section Links */}
						{navLinks.map((link) => (
							'isPage' in link && link.isPage ? (
								<Link
									key={link.href}
									href={link.href}
									className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-500 transition-colors rounded-lg hover:bg-gray-50"
								>
									{link.label}
								</Link>
							) : (
								<a
									key={link.href}
									href={link.href}
									onClick={(e) => handleSectionClick(e, link.href)}
									className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-500 transition-colors rounded-lg hover:bg-gray-50"
								>
									{link.label}
								</a>
							)
						))}

						{/* Divider */}
						<div className="w-px h-6 bg-gray-200 mx-2" />

						{/* WhatsApp Contact Button */}
						<div className="relative group">
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full border-2 border-gray-200 hover:border-teal-400 text-slate-600 hover:text-teal-400 hover:bg-transparent"
								asChild
							>
								<a
									href="https://wa.me/60164614919?text=I'm%20interested%20in%20Andas%20Capital%20lending%20products"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Phone className="h-5 w-5" />
									<span className="sr-only">Contact us on WhatsApp</span>
								</a>
							</Button>
							{/* Tooltip */}
							<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block pointer-events-none">
								<div className="bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap border border-gray-200">
									<div className="absolute left-1/2 -translate-x-1/2 -top-2">
										<div className="w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
									</div>
									Click to WhatsApp us or
									<br />
									Call us at +60 16-461 4919
								</div>
							</div>
						</div>

						{isLoggedIn ? (
							<Button
								className="bg-teal-400 hover:bg-teal-500 text-white rounded-full px-6"
								asChild
							>
								<Link href="/dashboard">
									<LayoutDashboard className="h-5 w-5 mr-2" />
									Dashboard
								</Link>
							</Button>
						) : (
							<>
								<Button
									variant="ghost"
									className="text-slate-600 hover:text-teal-400 hover:bg-transparent"
									asChild
								>
									<Link href="/login">Sign in</Link>
								</Button>
								<Button
									className="bg-teal-400 hover:bg-teal-500 text-white rounded-full px-6"
									asChild
								>
									<Link href="/signup">Get started</Link>
								</Button>
							</>
						)}
					</nav>

					{/* Mobile Menu */}
					<div className="lg:hidden">
						<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-slate-600 hover:text-teal-400 hover:bg-transparent"
								>
									<Menu className="h-6 w-6" />
									<span className="sr-only">Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-full sm:max-w-md bg-white">
								<SheetHeader className="text-left">
									<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
									<div className="pt-2">
										<Logo size="md" variant="white" />
									</div>
								</SheetHeader>

								<div className="flex flex-col h-full">
									{/* Navigation Links */}
									<div className="py-6 space-y-1">
										{navLinks.map((link) => (
											'isPage' in link && link.isPage ? (
												<Link
													key={link.href}
													href={link.href}
													onClick={() => setSheetOpen(false)}
													className="flex items-center px-4 py-3 text-lg font-medium text-slate-700 hover:text-teal-500 hover:bg-gray-50 rounded-xl transition-colors"
												>
													{link.label}
												</Link>
											) : (
												<a
													key={link.href}
													href={link.href}
													onClick={(e) => handleSectionClick(e, link.href)}
													className="flex items-center px-4 py-3 text-lg font-medium text-slate-700 hover:text-teal-500 hover:bg-gray-50 rounded-xl transition-colors"
												>
													{link.label}
												</a>
											)
										))}
									</div>

									{/* Contact Section */}
									<div className="flex-1 py-4 border-t border-gray-100">
										<h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
											Contact
										</h3>
										<div className="space-y-2">
											<a
												href="https://wa.me/60164614919?text=I'm%20interested%20in%20Andas%20Capital%20lending%20products"
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-4 text-slate-600 hover:text-teal-400 p-4 rounded-xl hover:bg-gray-50 transition-colors"
												onClick={() => setSheetOpen(false)}
											>
												<div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
													<MessageCircle className="h-5 w-5 text-teal-500" />
												</div>
												<div className="text-left">
													<span className="font-medium block">WhatsApp</span>
													<p className="text-sm text-slate-500">+60 16-461 4919</p>
												</div>
											</a>
											<a
												href="mailto:opgcapital3@gmail.com"
												className="flex items-center gap-4 text-slate-600 hover:text-teal-400 p-4 rounded-xl hover:bg-gray-50 transition-colors"
												onClick={() => setSheetOpen(false)}
											>
												<div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
													<Mail className="h-5 w-5 text-teal-500" />
												</div>
												<div className="text-left">
													<span className="font-medium block">Email</span>
													<p className="text-sm text-slate-500">opgcapital3@gmail.com</p>
												</div>
											</a>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="border-t border-gray-200 pt-6 pb-4 space-y-3">
										{isLoggedIn ? (
											<Button
												className="w-full bg-teal-400 hover:bg-teal-500 text-white rounded-full py-6"
												asChild
												onClick={() => setSheetOpen(false)}
											>
												<Link href="/dashboard">
													<LayoutDashboard className="h-5 w-5 mr-2" />
													Go to Dashboard
												</Link>
											</Button>
										) : (
											<>
												<Button
													variant="outline"
													className="w-full rounded-full py-6 border-gray-200 text-slate-600 hover:bg-gray-50"
													asChild
													onClick={() => setSheetOpen(false)}
												>
													<Link href="/login">Sign in</Link>
												</Button>
												<Button
													className="w-full bg-teal-400 hover:bg-teal-500 text-white rounded-full py-6"
													asChild
													onClick={() => setSheetOpen(false)}
												>
													<Link href="/signup">Get started</Link>
												</Button>
											</>
										)}
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
}
