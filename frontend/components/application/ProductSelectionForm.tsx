import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { ProductType } from "@/types";

// Define local Product interface for backward compatibility
interface Product extends ProductType {}

interface ProductSelectionFormProps {
	products: Product[];
	onSubmit: (values: { productId: string }) => void;
	onProductSelect: (productId: string | null) => void;
	onProductPreview: (productId: string | null) => void;
	showBackButton?: boolean;
	selectedProduct: Product | null;
}

export default function ProductSelectionForm({
	products,
	onSubmit,
	onProductSelect,
	onProductPreview,
	showBackButton = true,
	selectedProduct,
}: ProductSelectionFormProps) {
	const searchParams = useSearchParams();
	const [selected, setSelected] = useState<string>(selectedProduct?.id || "");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// Filter to only show active products and separate by collateral requirement
	const activeProducts = products.filter((product) => product.isActive);
	const collateralProducts = activeProducts.filter((product) => product.collateralRequired);
	const nonCollateralProducts = activeProducts.filter((product) => !product.collateralRequired);

	useEffect(() => {
		setSelected(selectedProduct?.id || "");
	}, [selectedProduct]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selected) {
			setError("Please select a product");
			return;
		}

		try {
			setLoading(true);
			setError("");

			// Get application ID from URL params
			const applicationId = searchParams.get("applicationId");
			const productCode = searchParams.get("productCode");

			if (!selectedProduct) {
				throw new Error("No product selected");
			}

			const token = localStorage.getItem("token") || Cookies.get("token");
			if (!token) {
				throw new Error("No authentication token found");
			}

			// If we're in an existing flow, update the application
			if (applicationId) {

					// Determine status based on collateral requirement
					const newStatus = selectedProduct.collateralRequired ? "COLLATERAL_REVIEW" : "INCOMPLETE";

					const response = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${applicationId}`,
						{
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({
								productId: selected,
								// Don't set appStep for collateral loans - let DocumentUploadForm handle the flow
								...(selectedProduct.collateralRequired ? {} : { appStep: 1 }),
								interestRate: selectedProduct.interestRate,
								originationFee: selectedProduct.originationFee,
								legalFee: selectedProduct.legalFee,
								applicationFee: selectedProduct.applicationFee,
								status: newStatus,
							}),
						}
					);

				if (!response.ok) {
					const errorData = await response.json().catch(() => null);
					console.error("Error response:", errorData);
					throw new Error(
						errorData?.message ||
							`Failed to update application: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();

				// Call the onSubmit handler with the updated application
				onSubmit({ productId: selected });
			} else {
				// For new applications, just call the onSubmit handler
				onSubmit({ productId: selected });
			}
		} catch (err) {
			console.error("Error submitting form:", err);
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleSelect = (productId: string) => {
		setSelected(productId);
		onProductSelect(productId);
		onProductPreview(productId);
	};

	return (
		<div>
			<form onSubmit={handleSubmit} className="w-full">
					{/* Non-Collateral Loans Section */}
					{nonCollateralProducts.length > 0 && (
						<div className="mb-8 lg:mb-12">
							<div className="mb-6">
								<h3 className="text-xl lg:text-2xl font-heading font-bold text-gray-700 mb-2">
									Unsecured Loans
								</h3>
								<p className="text-sm lg:text-base text-gray-600 font-body">
									No collateral required. Quick approval with document verification and standard application workflow. These loans offer convenient access to funds without needing to pledge assets as security.
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
								{nonCollateralProducts.map((product) => (
									<div
										key={product.id}
										className={`border rounded-xl lg:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:border-purple-primary hover:shadow-md ${
											selected === product.id
												? "border-purple-primary bg-purple-50 shadow-md"
												: "bg-white border-gray-200"
										}`}
										onClick={() => handleSelect(product.id)}
									>
										<div className="flex justify-between items-start mb-4">
											<div className="flex-1">
												<h4 className="text-lg lg:text-xl font-semibold text-gray-700 font-heading mb-2">
													{product.name}
												</h4>
												<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
													No Collateral
												</span>
											</div>
											{selected === product.id && (
												<CheckCircleIcon className="h-6 w-6 text-purple-primary flex-shrink-0 ml-2" />
											)}
										</div>
										<p className="text-gray-600 text-sm lg:text-base mb-4 font-body">
											{product.description}
										</p>
										<div className="space-y-2">
											<p className="text-sm lg:text-base text-gray-500 font-body">
												Loan Amount: RM
												{product.minAmount.toLocaleString()} - RM
												{product.maxAmount.toLocaleString()}
											</p>
											<p className="text-sm lg:text-base text-gray-500 font-body">
												Interest Rate: {product.interestRate}% per month
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Collateral Loans Section */}
					{collateralProducts.length > 0 && (
						<div className="mb-8 lg:mb-12">
							<div className="mb-6">
								<h3 className="text-xl lg:text-2xl font-heading font-bold text-gray-700 mb-2">
									Secured Loans
								</h3>
								<p className="text-sm lg:text-base text-gray-600 font-body">
									Collateral required for security. Higher loan amounts with competitive rates and direct review by our credit team. Collateral evaluation is conducted as part of the approval process.
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
								{collateralProducts.map((product) => (
									<div
										key={product.id}
										className={`border rounded-xl lg:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:border-purple-primary hover:shadow-md ${
											selected === product.id
												? "border-purple-primary bg-purple-50 shadow-md"
												: "bg-white border-gray-200"
										}`}
										onClick={() => handleSelect(product.id)}
									>
										<div className="flex justify-between items-start mb-4">
											<div className="flex-1">
												<h4 className="text-lg lg:text-xl font-semibold text-gray-700 font-heading mb-2">
													{product.name}
												</h4>
												<span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
													Collateral Required
												</span>
											</div>
											{selected === product.id && (
												<CheckCircleIcon className="h-6 w-6 text-purple-primary flex-shrink-0 ml-2" />
											)}
										</div>
										<p className="text-gray-600 text-sm lg:text-base mb-4 font-body">
											{product.description}
										</p>
										<div className="space-y-2">
											<p className="text-sm lg:text-base text-gray-500 font-body">
												Loan Amount: RM
												{product.minAmount.toLocaleString()} - RM
												{product.maxAmount.toLocaleString()}
											</p>
											<p className="text-sm lg:text-base text-gray-500 font-body">
												Interest Rate: {product.interestRate}% per month
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
							<p className="text-red-600 text-sm lg:text-base font-body">{error}</p>
						</div>
					)}
					<div className="border-t border-gray-100 pt-6 lg:pt-8">
						<div className="flex justify-end">
							<button
								type="submit"
								disabled={!selected || loading}
								className="w-full sm:w-auto px-8 py-3 lg:py-4 bg-purple-primary text-white rounded-xl lg:rounded-2xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium font-body shadow-lg hover:shadow-xl text-sm lg:text-base"
							>
								{loading ? "Processing..." : "Continue"}
							</button>
						</div>
					</div>
				</form>
		</div>
	);
}
