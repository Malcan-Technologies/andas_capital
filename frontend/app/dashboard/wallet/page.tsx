"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
	WalletIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	CreditCardIcon,
	BanknotesIcon,
	ClockIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PlusIcon,
	ArrowPathIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { checkAuth, fetchWithTokenRefresh } from "@/lib/authUtils";

interface WalletData {
	balance: number;
	availableForWithdrawal: number;
	totalDeposits: number;
	totalWithdrawals: number;
	totalDisbursed: number;
	pendingTransactions: number;
	bankConnected: boolean;
	bankName?: string;
	accountNumber?: string;
}

export default function WalletPage() {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");
	const [walletData, setWalletData] = useState<WalletData>({
		balance: 0,
		availableForWithdrawal: 0,
		totalDeposits: 0,
		totalWithdrawals: 0,
		totalDisbursed: 0,
		pendingTransactions: 0,
		bankConnected: false,
	});

	const [loading, setLoading] = useState<boolean>(true);

	const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
	const [showBankTransferModal, setShowBankTransferModal] =
		useState<boolean>(false);
	const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
	const [depositAmount, setDepositAmount] = useState<string>("");
	const [withdrawAmount, setWithdrawAmount] = useState<string>("");
	const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
	const [showAddBankModal, setShowAddBankModal] = useState<boolean>(false);
	const [newBankName, setNewBankName] = useState<string>("");
	const [newAccountNumber, setNewAccountNumber] = useState<string>("");
	const [transferConfirmed, setTransferConfirmed] = useState<boolean>(false);
	const [showManageBankModal, setShowManageBankModal] =
		useState<boolean>(false);

	useEffect(() => {
		const checkAuthAndLoadData = async () => {
			try {
				const isAuthenticated = await checkAuth();
				if (!isAuthenticated) {
					router.push("/login");
					return;
				}

				// Fetch user data
				const userData = await fetchWithTokenRefresh<any>(
					"/api/users/me"
				);
				if (!userData?.isOnboardingComplete) {
					router.push("/onboarding");
					return;
				}

				// Set user name
				if (userData.firstName) {
					setUserName(userData.firstName);
				} else if (userData.fullName) {
					setUserName(userData.fullName.split(" ")[0]);
				} else {
					setUserName("User");
				}

				// Load wallet data
				loadWalletData();
			} catch (error) {
				console.error("Auth check error:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndLoadData();
	}, [router]);

	const loadWalletData = async () => {
		try {
			const data = await fetchWithTokenRefresh<WalletData>("/api/wallet");
			if (data) {
				setWalletData({
					balance: data.balance,
					availableForWithdrawal: data.availableForWithdrawal,
					totalDeposits: data.totalDeposits,
					totalWithdrawals: data.totalWithdrawals,
					totalDisbursed: data.totalDisbursed || 0,
					pendingTransactions: data.pendingTransactions,
					bankConnected: data.bankConnected,
					bankName: data.bankName,
					accountNumber: data.accountNumber,
				});
			}
		} catch (error) {
			console.error("Error loading wallet data:", error);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Math.abs(amount));
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleDepositClick = () => {
		setShowDepositModal(true);
	};

	const handleBankTransferClick = () => {
		setShowDepositModal(false);
		setShowBankTransferModal(true);
	};

	const handleConfirmTransfer = async () => {
		if (!depositAmount || parseFloat(depositAmount) <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		try {
			const response = await fetchWithTokenRefresh(
				"/api/wallet/deposit",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						amount: parseFloat(depositAmount),
						method: "BANK_TRANSFER",
						description: `Bank transfer deposit of ${formatCurrency(
							parseFloat(depositAmount)
						)}`,
					}),
				}
			);

			if (response) {
				// Refresh wallet data
				await loadWalletData();

				// Reset states
				setShowBankTransferModal(false);
				setDepositAmount("");
				setTransferConfirmed(false);

				alert(
					"Deposit request submitted successfully! Your transaction is pending approval."
				);
			}
		} catch (error) {
			console.error("Error creating deposit:", error);
			alert("Failed to submit deposit request. Please try again.");
		}
	};

	const handleWithdrawClick = () => {
		setShowWithdrawModal(true);
	};

	const handleConfirmWithdrawal = async () => {
		if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		if (!selectedBankAccount) {
			alert("Please select a bank account");
			return;
		}

		if (parseFloat(withdrawAmount) > walletData.availableForWithdrawal) {
			alert("Insufficient funds available for withdrawal");
			return;
		}

		try {
			const response = await fetchWithTokenRefresh(
				"/api/wallet/withdraw",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						amount: parseFloat(withdrawAmount),
						bankAccount: selectedBankAccount,
						description: `Withdrawal of ${formatCurrency(
							parseFloat(withdrawAmount)
						)} to ${selectedBankAccount}`,
					}),
				}
			);

			if (response) {
				// Refresh wallet data
				await loadWalletData();

				// Reset states
				setShowWithdrawModal(false);
				setWithdrawAmount("");
				setSelectedBankAccount("");

				alert(
					"Withdrawal request submitted successfully! Your transaction is pending approval."
				);
			}
		} catch (error) {
			console.error("Error creating withdrawal:", error);
			alert("Failed to submit withdrawal request. Please try again.");
		}
	};

	const handleAddBankAccount = async () => {
		if (!newBankName || !newAccountNumber) {
			alert("Please fill in all bank account details");
			return;
		}

		try {
			const response = await fetchWithTokenRefresh("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bankName: newBankName,
					accountNumber: newAccountNumber,
				}),
			});

			if (response) {
				// Refresh wallet data to get updated bank info
				await loadWalletData();

				// Set the new bank account as selected
				setSelectedBankAccount(`${newBankName} - ${newAccountNumber}`);

				// Reset and close add bank modal
				setNewBankName("");
				setNewAccountNumber("");
				setShowAddBankModal(false);

				alert("Bank account added successfully!");
			}
		} catch (error) {
			console.error("Error adding bank account:", error);
			alert("Failed to add bank account. Please try again.");
		}
	};

	const handleManageBankClick = () => {
		setShowManageBankModal(true);
	};

	const handleEditBankAccount = async () => {
		if (!newBankName || !newAccountNumber) {
			alert("Please fill in all bank account details");
			return;
		}

		try {
			const response = await fetchWithTokenRefresh("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bankName: newBankName,
					accountNumber: newAccountNumber,
				}),
			});

			if (response) {
				// Refresh wallet data to get updated bank info
				await loadWalletData();

				// Reset and close modals
				setNewBankName("");
				setNewAccountNumber("");
				setShowManageBankModal(false);
				setShowAddBankModal(false);

				alert("Bank account updated successfully!");
			}
		} catch (error) {
			console.error("Error updating bank account:", error);
			alert("Failed to update bank account. Please try again.");
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		alert("Copied to clipboard!");
	};

	if (loading) {
		return (
			<DashboardLayout userName={userName} title="Wallet">
				<div className="flex items-center justify-center h-64">
					<div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userName={userName} title="Wallet">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Wallet Balance Card */}
				<div className="bg-gradient-to-br from-green-700/70 via-emerald-700/70 to-teal-800/70 rounded-2xl p-8 text-white shadow-2xl">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
								<WalletIcon className="h-8 w-8" />
							</div>
							<div>
								<h2 className="text-2xl font-bold">
									Wallet Balance
								</h2>
								<p className="text-emerald-100">
									Available funds
								</p>
							</div>
						</div>
						<div className="text-right">
							<div className="text-4xl font-bold mb-1">
								{formatCurrency(walletData.balance)}
							</div>
							<div className="text-emerald-100 text-sm">
								Available:{" "}
								{formatCurrency(
									walletData.availableForWithdrawal
								)}
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="grid grid-cols-2 gap-4">
						<button
							onClick={handleDepositClick}
							className="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
						>
							<ArrowDownIcon className="h-6 w-6 mb-2" />
							<span className="text-sm font-medium">Deposit</span>
						</button>
						<button
							onClick={handleWithdrawClick}
							className="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
						>
							<ArrowUpIcon className="h-6 w-6 mb-2" />
							<span className="text-sm font-medium">
								Withdraw
							</span>
						</button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl p-6 shadow-xl backdrop-blur-md border border-white/10">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-300">
									Total Deposits
								</p>
								<p className="text-2xl font-bold text-white">
									{formatCurrency(walletData.totalDeposits)}
								</p>
							</div>
							<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
								<ArrowDownIcon className="h-6 w-6 text-emerald-200" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl p-6 shadow-xl backdrop-blur-md border border-white/10">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-300">
									Total Withdrawals
								</p>
								<p className="text-2xl font-bold text-white">
									{formatCurrency(
										walletData.totalWithdrawals
									)}
								</p>
							</div>
							<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
								<ArrowUpIcon className="h-6 w-6 text-red-200" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl p-6 shadow-xl backdrop-blur-md border border-white/10">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-300">
									Total Disbursed
								</p>
								<p className="text-2xl font-bold text-white">
									{formatCurrency(walletData.totalDisbursed)}
								</p>
							</div>
							<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
								<BanknotesIcon className="h-6 w-6 text-purple-200" />
							</div>
						</div>
					</div>
				</div>

				{/* Wallet Actions */}
				<div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl shadow-xl backdrop-blur-md border border-white/10 overflow-hidden">
					<div className="p-6">
						<div className="space-y-6">
							{/* Bank Account Info */}
							<div>
								<h4 className="text-lg font-semibold text-white mb-4">
									Connected Bank Account
								</h4>
								{walletData.bankConnected ? (
									<div className="flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
										<div className="flex items-center">
											<div className="p-3 bg-white/10 rounded-xl mr-4 backdrop-blur-md border border-white/20">
												<BanknotesIcon className="h-6 w-6 text-emerald-200" />
											</div>
											<div>
												<p className="font-semibold text-white">
													{walletData.bankName}
												</p>
												<p className="text-sm text-gray-300">
													Account{" "}
													{walletData.accountNumber}
												</p>
											</div>
										</div>
										<button
											className="text-sm font-medium text-emerald-200 hover:text-emerald-100 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
											onClick={handleManageBankClick}
										>
											Manage
										</button>
									</div>
								) : (
									<div className="flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
										<div className="flex items-center">
											<div className="p-3 bg-white/10 rounded-xl mr-4 backdrop-blur-md border border-white/20">
												<ExclamationTriangleIcon className="h-6 w-6 text-orange-200" />
											</div>
											<div>
												<p className="font-semibold text-white">
													No Bank Account Connected
												</p>
												<p className="text-sm text-gray-300">
													Connect your bank account to
													enable transfers
												</p>
											</div>
										</div>
										<button className="text-sm font-medium text-orange-200 hover:text-orange-100 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20">
											Connect Now
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Deposit Method Selection Modal */}
			{showDepositModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-white border border-white/10">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold">
									How would you like to deposit?
								</h2>
								<button
									onClick={() => setShowDepositModal(false)}
									className="text-gray-400 hover:text-gray-200"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							<div className="space-y-4">
								{/* FPX Express Deposit */}
								<div className="border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition-colors bg-white/5">
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center border border-emerald-500/30">
												<span className="text-emerald-400 font-bold text-sm">
													FPX
												</span>
											</div>
											<div>
												<h3 className="font-semibold text-white">
													FPX Express Deposit
												</h3>
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900/50 text-orange-300 border border-orange-500/30">
													Popular
												</span>
											</div>
										</div>
										<svg
											className="w-5 h-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
									<div className="space-y-2 text-sm text-gray-400">
										<div className="flex justify-between">
											<span>Estimated Arrival</span>
											<span>Usually 5 Min</span>
										</div>
										<div className="flex justify-between">
											<span>Fees</span>
											<span>Free</span>
										</div>
										<div className="flex justify-between">
											<span>Currency</span>
											<span>MYR</span>
										</div>
										<div className="flex justify-between">
											<span>Supported Banks</span>
											<span>Most Malaysian Banks</span>
										</div>
									</div>
								</div>

								{/* Bank Transfer */}
								<button
									onClick={handleBankTransferClick}
									className="w-full border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-emerald-900/20 transition-colors text-left bg-white/5"
								>
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-semibold text-white">
											Bank Transfer
										</h3>
										<svg
											className="w-5 h-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
									<div className="space-y-2 text-sm text-gray-400">
										<div className="flex justify-between">
											<span>Estimated Arrival</span>
											<span>Usually 1 Business Day</span>
										</div>
										<div className="flex justify-between">
											<span>Fees</span>
											<span>Free</span>
										</div>
										<div className="flex justify-between">
											<span>Currency</span>
											<span>MYR</span>
										</div>
										<div className="flex justify-between">
											<span>Supported Banks</span>
											<span>Most Malaysian Banks</span>
										</div>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Bank Transfer Details Modal */}
			{showBankTransferModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-white border border-white/10">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold">
									Bank Transfer
								</h2>
								<button
									onClick={() => {
										setShowBankTransferModal(false);
										setDepositAmount("");
										setTransferConfirmed(false);
									}}
									className="text-gray-400 hover:text-gray-200"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Amount Input */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Deposit Amount (MYR)
								</label>
								<input
									type="number"
									value={depositAmount}
									onChange={(e) =>
										setDepositAmount(e.target.value)
									}
									placeholder="0.00"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-500"
									min="1"
									step="0.01"
								/>
							</div>

							{/* Instructions */}
							<div className="mb-6 space-y-3 text-sm text-gray-400">
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
									<p>
										Please transfer funds only from your
										bank account named{" "}
										<span className="font-semibold text-white">
											{userName.toUpperCase()}
										</span>
										.{" "}
										<span className="text-orange-400">
											We do not accept transfers from
											third-party bank accounts.
										</span>
									</p>
								</div>
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
									<p>
										We recommend using Instant Transfer
										(DuitNow Transfer).
									</p>
								</div>
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
									<p>We do not accept any cash deposits.</p>
								</div>
							</div>

							{/* Bank Details */}
							<div className="bg-white/5 rounded-xl p-4 mb-6 space-y-4 border border-white/10">
								<div>
									<p className="text-sm text-gray-400 mb-1">
										Beneficiary Account Number
									</p>
									<div className="flex items-center justify-between">
										<p className="font-mono text-lg font-semibold text-white">
											001866001878013
										</p>
										<button
											onClick={() =>
												copyToClipboard(
													"001866001878013"
												)
											}
											className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
										>
											Copy
										</button>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										The account number is exclusive to{" "}
										{userName.toUpperCase()}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-400 mb-1">
										Beneficiary Name
									</p>
									<div className="flex items-center justify-between">
										<p className="font-mono text-lg font-semibold text-white">
											GROWKAPITAL187813
										</p>
										<button
											onClick={() =>
												copyToClipboard(
													"GROWKAPITAL187813"
												)
											}
											className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
										>
											Copy
										</button>
									</div>
								</div>

								<div>
									<p className="text-sm text-gray-400 mb-1">
										Beneficiary Bank
									</p>
									<div className="flex items-center justify-between">
										<p className="font-semibold text-white">
											HSBC Bank Malaysia Berhad
										</p>
										<button
											onClick={() =>
												copyToClipboard(
													"HSBC Bank Malaysia Berhad"
												)
											}
											className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
										>
											Copy
										</button>
									</div>
								</div>

								<div>
									<p className="text-sm text-gray-400 mb-1">
										Reference (Required)
									</p>
									<div className="flex items-center justify-between">
										<p className="font-mono text-lg font-semibold text-orange-400">
											105358340
										</p>
										<button
											onClick={() =>
												copyToClipboard("105358340")
											}
											className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
										>
											Copy
										</button>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Please enter your reference ID
										accurately in the "Reference field".
										Otherwise, your deposit will be delayed.
									</p>
								</div>
							</div>

							{/* Confirmation Checkbox */}
							<div className="mb-6">
								<label className="flex items-start space-x-3">
									<input
										type="checkbox"
										checked={transferConfirmed}
										onChange={(e) =>
											setTransferConfirmed(
												e.target.checked
											)
										}
										className="mt-1 h-4 w-4 bg-white/5 border-white/10 rounded text-emerald-500 focus:ring-emerald-500"
									/>
									<span className="text-sm text-gray-300">
										I confirm that I have completed the bank
										transfer of{" "}
										{depositAmount
											? formatCurrency(
													parseFloat(depositAmount)
											  )
											: "the specified amount"}{" "}
										to the above bank account details.
									</span>
								</label>
							</div>

							{/* Submit Button */}
							<button
								onClick={handleConfirmTransfer}
								disabled={
									!transferConfirmed ||
									!depositAmount ||
									parseFloat(depositAmount) <= 0
								}
								className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
							>
								Confirm Deposit
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Withdrawal Modal */}
			{showWithdrawModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-white border border-white/10">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold">
									Withdrawal
								</h2>
								<button
									onClick={() => {
										setShowWithdrawModal(false);
										setWithdrawAmount("");
										setSelectedBankAccount("");
									}}
									className="text-gray-400 hover:text-gray-200"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Transfer To Section */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-4">
									Transfer To
								</h3>

								{/* Bank Account Selection */}
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Select Bank Account
									</label>
									<select
										value={selectedBankAccount}
										onChange={(e) =>
											setSelectedBankAccount(
												e.target.value
											)
										}
										className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
									>
										<option value="">
											Select an account
										</option>
										{walletData.bankConnected && (
											<option
												value={`${walletData.bankName} - ${walletData.accountNumber}`}
											>
												{walletData.bankName} -{" "}
												{walletData.accountNumber}
											</option>
										)}
									</select>
								</div>

								{/* Add/Edit Bank Account Link */}
								<div className="text-center">
									<button
										onClick={() => {
											setShowWithdrawModal(false);
											setShowManageBankModal(true);
										}}
										className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
									>
										{walletData.bankConnected
											? "Edit Bank Account"
											: "Add Bank Account"}
									</button>
								</div>
							</div>

							{/* Withdrawal Amount */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium text-gray-300">
										Withdrawal Amount (MYR)
									</label>
									<button
										onClick={() =>
											setWithdrawAmount(
												walletData.availableForWithdrawal.toString()
											)
										}
										className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
									>
										All
									</button>
								</div>
								<input
									type="number"
									value={withdrawAmount}
									onChange={(e) =>
										setWithdrawAmount(e.target.value)
									}
									placeholder="0.00"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-500"
									min="1"
									step="0.01"
									max={walletData.availableForWithdrawal}
								/>
								<div className="flex justify-between text-sm text-gray-400 mt-2">
									<span>Available Amount</span>
									<span>
										{formatCurrency(
											walletData.availableForWithdrawal
										)}
									</span>
								</div>
								<div className="flex justify-between text-sm text-gray-400">
									<span>Bank Fees</span>
									<span>Free</span>
								</div>
								<div className="flex justify-between text-sm text-gray-400">
									<span>Arrival</span>
									<span>Usually 1 Business Day</span>
								</div>
							</div>

							{/* Submit Button */}
							<button
								onClick={handleConfirmWithdrawal}
								disabled={
									!selectedBankAccount ||
									!withdrawAmount ||
									parseFloat(withdrawAmount) <= 0 ||
									parseFloat(withdrawAmount) >
										walletData.availableForWithdrawal
								}
								className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
							>
								Withdraw
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Manage Bank Account Modal */}
			{showManageBankModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-md w-full text-white border border-white/10">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold">
									{walletData.bankConnected
										? "Edit Bank Account"
										: "Add Bank Account"}
								</h2>
								<button
									onClick={() => {
										setShowManageBankModal(false);
										setNewBankName("");
										setNewAccountNumber("");
									}}
									className="text-gray-400 hover:text-gray-200"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Bank Name Input */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Bank Name
								</label>
								<input
									type="text"
									value={newBankName}
									onChange={(e) =>
										setNewBankName(e.target.value)
									}
									placeholder="e.g., Maybank, CIMB Bank"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-500"
									defaultValue={walletData.bankName}
								/>
							</div>

							{/* Account Number Input */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Account Number
								</label>
								<input
									type="text"
									value={newAccountNumber}
									onChange={(e) =>
										setNewAccountNumber(e.target.value)
									}
									placeholder="Enter your account number"
									className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-500"
									defaultValue={walletData.accountNumber}
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex space-x-3">
								<button
									onClick={() => {
										setShowManageBankModal(false);
										setNewBankName("");
										setNewAccountNumber("");
									}}
									className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleEditBankAccount}
									disabled={!newBankName || !newAccountNumber}
									className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
								>
									{walletData.bankConnected
										? "Update"
										: "Add"}
								</button>
							</div>

							{walletData.bankConnected && (
								<div className="mt-6 pt-6 border-t border-white/10">
									<div className="flex items-center space-x-2 text-sm text-gray-400">
										<ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
										<p>
											Updating your bank account will
											affect all future transactions.
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}
