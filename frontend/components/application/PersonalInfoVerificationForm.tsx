import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface PersonalInfo {
	fullName: string;
	email: string;
	phoneNumber: string;
	employmentStatus: string;
	employerName?: string;
	monthlyIncome: string;
	address1: string;
	address2?: string;
	city: string;
	state: string;
	postalCode: string;
	zipCode?: string;
}

interface PersonalInfoVerificationFormProps {
	onSubmit: (values: PersonalInfo) => void;
	onBack: () => void;
}

// Create a client component for handling searchParams
function PersonalInfoVerificationFormContent({
	onSubmit,
	onBack,
}: PersonalInfoVerificationFormProps) {
	const searchParams = useSearchParams();
	const [formValues, setFormValues] = useState<PersonalInfo>({
		fullName: "",
		email: "",
		phoneNumber: "",
		employmentStatus: "",
		employerName: "",
		monthlyIncome: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		postalCode: "",
	});
	const [errors, setErrors] = useState<Partial<PersonalInfo>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Get application ID from URL params
				const applicationId = searchParams.get("applicationId");
				if (!applicationId) {
					throw new Error("Application ID not found in URL");
				}

				console.log("Fetching user data");

				// Fetch user data from /api/users/me
				const token = localStorage.getItem("token");
				const userResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!userResponse.ok) {
					throw new Error("Failed to fetch user data");
				}

				const userData = await userResponse.json();
				console.log("User data:", userData);

				// Set form values from user data if available
				if (userData) {
					setFormValues({
						fullName: userData.fullName || "",
						email: userData.email || "",
						phoneNumber: userData.phoneNumber || "",
						employmentStatus: userData.employmentStatus || "",
						employerName: userData.employerName || "",
						monthlyIncome: userData.monthlyIncome || "",
						address1: userData.address1 || "",
						address2: userData.address2 || "",
						city: userData.city || "",
						state: userData.state || "",
						postalCode:
							userData.postalCode || userData.zipCode || "",
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

	const validateForm = () => {
		const newErrors: Partial<PersonalInfo> = {};

		if (!formValues.fullName) {
			newErrors.fullName = "Full name is required";
		}

		if (!formValues.email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formValues.phoneNumber) {
			newErrors.phoneNumber = "Phone number is required";
		}

		if (!formValues.employmentStatus) {
			newErrors.employmentStatus = "Employment status is required";
		}

		if (
			formValues.employmentStatus === "Employed" &&
			!formValues.employerName
		) {
			newErrors.employerName = "Employer name is required";
		}

		if (
			formValues.employmentStatus === "Business Owner" &&
			!formValues.employerName
		) {
			newErrors.employerName = "Company name is required";
		}

		if (!formValues.monthlyIncome) {
			newErrors.monthlyIncome = "Monthly income is required";
		} else {
			const income = parseFloat(formValues.monthlyIncome);
			if (isNaN(income) || income <= 0) {
				newErrors.monthlyIncome =
					"Please enter a valid monthly income amount";
			}
		}

		if (!formValues.address1) {
			newErrors.address1 = "Address is required";
		}

		if (!formValues.city) {
			newErrors.city = "City is required";
		}

		if (!formValues.state) {
			newErrors.state = "State is required";
		}

		if (!formValues.postalCode) {
			newErrors.postalCode = "Postal code is required";
		} else if (!/^\d{5}$/.test(formValues.postalCode)) {
			newErrors.postalCode = "Please enter a valid 5-digit postal code";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			onSubmit(formValues);
		}
	};

	const handleChange =
		(field: keyof PersonalInfo) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			if (field === "monthlyIncome" || field === "postalCode") {
				const numericValue = value.replace(/[^0-9]/g, "");
				if (field === "postalCode" && numericValue.length > 5) {
					return;
				}
				setFormValues((prev) => ({ ...prev, [field]: numericValue }));
			} else {
				setFormValues((prev) => ({ ...prev, [field]: value }));
			}
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: "" }));
			}
		};

	const handleBack = () => {
		const currentStep = parseInt(searchParams.get("step") || "0", 10);
		const newStep = Math.max(currentStep - 1, 0);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("step", newStep.toString());
		window.location.href = newUrl.toString();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-xl font-semibold text-white mb-6">
				Verify Personal Information
			</h2>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Full Name
					</label>
					<input
						type="text"
						value={formValues.fullName}
						onChange={handleChange("fullName")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter your full name"
					/>
					{errors.fullName && (
						<p className="mt-1 text-sm text-red-400">
							{errors.fullName}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Email
					</label>
					<input
						type="email"
						value={formValues.email}
						onChange={handleChange("email")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter your email address"
					/>
					{errors.email && (
						<p className="mt-1 text-sm text-red-400">
							{errors.email}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Phone Number
					</label>
					<input
						type="text"
						value={formValues.phoneNumber}
						onChange={handleChange("phoneNumber")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter your phone number"
					/>
					{errors.phoneNumber && (
						<p className="mt-1 text-sm text-red-400">
							{errors.phoneNumber}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-3">
						Employment Status
					</label>
					<div className="space-y-3">
						{[
							"Employed",
							"Self-Employed",
							"Business Owner",
							"Unemployed",
						].map((status) => (
							<label key={status} className="flex items-center">
								<input
									type="radio"
									name="employmentStatus"
									value={status}
									checked={
										formValues.employmentStatus === status
									}
									onChange={handleChange("employmentStatus")}
									className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2"
								/>
								<span className="ml-3 text-gray-300">
									{status}
								</span>
							</label>
						))}
					</div>
					{errors.employmentStatus && (
						<p className="mt-1 text-sm text-red-400">
							{errors.employmentStatus}
						</p>
					)}
				</div>

				{(formValues.employmentStatus === "Employed" ||
					formValues.employmentStatus === "Business Owner") && (
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{formValues.employmentStatus === "Business Owner"
								? "Company Name"
								: "Employer Name"}
						</label>
						<input
							type="text"
							value={formValues.employerName || ""}
							onChange={handleChange("employerName")}
							className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
							placeholder={`Enter your ${
								formValues.employmentStatus === "Business Owner"
									? "company"
									: "employer"
							} name`}
						/>
						{errors.employerName && (
							<p className="mt-1 text-sm text-red-400">
								{errors.employerName}
							</p>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Monthly Income
					</label>
					<div className="relative">
						<span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
							RM
						</span>
						<input
							type="text"
							value={formValues.monthlyIncome}
							onChange={handleChange("monthlyIncome")}
							className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
							placeholder="Enter your monthly income"
						/>
					</div>
					{errors.monthlyIncome && (
						<p className="mt-1 text-sm text-red-400">
							{errors.monthlyIncome}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Address Line 1
					</label>
					<input
						type="text"
						value={formValues.address1}
						onChange={handleChange("address1")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter your address"
					/>
					{errors.address1 && (
						<p className="mt-1 text-sm text-red-400">
							{errors.address1}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Address Line 2 (Optional)
					</label>
					<input
						type="text"
						value={formValues.address2 || ""}
						onChange={handleChange("address2")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Apartment, suite, etc. (optional)"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							City
						</label>
						<input
							type="text"
							value={formValues.city}
							onChange={handleChange("city")}
							className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
							placeholder="Enter your city"
						/>
						{errors.city && (
							<p className="mt-1 text-sm text-red-400">
								{errors.city}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							State
						</label>
						<input
							type="text"
							value={formValues.state}
							onChange={handleChange("state")}
							className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
							placeholder="Enter your state"
						/>
						{errors.state && (
							<p className="mt-1 text-sm text-red-400">
								{errors.state}
							</p>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Postal Code
					</label>
					<input
						type="text"
						value={formValues.postalCode}
						onChange={handleChange("postalCode")}
						className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
						placeholder="Enter your postal code"
					/>
					{errors.postalCode && (
						<p className="mt-1 text-sm text-red-400">
							{errors.postalCode}
						</p>
					)}
				</div>
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

export default function PersonalInfoVerificationForm(
	props: PersonalInfoVerificationFormProps
) {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-8">
					<div className="text-white">Loading...</div>
				</div>
			}
		>
			<PersonalInfoVerificationFormContent {...props} />
		</Suspense>
	);
}
