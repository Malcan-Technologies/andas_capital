// CSV processing types and utilities

// Types for CSV processing
export interface RawTransaction {
	refCode: string;
	beneficiary: string;
	amount: number;
	rawData: Record<string, any>;
}

export interface BankFormatConfig {
	name: string;
	patterns: {
		refCode: string[];
		beneficiary: string[];
		amount: string[];
	};
	amountParser: (value: string) => number;
	detector: (headers: string[]) => boolean;
}

export interface TransactionMatch {
	transaction: RawTransaction;
	payment: {
		id: string;
		amount: number;
		reference?: string;
		user: {
			fullName: string;
		};
		loan: {
			id: string;
			application: {
				product: {
					name: string;
				};
			};
		};
	};
	matchScore: number;
	matchReasons: string[];
}

export interface CSVProcessingResult {
	transactions: RawTransaction[];
	matches: TransactionMatch[];
	unmatchedTransactions: RawTransaction[];
	unmatchedPayments: any[];
	processingErrors: string[];
	bankFormat: string;
	summary: {
		totalTransactions: number;
		totalMatches: number;
		totalAmount: number;
		matchedAmount: number;
	};
}

// Standardized CSV format configuration
const STANDARDIZED_FORMAT: BankFormatConfig = {
	name: "Standardized Format",
	patterns: {
		refCode: ["description_1", "description_2"], // Check both description fields for references
		beneficiary: ["beneficiary"],
		amount: ["cash_in"]
	},
	amountParser: (value: string) => {
		if (!value || typeof value !== 'string') return 0;
		// Handle various amount formats: "RM 2000.00", "2,000.00", "2000.00"
		const cleaned = value.replace(/RM\s?|,/g, "").trim();
		const amount = parseFloat(cleaned);
		return isNaN(amount) ? 0 : amount;
	},
	detector: (headers: string[]) => {
		const lowerHeaders = headers.map(h => h.toLowerCase().trim());
		const requiredHeaders = ['transaction_date', 'description_1', 'description_2', 'beneficiary', 'account', 'cash_in', 'cash_out'];
		
		// Check if all required headers are present
		return requiredHeaders.every(required => 
			lowerHeaders.includes(required)
		);
	}
};

// Legacy bank format configurations (kept for backward compatibility)
const LEGACY_BANK_FORMATS: BankFormatConfig[] = [
	{
		name: "Maybank (Legacy)",
		patterns: {
			refCode: ["Transaction Description 1", "Description", "Ref Code", "Reference"],
			beneficiary: ["Transaction Description 2", "Beneficiary", "To Account", "Recipient"],
			amount: ["Cash-out (RM)", "Amount (RM)", "Debit Amount", "Transaction Amount"]
		},
		amountParser: (value: string) => {
			// Handle formats like "RM 1,234.56" or "1,234.56"
			const cleaned = value.replace(/RM\s?|,/g, "").trim();
			return parseFloat(cleaned);
		},
		detector: (headers: string[]) => {
			const lowerHeaders = headers.map(h => h.toLowerCase());
			return lowerHeaders.some(h => h.includes("cash-out")) ||
				   lowerHeaders.some(h => h.includes("maybank"));
		}
	},
	{
		name: "CIMB (Legacy)",
		patterns: {
			refCode: ["Reference", "Transaction ID", "Ref No", "Description"],
			beneficiary: ["Beneficiary Name", "To Account", "Recipient", "Payee"],
			amount: ["Amount", "Debit Amount", "Transaction Amount", "Amount (RM)"]
		},
		amountParser: (value: string) => {
			const cleaned = value.replace(/RM\s?|,/g, "").trim();
			return parseFloat(cleaned);
		},
		detector: (headers: string[]) => {
			const lowerHeaders = headers.map(h => h.toLowerCase());
			return lowerHeaders.some(h => h.includes("cimb")) ||
				   lowerHeaders.some(h => h.includes("beneficiary name"));
		}
	},
	{
		name: "Public Bank (Legacy)",
		patterns: {
			refCode: ["Remarks", "Description", "Reference No", "Transaction Details"],
			beneficiary: ["Beneficiary", "Recipient Name", "To", "Payee Name"],
			amount: ["Amount", "Debit", "Debit Amount", "Amount (RM)"]
		},
		amountParser: (value: string) => {
			const cleaned = value.replace(/RM\s?|,/g, "").trim();
			return parseFloat(cleaned);
		},
		detector: (headers: string[]) => {
			const lowerHeaders = headers.map(h => h.toLowerCase());
			return lowerHeaders.some(h => h.includes("public")) ||
				   lowerHeaders.some(h => h.includes("remarks"));
		}
	},
	{
		name: "Generic (Legacy)",
		patterns: {
			refCode: ["reference", "ref", "description", "remarks", "details", "transaction id", "ref code"],
			beneficiary: ["beneficiary", "recipient", "to", "payee", "account holder", "name"],
			amount: ["amount", "debit", "cash", "withdrawal", "payment", "value"]
		},
		amountParser: (value: string) => {
			// Handle various amount formats
			const cleaned = value.replace(/[^0-9.-]/g, "");
			return parseFloat(cleaned);
		},
		detector: (_headers: string[]) => true // Always matches as fallback
	}
];

