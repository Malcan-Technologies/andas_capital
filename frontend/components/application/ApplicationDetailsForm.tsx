import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Product {
	id: string;
	name: string;
	description: string;
	maxAmount: number;
	minAmount: number;
	features: string[];
	requirements?: string[];
	loanTypes?: string[];
	repaymentTerms: number[]; // Array of months
	interestRate: number; // Monthly interest rate in percentage
	legalFee: number; // Legal fee in percentage
	originationFee: number; // Origination fee in percentage
}

interface ApplicationDetails {
	loanAmount: string;
	loanPurpose: string;
	loanTerm: string;
	monthlyRepayment: string;
	interestRate: string;
	legalFee: string;
	originationFee: string;
	netDisbursement: string;
}

interface ApplicationDetailsFormProps {
	onSubmit: (values: ApplicationDetails) => void;
	onBack: () => void;
	selectedProduct: Product;
}

// Create a client component for handling searchParams
function ApplicationDetailsFormContent({
	onSubmit,
	onBack,
	selectedProduct,
}: ApplicationDetailsFormProps) {
	const searchParams = useSearchParams();
	const [formValues, setFormValues] = useState<ApplicationDetails>({
		loanAmount: "",
		loanPurpose: "",
		loanTerm: "",
		monthlyRepayment: "",
		interestRate: "",
		legalFee: "",
		originationFee: "",
		netDisbursement: "",
	});
	const [errors, setErrors] = useState<Partial<ApplicationDetails>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Get application ID from URL params
				const applicationId = searchParams.get("applicationId");
				console.log("Application ID from URL:", applicationId);

				// Get product code from URL params
				const productCode = searchParams.get("productCode");
				if (!productCode) {
					throw new Error("Product code not found in URL");
				}

				console.log("Fetching application data for ID:", applicationId);

				// Fetch application data
				const token = localStorage.getItem("token");
				const applicationResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${applicationId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!applicationResponse.ok) {
					throw new Error("Failed to fetch application data");
				}

				const applicationData = await applicationResponse.json();
				console.log("Application data:", applicationData);

				// Set form values from application data if available
				if (applicationData) {
					setFormValues({
						loanAmount: applicationData.amount?.toString() || "",
						loanPurpose: applicationData.purpose || "",
						loanTerm: applicationData.term?.toString() || "",
						monthlyRepayment:
							applicationData.monthlyRepayment?.toString() || "",
						interestRate:
							applicationData.interestRate?.toString() || "",
						legalFee: applicationData.legalFee?.toString() || "",
						originationFee:
							applicationData.originationFee?.toString() || "",
						netDisbursement:
							applicationData.netDisbursement?.toString() || "",
					});
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An error occurred"
				);
				console.error("Error fetching data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [searchParams]);

	// Helper function to format term display
	const formatTermDisplay = (months: number) => {
		return `${months} Month${months > 1 ? "s" : ""}`;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validateForm = () => {
		const newErrors: Partial<ApplicationDetails> = {};
		let isValid = true;

		if (!formValues.loanAmount) {
			newErrors.loanAmount = "Loan amount is required";
			isValid = false;
		} else {
			const amount = parseFloat(formValues.loanAmount);
			if (isNaN(amount) || amount <= 0) {
				newErrors.loanAmount = "Please enter a valid amount";
				isValid = false;
			} else if (amount > selectedProduct.maxAmount) {
				newErrors.loanAmount = `Amount exceeds maximum limit of ${selectedProduct.maxAmount}`;
				isValid = false;
			}
		}

		if (
			(selectedProduct.loanTypes ?? []).length > 0 &&
			!formValues.loanPurpose
		) {
			newErrors.loanPurpose = "Loan purpose is required";
			isValid = false;
		}

		if (!formValues.loanTerm) {
			newErrors.loanTerm = "Loan term is required";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			const loanAmount = parseFloat(formValues.loanAmount);
			const termInMonths = parseInt(formValues.loanTerm);

			// Calculate monthly repayment
			const monthlyRepayment = calculateMonthlyRepayment(
				loanAmount,
				termInMonths
			);

			// Calculate exact legal fee value (not percentage)
			const legalFeeValue = (loanAmount * selectedProduct.legalFee) / 100;

			// Calculate exact origination fee value (not percentage)
			const originationFeeValue =
				(loanAmount * selectedProduct.originationFee) / 100;

			// Calculate net disbursement
			const netDisbursementValue =
				loanAmount - legalFeeValue - originationFeeValue;

			const submissionValues = {
				...formValues,
				monthlyRepayment,
				interestRate: selectedProduct.interestRate.toString(), // Keep as percentage
				legalFee: legalFeeValue.toFixed(2),
				originationFee: originationFeeValue.toFixed(2),
				netDisbursement: netDisbursementValue.toFixed(2),
				loanPurpose:
					(selectedProduct.loanTypes ?? []).length > 0
						? formValues.loanPurpose
						: "",
			};
			onSubmit(submissionValues);
		}
	};

	const calculateMonthlyRepayment = (
		principal: number,
		termInMonths: number
	) => {
		// Convert interest rate from percentage to decimal
		const monthlyInterestRate = selectedProduct.interestRate / 100;

		// Calculate total interest for the loan period (flat rate)
		const totalInterest = principal * monthlyInterestRate * termInMonths;

		// Monthly interest payment
		const monthlyInterest = totalInterest / termInMonths;

		// Monthly principal payment
		const monthlyPrincipal = principal / termInMonths;

		// Total monthly payment is principal + interest
		const monthlyPayment = monthlyPrincipal + monthlyInterest;

		return monthlyPayment.toFixed(2);
	};

	const handleBack = () => {
		const currentStep = parseInt(searchParams.get("step") || "1", 10);
		const newStep = Math.max(currentStep - 1, 1);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("step", newStep.toString());
		window.location.href = newUrl.toString();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-xl font-semibold text-white mb-6">
				Loan Details for {selectedProduct.name}
			</h2>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Loan Amount
					</label>
					<input
						type="number"
						name="loanAmount"
						value={formValues.loanAmount}
						onChange={handleChange}
						min={selectedProduct.minAmount}
						max={selectedProduct.maxAmount}
						step={100}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter loan amount"
					/>
					{errors.loanAmount ? (
						<p className="mt-1 text-sm text-red-400">
							{errors.loanAmount}
						</p>
					) : (
						<p className="mt-1 text-sm text-gray-400">
							Enter amount between RM{" "}
							{selectedProduct.minAmount.toLocaleString()} and RM{" "}
							{selectedProduct.maxAmount.toLocaleString()}
						</p>
					)}
				</div>

				{(selectedProduct.loanTypes ?? []).length > 0 && (
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Loan Purpose
						</label>
						<select
							name="loanPurpose"
							value={formValues.loanPurpose}
							onChange={handleSelectChange}
							className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						>
							<option value="">Select loan purpose</option>
							{(selectedProduct.loanTypes ?? []).map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
						{errors.loanPurpose && (
							<p className="mt-1 text-sm text-red-400">
								{errors.loanPurpose}
							</p>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Loan Term
					</label>
					<select
						name="loanTerm"
						value={formValues.loanTerm}
						onChange={handleSelectChange}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
					>
						<option value="">Select loan term</option>
						{selectedProduct.repaymentTerms.map((term) => (
							<option key={term} value={term.toString()}>
								{formatTermDisplay(term)}
							</option>
						))}
					</select>
					{errors.loanTerm && (
						<p className="mt-1 text-sm text-red-400">
							{errors.loanTerm}
						</p>
					)}
				</div>

				{formValues.loanAmount && formValues.loanTerm && (
					<div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
						<h3 className="text-sm font-medium text-gray-300 mb-2">
							Estimated Monthly Repayment
						</h3>
						<p className="text-2xl font-semibold text-blue-400">
							RM{" "}
							{calculateMonthlyRepayment(
								parseFloat(formValues.loanAmount),
								parseInt(formValues.loanTerm)
							)}
						</p>
						<p className="text-sm text-gray-400 mt-1">
							*Based on {selectedProduct.interestRate}% monthly
							interest rate (flat)
						</p>
					</div>
				)}
			</div>

			<div className="flex justify-between pt-6">
				<button
					type="button"
					onClick={handleBack}
					className="px-6 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/60 hover:border-gray-500/60 transition-all duration-200 font-medium"
				>
					Back
				</button>
				<button
					type="submit"
					className="px-6 py-3 bg-blue-600/80 backdrop-blur-md border border-blue-500/50 text-white rounded-lg hover:bg-blue-600/90 hover:border-blue-400/60 transition-all duration-200 font-medium"
				>
					Continue
				</button>
			</div>
		</form>
	);
}

export default function ApplicationDetailsForm(
	props: ApplicationDetailsFormProps
) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ApplicationDetailsFormContent {...props} />
		</Suspense>
	);
}
