"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
	MdMenu,
	MdClose,
	MdKeyboardArrowDown,
	MdGroups,
	MdDirectionsCar,
	MdCreditCard,
	MdBusinessCenter,
	MdAccountBalance,
	MdApartment,
	MdShowChart,
	MdInfo,
	MdWork,
	MdArticle,
	MdHelp,
	MdPhone,
} from "react-icons/md";

type NavbarProps = {
	bgStyle?: string;
};

type ActiveMenu = "none" | "borrow" | "resources";

export default function Navbar({
	bgStyle = "bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900",
}: NavbarProps) {
	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeMenu, setActiveMenu] = useState<ActiveMenu>("none");
	const navRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (
				navRef.current &&
				!navRef.current.contains(event.target as Node)
			) {
				setActiveMenu("none");
				setMobileMenuOpen(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleMenuClick = (menu: ActiveMenu) => {
		setActiveMenu(activeMenu === menu ? "none" : menu);
	};

	return (
		<nav
			ref={navRef}
			className={`fixed w-full z-50 transition-colors duration-300 ${
				isScrolled
					? "bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900"
					: bgStyle
			} border-b border-white/10 backdrop-blur-md dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex items-center">
						<Link href="/" className="relative w-32 h-8">
							<Image
								src="/logo-white-large.svg"
								alt="Kapital"
								fill
								className="object-contain"
								priority
							/>
						</Link>
					</div>
					<div className="hidden md:flex items-center justify-center flex-1 space-x-8 px-16">
						<div className="relative">
							<button
								onClick={() => handleMenuClick("borrow")}
								className="text-gray-200 hover:text-white dark:text-gray-200 dark:hover:text-white transition-colors flex items-center gap-1"
							>
								Borrow
								<div
									className={`transition-transform duration-200 ${
										activeMenu === "borrow"
											? "rotate-180"
											: ""
									}`}
								>
									<MdKeyboardArrowDown size={16} />
								</div>
							</button>
						</div>
						<div className="relative">
							<button
								onClick={() => handleMenuClick("resources")}
								className="text-gray-200 hover:text-white dark:text-gray-200 dark:hover:text-white transition-colors flex items-center gap-1"
							>
								Resources
								<div
									className={`transition-transform duration-200 ${
										activeMenu === "resources"
											? "rotate-180"
											: ""
									}`}
								>
									<MdKeyboardArrowDown size={16} />
								</div>
							</button>
						</div>
					</div>
					<div className="hidden md:flex items-center space-x-6">
						<div className="relative group">
							<a
								href="https://wa.me/60164614919?text=I'm%20interested%20in%20Kapital%20lending%20products"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 hover:border-white text-gray-200 hover:text-white transition-colors"
							>
								<MdPhone size={20} />
							</a>
							<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block">
								<div className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
									<div className="absolute left-1/2 -translate-x-1/2 -top-2">
										<div className="w-4 h-4 bg-white transform rotate-45"></div>
									</div>
									Click to WhatsApp us or
									<br />
									Call us at +60 3-1234 5678
								</div>
							</div>
						</div>
						<Link
							href="/login"
							className="text-gray-200 hover:text-white px-4 py-2 rounded-full transition-colors"
						>
							Sign in
						</Link>
						<Link
							href="/apply"
							className="font-semibold bg-white text-purple-900 px-4 py-2 rounded-full hover:bg-purple-50 transition-all"
						>
							Get started
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<div className="flex md:hidden">
						<button
							onClick={() => setMobileMenuOpen(true)}
							className="text-white hover:text-gray-200"
						>
							<span className="sr-only">Open menu</span>
							<MdMenu size={24} />
						</button>
					</div>
				</div>

				{/* Mega Menu Container */}
				<div
					className={`absolute left-0 right-0 mt-1 transition-all duration-200 ${
						activeMenu === "none"
							? "opacity-0 invisible"
							: "opacity-100 visible"
					}`}
				>
					<div className="max-w-7xl mx-auto">
						<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
							{activeMenu === "borrow" && (
								<div className="grid grid-cols-3 gap-8">
									{/* Business Solutions Column */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											Business Solutions
										</h3>
										<div className="space-y-4">
											<Link
												href="/pay-advance"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
													<MdGroups
														size={24}
														color="#9333EA"
													/>
												</div>
												<div>
													<div className="flex items-center gap-2">
														<h4 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
															PayAdvance™
														</h4>
														<span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
															New
														</span>
													</div>
													<p className="text-sm text-gray-500">
														Instant salary advances
														for your employees
													</p>
												</div>
											</Link>
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
													<MdDirectionsCar
														size={24}
														color="#2563EB"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
														Auto Dealer Financing
													</h4>
													<p className="text-sm text-gray-500">
														Specialized financing
														for dealerships
													</p>
												</div>
											</Link>
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
													<MdCreditCard
														size={24}
														color="#2563EB"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
														Business Line of Credit
													</h4>
													<p className="text-sm text-gray-500">
														Flexible credit for
														managing cash flow
													</p>
												</div>
											</Link>
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
													<MdBusinessCenter
														size={24}
														color="#2563EB"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
														Business Term Loan
													</h4>
													<p className="text-sm text-gray-500">
														Term loans for business
														expansion
													</p>
												</div>
											</Link>
										</div>
									</div>

									{/* Personal Solutions Column */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											Personal Solutions
										</h3>
										<div className="space-y-4">
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
													<MdAccountBalance
														size={24}
														color="#059669"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
														Lifestyle Term Loan
													</h4>
													<p className="text-sm text-gray-500">
														Quick and flexible
														personal loans
													</p>
												</div>
											</Link>
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
													<MdApartment
														size={24}
														color="#059669"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
														Property-Backed
														Financing
													</h4>
													<p className="text-sm text-gray-500">
														Better rates with
														property collateral
													</p>
												</div>
											</Link>
											<Link
												href="/products"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
													<MdShowChart
														size={24}
														color="#059669"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
														Lease-to-Own Financing
													</h4>
													<p className="text-sm text-gray-500">
														Vehicle-backed financing
														solutions
													</p>
												</div>
											</Link>
										</div>
									</div>

									{/* CTA Column - Borrow Menu */}
									<div className="bg-gray-50 rounded-xl p-6">
										<div className="relative h-32 mb-4">
											<Image
												src="/decide.svg"
												alt="Happy customer"
												fill
												className="object-contain object-left"
											/>
										</div>
										<div className="mb-4">
											<h3 className="text-lg font-semibold text-gray-900 mb-2">
												Ready to get started?
											</h3>
											<p className="text-sm text-gray-600">
												Apply now and get approved
												within 24 hours
											</p>
										</div>
										<Link
											href="/products"
											className="inline-block text-blue-600 hover:text-blue-700 font-medium"
										>
											See all products →
										</Link>
									</div>
								</div>
							)}

							{activeMenu === "resources" && (
								<div className="grid grid-cols-3 gap-8">
									{/* Company Column */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											Company
										</h3>
										<div className="space-y-4">
											<Link
												href="/about"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
													<MdInfo
														size={24}
														color="#4F46E5"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
														About Us
													</h4>
													<p className="text-sm text-gray-500">
														Learn more about our
														mission and values
													</p>
												</div>
											</Link>
											<Link
												href="/careers"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
													<MdWork
														size={24}
														color="#4F46E5"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
														Careers
													</h4>
													<p className="text-sm text-gray-500">
														Join our team and make
														an impact
													</p>
												</div>
											</Link>
										</div>
									</div>

									{/* Resources Column */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											Resources
										</h3>
										<div className="space-y-4">
											<Link
												href="/blog"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
													<MdArticle
														size={24}
														color="#4F46E5"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
														Blog
													</h4>
													<p className="text-sm text-gray-500">
														Latest insights and
														updates
													</p>
												</div>
											</Link>
											<Link
												href="/help"
												className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-gray-50"
											>
												<div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
													<MdHelp
														size={24}
														color="#4F46E5"
													/>
												</div>
												<div>
													<h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
														Help Center
													</h4>
													<p className="text-sm text-gray-500">
														Get answers to your
														questions
													</p>
												</div>
											</Link>
										</div>
									</div>

									{/* CTA Column - Resources Menu */}
									<div className="bg-gray-50 rounded-xl p-6">
										<div className="relative h-32 mb-4">
											<Image
												src="/help.svg"
												alt="Support"
												fill
												className="object-contain object-left"
											/>
										</div>
										<div className="mb-4">
											<h3 className="text-lg font-semibold text-gray-900 mb-2">
												Need help?
											</h3>
											<p className="text-sm text-gray-600">
												Our support team is here for you
												24/7
											</p>
										</div>
										<Link
											href="https://wa.me/60312345678"
											className="inline-block text-blue-600 hover:text-blue-700 font-medium"
										>
											Contact our support team →
										</Link>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Menu Dialog */}
			<div
				className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
					mobileMenuOpen
						? "opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={() => setMobileMenuOpen(false)}
			>
				<div
					className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ${
						mobileMenuOpen ? "translate-x-0" : "translate-x-full"
					}`}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="relative p-6">
						<button
							onClick={() => setMobileMenuOpen(false)}
							className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
						>
							<span className="sr-only">Close menu</span>
							<MdClose size={24} />
						</button>

						{/* ... rest of the mobile menu content ... */}
					</div>
				</div>
			</div>
		</nav>
	);
}
