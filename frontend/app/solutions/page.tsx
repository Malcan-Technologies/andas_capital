"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useState } from "react";
import { MdArrowForward, MdCheck } from "react-icons/md";

type ProductType = {
	id: string;
	title: string;
	description: string;
	features: string[];
	maxAmount: string;
	category: "borrow" | "invest" | "credit";
	colorTheme: {
		primary: string;
		background: string;
		iconBg: string;
		border: string;
	};
	icon: string;
	learnMoreLink: string;
	applyLink: string;
	isAvailable: boolean;
};

export default function Products() {
	useDocumentTitle("Solutions");

	const [activeCategory, setActiveCategory] = useState<
		"all" | "borrow" | "invest" | "credit"
	>("all");

	const products: ProductType[] = [
		{
			id: "sme-term-loan",
			title: "SME Term Loan",
			description:
				"Term loans for business expansion, working capital, and growth opportunities with competitive rates.",
			features: [
				"Up to RM 1,000,000 financing",
				"6 to 24 months terms",
				"1.5% monthly interest",
				"Quick 3-day approval",
			],
			maxAmount: "Up to RM 1,000,000",
			category: "borrow",
			colorTheme: {
				primary: "blue-600",
				background: "blue-50",
				iconBg: "blue-600/10",
				border: "blue-600",
			},
			icon: "/business-loan.svg",
			learnMoreLink: "/sme-term-loan",
			applyLink: "/apply",
			isAvailable: true,
		},
		{
			id: "personal-loan",
			title: "Personal Loan",
			description:
				"Fast financing for personal needs with streamlined digital process and competitive rates.",
			features: [
				"Up to RM 150,000 financing",
				"24-48 hour approval",
				"100% digital process",
				"Competitive rates",
			],
			maxAmount: "Up to RM 150,000",
			category: "borrow",
			colorTheme: {
				primary: "blue-600",
				background: "blue-50",
				iconBg: "blue-600/10",
				border: "blue-600",
			},
			icon: "/wishes.svg",
			learnMoreLink: "/personal-loan",
			applyLink: "/apply",
			isAvailable: true,
		},
		{
			id: "payadvance",
			title: "PayAdvance™",
			description:
				"Access earned wages before payday with our innovative employee benefit solution.",
			features: [
				"Up to 1 month salary",
				"No cost to employers",
				"Instant access to wages",
				"Easy payroll integration",
			],
			maxAmount: "Up to 1 month gross salary",
			category: "borrow",
			colorTheme: {
				primary: "emerald-600",
				background: "emerald-50",
				iconBg: "emerald-600/10",
				border: "emerald-600",
			},
			icon: "/camping.svg",
			learnMoreLink: "/pay-advance",
			applyLink: "/apply",
			isAvailable: true,
		},
		{
			id: "private-credit",
			title: "Private Credit Investments",
			description:
				"Access exclusive private credit opportunities with competitive returns and monthly income.",
			features: [
				"Up to 8% annual returns",
				"Monthly distributions",
				"Secured investments",
				"Minimum RM 10,000",
			],
			maxAmount: "Minimum RM 10,000",
			category: "invest",
			colorTheme: {
				primary: "gray-800",
				background: "gray-50",
				iconBg: "gray-800/10",
				border: "gray-800",
			},
			icon: "/invest.svg",
			learnMoreLink: "/about",
			applyLink: "/apply",
			isAvailable: true,
		},
		{
			id: "credit-analytics",
			title: "Credit Analytics",
			description:
				"Comprehensive credit reports and business verification powered by CTOS and SSM data.",
			features: [
				"CTOS credit reports",
				"SSM business verification",
				"Real-time monitoring",
				"Instant delivery",
			],
			maxAmount: "Starting from RM 50",
			category: "credit",
			colorTheme: {
				primary: "purple-primary",
				background: "purple-50",
				iconBg: "purple-primary/10",
				border: "purple-primary",
			},
			icon: "/analytics.svg",
			learnMoreLink: "/credit-score+",
			applyLink: "/credit-score+",
			isAvailable: true,
		},
		{
			id: "credit-score-plus",
			title: "Credit Score+",
			description:
				"Build and improve your credit score with our structured credit building program.",
			features: [
				"Structured credit building",
				"Monthly progress tracking",
				"CTOS score improvement",
				"Syariah compliant",
			],
			maxAmount: "Credit building program",
			category: "credit",
			colorTheme: {
				primary: "yellow-600",
				background: "yellow-50",
				iconBg: "yellow-500/10",
				border: "yellow-500",
			},
			icon: "/credit-score.svg",
			learnMoreLink: "/credit-score+",
			applyLink: "/apply",
			isAvailable: true,
		},
	];

	const categories = [
		{ id: "all", label: "All Products", count: products.length },
		{
			id: "borrow",
			label: "Borrow",
			count: products.filter((p) => p.category === "borrow").length,
		},
		{
			id: "invest",
			label: "Invest",
			count: products.filter((p) => p.category === "invest").length,
		},
		{
			id: "credit",
			label: "Credit",
			count: products.filter((p) => p.category === "credit").length,
		},
	];

	const filteredProducts =
		activeCategory === "all"
			? products
			: products.filter((product) => product.category === activeCategory);

	return (
		<main className="min-h-screen bg-offwhite">
			<Navbar />

			{/* Hero Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full pt-32">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Section Header */}
					<div className="text-center mb-8 lg:mb-12">
						<div className="inline-flex items-center px-4 py-2 bg-purple-primary/10 rounded-full mb-4 sm:mb-6 border border-purple-primary/20">
							<span className="text-xs sm:text-sm font-semibold text-purple-primary">
								Our Solutions
							</span>
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
							Financial Solutions
							<br />
							<span className="text-purple-primary">
								Built for Malaysia
							</span>
						</h1>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-4xl">
							Choose from our range of carefully crafted financial
							products designed to support your business and
							lifestyle
						</p>
					</div>

					{/* Filter Tabs */}
					<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 lg:mb-12">
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() =>
									setActiveCategory(
										category.id as typeof activeCategory
									)
								}
								className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
									activeCategory === category.id
										? "bg-purple-primary text-white shadow-lg"
										: "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
								}`}
							>
								{category.label}
								<span
									className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
										activeCategory === category.id
											? "bg-white/20 text-white"
											: "bg-gray-100 text-gray-500"
									}`}
								>
									{category.count}
								</span>
							</button>
						))}
					</div>

					{/* Products Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						{filteredProducts.map((product) => (
							<div
								key={product.id}
								className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group ${
									!product.isAvailable ? "opacity-60" : ""
								}`}
							>
								{/* Card Header */}
								<div
									className={`bg-${product.colorTheme.background} p-6 relative overflow-hidden`}
								>
									{/* Background decoration */}
									<div
										className={`absolute top-4 right-4 w-16 h-16 bg-${product.colorTheme.primary}/10 rounded-full blur-xl`}
									></div>
									<div
										className={`absolute bottom-4 left-4 w-12 h-12 bg-${product.colorTheme.primary}/5 rounded-full blur-lg`}
									></div>

									{/* Icon and Title */}
									<div className="relative flex items-center gap-4 mb-4">
										<div
											className={`w-14 h-14 bg-${product.colorTheme.iconBg} rounded-xl flex items-center justify-center border border-${product.colorTheme.border}/20`}
										>
											<div className="relative h-8 w-8">
												<Image
													src={product.icon}
													alt={product.title}
													fill
													className="object-contain"
												/>
											</div>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="text-xl font-heading font-bold text-gray-700">
													{product.title}
												</h3>
												{product.id ===
													"payadvance" && (
													<span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full border border-emerald-600/30">
														New
													</span>
												)}
											</div>
											<span
												className={`text-sm px-3 py-1 bg-${product.colorTheme.primary}/10 text-${product.colorTheme.primary} rounded-full font-medium`}
											>
												{product.maxAmount}
											</span>
										</div>
									</div>
								</div>

								{/* Card Content */}
								<div className="p-6">
									<p className="text-gray-600 mb-6 font-body leading-relaxed">
										{product.description}
									</p>

									{/* Features */}
									<div className="space-y-3 mb-6">
										{product.features.map(
											(feature, index) => (
												<div
													key={index}
													className="flex items-center gap-3"
												>
													<div
														className={`w-5 h-5 rounded-full bg-${product.colorTheme.primary}/10 flex items-center justify-center flex-shrink-0`}
													>
														<MdCheck
															size={12}
															className={`text-${product.colorTheme.primary}`}
														/>
													</div>
													<span className="text-sm text-gray-600 font-body">
														{feature}
													</span>
												</div>
											)
										)}
									</div>

									{/* CTAs */}
									{product.isAvailable ? (
										<div className="flex gap-3">
											<Link
												href={product.applyLink}
												className={`flex-1 text-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-${
													product.colorTheme.primary
												} text-white hover:bg-${
													product.colorTheme
														.primary ===
													"yellow-500"
														? "yellow-600"
														: product.colorTheme
																.primary ===
														  "emerald-600"
														? "emerald-700"
														: product.colorTheme
																.primary ===
														  "gray-800"
														? "gray-900"
														: product.colorTheme
																.primary ===
														  "purple-primary"
														? "purple-700"
														: "blue-700"
												} inline-flex items-center justify-center`}
											>
												{product.category === "invest"
													? "Start Investing"
													: product.category ===
													  "credit"
													? "Get Started"
													: "Apply Now"}
												<MdArrowForward
													size={16}
													className="ml-1"
												/>
											</Link>
											<Link
												href={product.learnMoreLink}
												className={`flex-1 text-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border-2 border-${product.colorTheme.border} text-${product.colorTheme.primary} hover:bg-${product.colorTheme.background} inline-flex items-center justify-center`}
											>
												Learn More
											</Link>
										</div>
									) : (
										<div className="w-full text-center text-gray-500 px-4 py-2.5 rounded-lg font-semibold bg-gray-100 text-sm">
											Coming Soon
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{/* Results Summary */}
					<div className="text-center mt-8 lg:mt-12">
						<p className="text-gray-500 font-body">
							Showing {filteredProducts.length} of{" "}
							{products.length} products
							{activeCategory !== "all" && (
								<span className="ml-2">
									in{" "}
									<span className="font-semibold capitalize">
										{activeCategory}
									</span>
								</span>
							)}
						</p>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
