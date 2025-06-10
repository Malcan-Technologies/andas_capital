import { useState, useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

	// Filter to only show active products
	const activeProducts = products.filter((product) => product.isActive);

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
				console.log("Updating existing application:", applicationId);

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
							appStep: 1,
							interestRate: selectedProduct.interestRate,
							lateFee: selectedProduct.lateFee,
							originationFee: selectedProduct.originationFee,
							legalFee: selectedProduct.legalFee,
							applicationFee: selectedProduct.applicationFee,
							status: "INCOMPLETE",
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
				console.log("Application updated:", data);

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
		<form onSubmit={handleSubmit} className="w-full">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				{activeProducts.map((product) => (
					<div
						key={product.id}
						className={`bg-gray-800/50 backdrop-blur-md border rounded-xl p-6 cursor-pointer transition-all hover:border-blue-400 ${
							selected === product.id
								? "border-blue-400 bg-blue-900/20"
								: "border-gray-700/50"
						}`}
						onClick={() => handleSelect(product.id)}
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-white">
								{product.name}
							</h3>
							{selected === product.id && (
								<CheckCircleIcon className="text-blue-400" />
							)}
						</div>
						<p className="text-gray-300 text-sm mb-4">
							{product.description}
						</p>
						<div className="space-y-2">
							<p className="text-sm text-gray-400">
								Loan Amount: RM
								{product.minAmount.toLocaleString()} - RM
								{product.maxAmount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-400">
								Interest Rate: {product.interestRate}% per month
							</p>
						</div>
					</div>
				))}
			</div>
			{error && <p className="text-red-400 text-sm mb-4">{error}</p>}
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={!selected || loading}
					className="px-6 py-3 bg-blue-600/80 backdrop-blur-md border border-blue-500/50 text-white rounded-lg hover:bg-blue-600/90 hover:border-blue-400/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
				>
					{loading ? "Processing..." : "Continue"}
				</button>
			</div>
		</form>
	);
}
