"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
	const [currentDate, setCurrentDate] = useState<string>("");

	useEffect(() => {
		setCurrentDate(new Date().toLocaleDateString());
	}, []);

	return (
		<div className="min-h-screen bg-white dark:bg-white">
			<Navbar />

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
				<h1 className="text-4xl md:text-5xl font-bold mb-8 text-black dark:text-black">
					Privacy Policy
				</h1>

				<div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-600">
					<p className="text-lg mb-6">Last updated: {currentDate}</p>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							1. Introduction
						</h2>
						<p>
							Kapital (&quot;we&quot;, &quot;our&quot;, or
							&quot;us&quot;) is committed to protecting your
							privacy. This Privacy Policy explains how we
							collect, use, disclose, and safeguard your
							information when you use our services.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							2. Information We Collect
						</h2>
						<h3 className="text-xl font-semibold text-black dark:text-black mb-2">
							2.1 Personal Information
						</h3>
						<p className="mb-4">
							We collect information that you provide directly to
							us, including:
						</p>
						<ul className="list-disc pl-6 mb-4">
							<li>Name and contact information</li>
							<li>National identification numbers</li>
							<li>Employment information</li>
							<li>Banking and financial information</li>
							<li>
								Other information necessary for loan processing
							</li>
						</ul>

						<h3 className="text-xl font-semibold text-black dark:text-black mb-2">
							2.2 Automatically Collected Information
						</h3>
						<p>
							When you access our services, we automatically
							collect:
						</p>
						<ul className="list-disc pl-6">
							<li>Device information</li>
							<li>Log data and usage patterns</li>
							<li>Location information</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							3. How We Use Your Information
						</h2>
						<p className="mb-4">
							We use the collected information to:
						</p>
						<ul className="list-disc pl-6">
							<li>Process loan applications</li>
							<li>Verify your identity</li>
							<li>Communicate with you about our services</li>
							<li>Improve our services</li>
							<li>Comply with legal obligations</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							4. Information Sharing
						</h2>
						<p className="mb-4">
							We may share your information with:
						</p>
						<ul className="list-disc pl-6">
							<li>Service providers and business partners</li>
							<li>Regulatory authorities</li>
							<li>Credit reporting agencies</li>
							<li>Law enforcement when required by law</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							5. Data Security
						</h2>
						<p>
							We implement appropriate technical and
							organizational measures to protect your personal
							information. However, no method of transmission over
							the Internet is 100% secure.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							6. Your Rights
						</h2>
						<p className="mb-4">You have the right to:</p>
						<ul className="list-disc pl-6">
							<li>Access your personal information</li>
							<li>Correct inaccurate information</li>
							<li>Request deletion of your information</li>
							<li>Object to processing of your information</li>
							<li>Data portability</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							7. Contact Us
						</h2>
						<p>
							If you have any questions about this Privacy Policy,
							please contact us at:
						</p>
						<ul className="list-none mt-4">
							<li>Email: legal@kapital.com</li>
							<li>Phone: +60 12-345 6789</li>
						</ul>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
