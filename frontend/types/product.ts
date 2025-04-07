export interface ProductType {
	id: string;
	code: string;
	name: string;
	description: string;
	minAmount: number;
	maxAmount: number;
	repaymentTerms: number[];
	interestRate: number;
	legalFee: number;
	originationFee: number;
	lateFee: number;
	applicationFee: number;
	eligibility: string[];
	features: string[];
	requiredDocuments?: string[];
	loanTypes?: string[];
	requirements?: string[];
	isActive: boolean;
}
