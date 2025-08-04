interface BankAccount {
	id: string;
	bankName: string;
	accountName: string;
	accountNumber: string;
	isActive: boolean;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

interface BankAccountResponse {
	success: boolean;
	data?: BankAccount;
	message: string;
}

/**
 * Fetch the default/active bank account from the API
 */
export const fetchDefaultBankAccount = async (): Promise<BankAccount | null> => {
	try {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
		const response = await fetch(`${apiUrl}/api/bank-accounts/default`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error("Failed to fetch bank account:", response.status, response.statusText);
			return null;
		}

		const result: BankAccountResponse = await response.json();
		
		if (result.success) {
			if (result.data) {
				return result.data;
			} else {
				// No bank account configured, use fallback
				console.info("No bank account configured, using fallback");
				return null;
			}
		} else {
			console.error("API returned unsuccessful response:", result.message);
			return null;
		}
	} catch (error) {
		console.error("Error fetching default bank account:", error);
		return null;
	}
};

/**
 * Get fallback bank account data (original hardcoded values)
 */
export const getFallbackBankAccount = (): BankAccount => {
	return {
		id: "fallback",
		bankName: "HSBC Bank Malaysia Berhad",
		accountName: "OPG Capital Holdings Sdn. Bhd.",
		accountNumber: "001866001878013",
		isActive: true,
		isDefault: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
};