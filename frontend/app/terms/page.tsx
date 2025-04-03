"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
	const [currentDate, setCurrentDate] = useState<string>("");

	useEffect(() => {
		setCurrentDate(new Date().toLocaleDateString());
	}, []);

	return (
		<div className="min-h-screen bg-white dark:bg-white">
			<Navbar />

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
				<h1 className="text-4xl md:text-5xl font-bold mb-8 text-black dark:text-black">
					Terms of Service
				</h1>

				<div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-600">
					<p className="text-lg mb-6">Last updated: {currentDate}</p>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							1. Agreement to Terms
						</h2>
						<p>
							By accessing or using Kapital&apos;s services, you
							agree to be bound by these Terms of Service. If you
							disagree with any part of the terms, you may not
							access our services.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							2. Use of Services
						</h2>
						<p className="mb-4">
							Our services are available only to users who can
							form legally binding contracts under applicable law.
							By using our services, you represent and warrant
							that:
						</p>
						<ul className="list-disc pl-6">
							<li>You are at least 18 years old</li>
							<li>
								You have the legal capacity to enter into
								binding contracts
							</li>
							<li>
								You will comply with these terms and all
								applicable laws
							</li>
							<li>
								The information you provide is accurate and
								complete
							</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							3. Financial Services
						</h2>
						<p className="mb-4">
							Our lending services are subject to:
						</p>
						<ul className="list-disc pl-6">
							<li>Credit approval</li>
							<li>Identity verification</li>
							<li>Documentation requirements</li>
							<li>Applicable lending regulations</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							4. User Accounts
						</h2>
						<p className="mb-4">
							When you create an account with us, you must:
						</p>
						<ul className="list-disc pl-6">
							<li>Provide accurate and complete information</li>
							<li>Maintain the security of your account</li>
							<li>
								Promptly update any changes to your information
							</li>
							<li>
								Accept responsibility for all activities under
								your account
							</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							5. Intellectual Property
						</h2>
						<p>
							The service and its original content, features, and
							functionality are owned by Kapital and are protected
							by international copyright, trademark, patent, trade
							secret, and other intellectual property laws.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							6. Limitation of Liability
						</h2>
						<p>
							In no event shall Kapital, nor its directors,
							employees, partners, agents, suppliers, or
							affiliates, be liable for any indirect, incidental,
							special, consequential, or punitive damages
							resulting from your use of the service.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							7. Changes to Terms
						</h2>
						<p>
							We reserve the right to modify or replace these
							terms at any time. We will provide notice of any
							changes by posting the new terms on our website.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-black dark:text-black mb-4">
							8. Contact Information
						</h2>
						<p>
							If you have any questions about these Terms, please
							contact us at:
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