// Combined formats array with standardized format first
const BANK_FORMATS: BankFormatConfig[] = [STANDARDIZED_FORMAT, ...LEGACY_BANK_FORMATS];

/**
 * Parse CSV content with various delimiters and encodings
 */
export function parseCSVContent(content: string): string[][] {
	try {
		// Clean up the content
		let cleanContent = content.trim();
		
		// Handle different line endings
		cleanContent = cleanContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		
		// Detect delimiter (comma, semicolon, or tab)
		const delimiters = [',', ';', '\t'];
		let bestDelimiter = ',';
		let maxColumns = 0;
		
		for (const delimiter of delimiters) {
			const testLine = cleanContent.split('\n')[0];
			const columns = testLine.split(delimiter).length;
			if (columns > maxColumns) {
				maxColumns = columns;
				bestDelimiter = delimiter;
			}
		}
		
		// Parse CSV manually to handle quotes and escaping
		const lines = cleanContent.split('\n').filter(line => line.trim());
		const result: string[][] = [];
		
		for (const line of lines) {
			const row: string[] = [];
			let current = '';
			let inQuotes = false;
			let i = 0;
			
			while (i < line.length) {
				const char = line[i];
				const nextChar = line[i + 1];
				
				if (char === '"') {
					if (inQuotes && nextChar === '"') {
						// Escaped quote
						current += '"';
						i += 2;
						continue;
					} else {
						// Toggle quote state
						inQuotes = !inQuotes;
					}
				} else if (char === bestDelimiter && !inQuotes) {
					// End of field
					row.push(current.trim());
					current = '';
				} else {
					current += char;
				}
				i++;
			}
			
			// Add the last field
			row.push(current.trim());
			
			// Only add rows with content
			if (row.some(cell => cell.length > 0)) {
				result.push(row);
			}
		}
		
		return result;
	} catch (error) {
		throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Detect bank format from CSV headers
 */
export function detectBankFormat(headers: string[]): BankFormatConfig {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
	
	for (const format of BANK_FORMATS) {
		if (format.name !== "Generic" && format.detector(normalizedHeaders)) {
			return format;
		}
	}
	
	// Return generic format as fallback
	return BANK_FORMATS[BANK_FORMATS.length - 1];
}

/**
 * Find the best matching column for a field type
 */
function findBestColumn(headers: string[], patterns: string[]): string | null {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
	const normalizedPatterns = patterns.map(p => p.toLowerCase().trim());
	
	// First try exact matches
	for (const pattern of normalizedPatterns) {
		const exactMatch = normalizedHeaders.find(h => h === pattern);
		if (exactMatch) {
			return headers[normalizedHeaders.indexOf(exactMatch)];
		}
	}
	
	// Then try partial matches
	for (const pattern of normalizedPatterns) {
		const partialMatch = normalizedHeaders.find(h => h.includes(pattern) || pattern.includes(h));
		if (partialMatch) {
			return headers[normalizedHeaders.indexOf(partialMatch)];
		}
	}
	
	return null;
}

/**
 * Extract transactions from parsed CSV data
 */
export function extractTransactions(
	csvData: string[][],
	bankFormat: BankFormatConfig
): { transactions: RawTransaction[]; errors: string[] } {
	const errors: string[] = [];
	const transactions: RawTransaction[] = [];
	
	if (csvData.length === 0) {
		errors.push("CSV file is empty");
		return { transactions, errors };
	}
	
	// Find header row (skip empty rows at the top)
	let headerRowIndex = 0;
	while (headerRowIndex < csvData.length && csvData[headerRowIndex].every(cell => !cell.trim())) {
		headerRowIndex++;
	}
	
	if (headerRowIndex >= csvData.length) {
		errors.push("No valid header row found");
		return { transactions, errors };
	}
	
	const headers = csvData[headerRowIndex];
	
	// Find column mappings
	const refCodeColumn = findBestColumn(headers, bankFormat.patterns.refCode);
	const beneficiaryColumn = findBestColumn(headers, bankFormat.patterns.beneficiary);
	const amountColumn = findBestColumn(headers, bankFormat.patterns.amount);
	
	if (!refCodeColumn) {
		errors.push(`Could not find reference code column. Expected one of: ${bankFormat.patterns.refCode.join(', ')}`);
	}
	if (!beneficiaryColumn) {
		errors.push(`Could not find beneficiary column. Expected one of: ${bankFormat.patterns.beneficiary.join(', ')}`);
	}
	if (!amountColumn) {
		errors.push(`Could not find amount column. Expected one of: ${bankFormat.patterns.amount.join(', ')}`);
	}
	
	if (!refCodeColumn || !beneficiaryColumn || !amountColumn) {
		return { transactions, errors };
	}
	
	// Get column indices
	const refCodeIndex = headers.indexOf(refCodeColumn);
	const beneficiaryIndex = headers.indexOf(beneficiaryColumn);
	const amountIndex = headers.indexOf(amountColumn);
	
	// Process data rows
	for (let i = headerRowIndex + 1; i < csvData.length; i++) {
		const row = csvData[i];
		
		// Skip empty rows
		if (row.every(cell => !cell.trim())) {
			continue;
		}
		
		try {
			let refCode = "";
			const beneficiary = row[beneficiaryIndex]?.trim() || "";
			const amountStr = row[amountIndex]?.trim() || "";
			
			// For standardized format, check both description fields for reference codes
			if (bankFormat.name === "Standardized Format") {
				const desc1Index = headers.findIndex(h => h.toLowerCase().trim() === "description_1");
				const desc2Index = headers.findIndex(h => h.toLowerCase().trim() === "description_2");
				
				const desc1 = desc1Index >= 0 ? row[desc1Index]?.trim() || "" : "";
				const desc2 = desc2Index >= 0 ? row[desc2Index]?.trim() || "" : "";
				
				// Use description_1 as primary reference, fallback to description_2
				refCode = desc1 || desc2;
			} else {
				// Legacy format - use the mapped refCode column
				refCode = row[refCodeIndex]?.trim() || "";
			}
			
			if (!refCode && !beneficiary && !amountStr) {
				continue; // Skip completely empty transaction rows
			}
			
			const amount = bankFormat.amountParser(amountStr);
			
			// Skip rows with no meaningful data (no ref code, no beneficiary, and zero amount)
			if (!refCode && !beneficiary && amount === 0) {
				continue; // Skip empty transaction rows
			}
			
			// Only warn about invalid amounts if there's other meaningful data
			if (isNaN(amount) && (refCode || beneficiary)) {
				errors.push(`Row ${i + 1}: Invalid amount "${amountStr}" - defaulting to 0`);
			}
			
			// Create raw data object with all fields
			const rawData: Record<string, any> = {};
			headers.forEach((header, index) => {
				if (row[index] !== undefined) {
					rawData[header] = row[index];
				}
			});
			
			transactions.push({
				refCode,
				beneficiary,
				amount: isNaN(amount) ? 0 : amount, // Default to 0 if amount is invalid
				rawData
			});
		} catch (error) {
			errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
		}
	}
	
	return { transactions, errors };
}

/**
 * Calculate match score between transaction and payment
 */
function calculateMatchScore(
	transaction: RawTransaction,
	payment: any
): { score: number; reasons: string[] } {
	let score = 0;
	const reasons: string[] = [];
	
	console.log('Matching transaction:', {
		refCode: transaction.refCode,
		beneficiary: transaction.beneficiary,
		amount: transaction.amount
	});
	console.log('Against payment:', {
		reference: payment.reference,
		fullName: payment.user?.fullName,
		amount: payment.amount,
		id: payment.id
	});
	
	// Exact reference match (highest priority)
	if (transaction.refCode && payment.reference) {
		if (transaction.refCode.toLowerCase() === payment.reference.toLowerCase()) {
			score += 50;
			reasons.push("Exact reference match");
		} else if (transaction.refCode.toLowerCase().includes(payment.reference.toLowerCase()) ||
				   payment.reference.toLowerCase().includes(transaction.refCode.toLowerCase())) {
			score += 30;
			reasons.push("Partial reference match");
		}
	} else {
		console.log('No reference match - transaction.refCode:', transaction.refCode, 'payment.reference:', payment.reference);
	}
	
	// Amount match (critical)
	const amountDiff = Math.abs(transaction.amount - Math.abs(payment.amount));
	const amountTolerance = Math.max(0.01, Math.abs(payment.amount) * 0.001); // 0.1% tolerance or 1 cent minimum
	
	if (amountDiff === 0) {
		score += 40;
		reasons.push("Exact amount match");
	} else if (amountDiff <= amountTolerance) {
		score += 35;
		reasons.push("Amount match within tolerance");
	} else if (amountDiff <= 1.00) {
		score += 10;
		reasons.push("Amount close match");
	}
	
	// Beneficiary name match (if available)
	if (transaction.beneficiary && payment.user?.fullName) {
		const transactionName = transaction.beneficiary.toLowerCase();
		const paymentName = payment.user.fullName.toLowerCase();
		
		// Split names into words for better matching
		const transactionWords = transactionName.split(/\s+/);
		const paymentWords = paymentName.split(/\s+/);
		
		// Check for word matches
		let wordMatches = 0;
		for (const tWord of transactionWords) {
			for (const pWord of paymentWords) {
				if (tWord.length > 2 && pWord.length > 2) {
					if (tWord === pWord) {
						wordMatches++;
					} else if (tWord.includes(pWord) || pWord.includes(tWord)) {
						wordMatches += 0.5;
					}
				}
			}
		}
		
		if (wordMatches >= 2) {
			score += 20;
			reasons.push("Strong beneficiary name match");
		} else if (wordMatches >= 1) {
			score += 10;
			reasons.push("Partial beneficiary name match");
		}
	}
	
	// Loan ID in reference (additional check)
	if (transaction.refCode && payment.loan?.id) {
		if (transaction.refCode.includes(payment.loan.id)) {
			score += 15;
			reasons.push("Loan ID found in reference");
		}
	}
	
	console.log('Match score:', score, 'reasons:', reasons);
	return { score, reasons };
}

/**
 * Match transactions against pending payments
 */
export function matchTransactions(
	transactions: RawTransaction[],
	pendingPayments: any[]
): TransactionMatch[] {
	const matches: TransactionMatch[] = [];
	const usedPaymentIds = new Set<string>();
	const usedTransactionIndices = new Set<number>();
	
	// First pass: Find high-confidence matches (score >= 60)
	for (let i = 0; i < transactions.length; i++) {
		if (usedTransactionIndices.has(i)) continue;
		
		const transaction = transactions[i];
		let bestMatch: TransactionMatch | null = null;
		
		for (const payment of pendingPayments) {
			if (usedPaymentIds.has(payment.id)) continue;
			
			const { score, reasons } = calculateMatchScore(transaction, payment);
			
			if (score >= 60) {
				if (!bestMatch || score > bestMatch.matchScore) {
					bestMatch = {
						transaction,
						payment,
						matchScore: score,
						matchReasons: reasons
					};
				}
			}
		}
		
		if (bestMatch) {
			matches.push(bestMatch);
			usedPaymentIds.add(bestMatch.payment.id);
			usedTransactionIndices.add(i);
		}
	}
	
	// Second pass: Find medium-confidence matches (score >= 40)
	for (let i = 0; i < transactions.length; i++) {
		if (usedTransactionIndices.has(i)) continue;
		
		const transaction = transactions[i];
		let bestMatch: TransactionMatch | null = null;
		
		for (const payment of pendingPayments) {
			if (usedPaymentIds.has(payment.id)) continue;
			
			const { score, reasons } = calculateMatchScore(transaction, payment);
			
			if (score >= 40) {
				if (!bestMatch || score > bestMatch.matchScore) {
					bestMatch = {
						transaction,
						payment,
						matchScore: score,
						matchReasons: reasons
					};
				}
			}
		}
		
		if (bestMatch) {
			matches.push(bestMatch);
			usedPaymentIds.add(bestMatch.payment.id);
			usedTransactionIndices.add(i);
		}
	}
	
	// Sort matches by score (highest first)
	matches.sort((a, b) => b.matchScore - a.matchScore);
	
	return matches;
}

/**
 * Process uploaded CSV file and match against pending payments
 */
export function processCSVFile(
	csvContent: string,
	pendingPayments: any[]
): CSVProcessingResult {
	const processingErrors: string[] = [];
	
	try {
		// Parse CSV content
		const csvData = parseCSVContent(csvContent);
		
		if (csvData.length === 0) {
			processingErrors.push("CSV file is empty or could not be parsed");
			return {
				transactions: [],
				matches: [],
				unmatchedTransactions: [],
				unmatchedPayments: pendingPayments,
				processingErrors,
				bankFormat: "Unknown",
				summary: {
					totalTransactions: 0,
					totalMatches: 0,
					totalAmount: 0,
					matchedAmount: 0
				}
			};
		}
		
		// Detect bank format
		const bankFormat = detectBankFormat(csvData[0]);
		
		// Extract transactions
		const { transactions, errors } = extractTransactions(csvData, bankFormat);
		processingErrors.push(...errors);
		
		console.log('Extracted transactions:', transactions.length);
		console.log('Sample transactions:', transactions.slice(0, 3));
		console.log('Pending payments:', pendingPayments.length);
		console.log('Sample pending payments:', pendingPayments.slice(0, 3).map(p => ({
			id: p.id,
			reference: p.reference,
			amount: p.amount,
			fullName: p.user?.fullName
		})));
		
		if (transactions.length === 0) {
			return {
				transactions: [],
				matches: [],
				unmatchedTransactions: [],
				unmatchedPayments: pendingPayments,
				processingErrors,
				bankFormat: bankFormat.name,
				summary: {
					totalTransactions: 0,
					totalMatches: 0,
					totalAmount: 0,
					matchedAmount: 0
				}
			};
		}
		
		// Match transactions against pending payments
		const matches = matchTransactions(transactions, pendingPayments);
		
		// Calculate unmatched items
		const matchedTransactionIndices = new Set(
			matches.map(m => transactions.indexOf(m.transaction))
		);
		const matchedPaymentIds = new Set(matches.map(m => m.payment.id));
		
		const unmatchedTransactions = transactions.filter(
			(_, index) => !matchedTransactionIndices.has(index)
		);
		const unmatchedPayments = pendingPayments.filter(
			p => !matchedPaymentIds.has(p.id)
		);
		
		// Calculate summary
		const totalTransactionAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
		const matchedAmount = matches.reduce((sum, m) => sum + m.transaction.amount, 0);
		
		return {
			transactions,
			matches,
			unmatchedTransactions,
			unmatchedPayments,
			processingErrors,
			bankFormat: bankFormat.name,
			summary: {
				totalTransactions: transactions.length,
				totalMatches: matches.length,
				totalAmount: matchedAmount, // Show only matched amounts in summary
				matchedAmount
			}
		};
	} catch (error) {
		processingErrors.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		
		return {
			transactions: [],
			matches: [],
			unmatchedTransactions: [],
			unmatchedPayments: pendingPayments,
			processingErrors,
			bankFormat: "Unknown",
			summary: {
				totalTransactions: 0,
				totalMatches: 0,
				totalAmount: 0,
				matchedAmount: 0
			}
		};
	}
}