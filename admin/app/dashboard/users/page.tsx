"use client";

import React from "react";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { fetchWithAdminTokenRefresh } from "../../../lib/authUtils";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface User {
	id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	role: string;
	createdAt: string;
}

interface LoanApplication {
	id: string;
	userId: string;
	status: string;
	amount?: number;
	createdAt: string;
	updatedAt: string;
	product?: {
		name?: string;
	};
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [userName, setUserName] = useState("Admin");
	const router = useRouter();

	// Dialog states
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [userLoans, setUserLoans] = useState<LoanApplication[]>([]);
	const [loadingLoans, setLoadingLoans] = useState(false);

	// Form states
	const [editForm, setEditForm] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
		role: "",
	});
	const [createForm, setCreateForm] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
		role: "USER",
		password: "",
	});

	// Loading states
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);

				// Fetch user data with token refresh
				try {
					const userData = await fetchWithAdminTokenRefresh<any>(
						"/api/users/me"
					);
					if (userData.fullName) {
						setUserName(userData.fullName);
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
				}

				// Fetch all users with token refresh
				const users = await fetchWithAdminTokenRefresh<User[]>(
					"/api/admin/users"
				);
				setUsers(users);
			} catch (error) {
				console.error("Error fetching users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const filteredUsers = users.filter((user) => {
		const searchTerm = search.toLowerCase();
		return (
			(user.fullName?.toLowerCase() || "").includes(searchTerm) ||
			(user.email?.toLowerCase() || "").includes(searchTerm) ||
			(user.phoneNumber?.toLowerCase() || "").includes(searchTerm) ||
			(user.role?.toLowerCase() || "").includes(searchTerm)
		);
	});

	// Handle edit user
	const handleEditClick = (user: User) => {
		setSelectedUser(user);
		setEditForm({
			fullName: user.fullName,
			email: user.email,
			phoneNumber: user.phoneNumber,
			role: user.role,
		});
		setEditDialogOpen(true);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleEditSelectChange = (e: SelectChangeEvent) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleEditSubmit = async () => {
		if (!selectedUser) return;

		try {
			setIsSubmitting(true);

			// Update user with token refresh
			const updatedUser = await fetchWithAdminTokenRefresh<User>(
				`/api/admin/users/${selectedUser.id}`,
				{
					method: "PUT",
					body: JSON.stringify(editForm),
				}
			);

			// Update the local state with the complete updated user data
			setUsers(
				users.map((user) =>
					user.id === selectedUser.id ? updatedUser : user
				)
			);

			setEditDialogOpen(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Error updating user:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditCancel = () => {
		setEditDialogOpen(false);
		setSelectedUser(null);
	};

	// Handle create user
	const handleCreateClick = () => {
		setCreateForm({
			fullName: "",
			email: "",
			phoneNumber: "",
			role: "USER",
			password: "",
		});
		setCreateDialogOpen(true);
	};

	const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCreateForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCreateSelectChange = (e: SelectChangeEvent) => {
		const { name, value } = e.target;
		setCreateForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsSubmitting(true);

			// Create user with token refresh
			const newUser = await fetchWithAdminTokenRefresh<User>(
				"/api/auth/signup",
				{
					method: "POST",
					body: JSON.stringify({
						fullName: createForm.fullName,
						email: createForm.email,
						phoneNumber: createForm.phoneNumber,
						password: createForm.password,
						role: createForm.role,
					}),
				}
			);

			setUsers([...users, newUser]);
			setCreateDialogOpen(false);
			setCreateForm({
				fullName: "",
				email: "",
				phoneNumber: "",
				password: "",
				role: "USER",
			});
		} catch (error) {
			console.error("Error creating user:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCreateCancel = () => {
		setCreateDialogOpen(false);
	};

	// Handle delete user
	const handleDeleteClick = (user: User) => {
		setSelectedUser(user);
		setDeleteDialogOpen(true);
	};

	const handleDeleteSubmit = async () => {
		if (!selectedUser) return;

		try {
			setIsSubmitting(true);

			// Delete user with token refresh
			await fetchWithAdminTokenRefresh<void>(
				`/api/admin/users/${selectedUser.id}`,
				{
					method: "DELETE",
				}
			);

			// Update the local state to remove the deleted user
			setUsers(users.filter((user) => user.id !== selectedUser.id));
			setDeleteDialogOpen(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Error deleting user:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setSelectedUser(null);
	};

	// New function to handle viewing user details and applications
	const handleViewClick = async (user: User) => {
		setSelectedUser(user);
		setViewDialogOpen(true);
		setLoadingLoans(true);

		try {
			// Fetch all applications
			const applications = await fetchWithAdminTokenRefresh<
				LoanApplication[]
			>("/api/admin/applications");

			// Filter applications for this user
			const userLoans = applications.filter(
				(app) => app.userId === user.id
			);
			setUserLoans(userLoans);
		} catch (error) {
			console.error("Error fetching user loans:", error);
			setUserLoans([]);
		} finally {
			setLoadingLoans(false);
		}
	};

	const handleViewClose = () => {
		setViewDialogOpen(false);
		setSelectedUser(null);
		setUserLoans([]);
	};

	const handleViewLoanDetails = (loanId: string, status: string) => {
		// Close dialog
		setViewDialogOpen(false);

		// Determine which page to navigate to based on loan status
		if (status === "APPROVED" || status === "DISBURSED") {
			router.push(`/dashboard/loans?id=${loanId}`);
		} else {
			router.push(`/dashboard/applications?id=${loanId}`);
		}
	};

	// Helper function for loan status colors
	const getStatusColor = (status: string): string => {
		const statusMap: Record<string, string> = {
			INCOMPLETE: "bg-gray-100 text-gray-800",
			PENDING_APP_FEE: "bg-blue-100 text-blue-800",
			PENDING_KYC: "bg-indigo-100 text-indigo-800",
			PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
			APPROVED: "bg-green-100 text-green-800",
			DISBURSED: "bg-purple-100 text-purple-800",
			REJECTED: "bg-red-100 text-red-800",
			WITHDRAWN: "bg-gray-100 text-gray-800",
		};

		return statusMap[status] || "bg-gray-100 text-gray-800";
	};

	// Format currency helper function
	const formatCurrency = (amount?: number) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	if (loading) {
		return (
			<AdminLayout userName={userName}>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout
			title="Users"
			description="Manage and view all users in the system"
		>
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-gray-900">
							Users
						</h2>
						<button
							onClick={handleCreateClick}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Create User
						</button>
					</div>

					{/* Search Bar */}
					<div className="mt-4 max-w-md">
						<input
							type="text"
							placeholder="Search users..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						/>
					</div>
				</div>

				{/* Users Table */}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Email
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Phone
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Role
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Joined
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<tr key={user.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{user.fullName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">
												{user.email}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">
												{user.phoneNumber}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
													user.role === "ADMIN"
														? "bg-purple-100 text-purple-800"
														: "bg-green-100 text-green-800"
												}`}
											>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(user.createdAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														handleViewClick(user)
													}
													className="text-blue-600 hover:text-blue-900"
												>
													View
												</button>
												<button
													onClick={() =>
														handleEditClick(user)
													}
													className="text-indigo-600 hover:text-indigo-900"
												>
													Edit
												</button>
												<button
													onClick={() =>
														handleDeleteClick(user)
													}
													className="text-red-600 hover:text-red-900"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr key="no-users">
									<td
										colSpan={6}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
									>
										No users found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Edit User Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleEditCancel}
				aria-labelledby="edit-dialog-title"
				aria-describedby="edit-dialog-description"
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle id="edit-dialog-title">Edit User</DialogTitle>
				<DialogContent>
					<div className="mt-4 space-y-4">
						<TextField
							autoFocus
							margin="dense"
							id="fullName"
							name="fullName"
							label="Full Name"
							type="text"
							fullWidth
							value={editForm.fullName}
							onChange={handleEditChange}
						/>
						<TextField
							margin="dense"
							id="email"
							name="email"
							label="Email"
							type="email"
							fullWidth
							value={editForm.email}
							onChange={handleEditChange}
						/>
						<TextField
							margin="dense"
							id="phoneNumber"
							name="phoneNumber"
							label="Phone Number"
							type="text"
							fullWidth
							value={editForm.phoneNumber}
							onChange={handleEditChange}
						/>
						<FormControl fullWidth margin="dense">
							<InputLabel id="role-label">Role</InputLabel>
							<Select
								labelId="role-label"
								id="role"
								name="role"
								value={editForm.role}
								label="Role"
								onChange={handleEditSelectChange}
							>
								<MenuItem value="USER">User</MenuItem>
								<MenuItem value="ADMIN">Admin</MenuItem>
							</Select>
						</FormControl>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditCancel} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleEditSubmit}
						color="primary"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Create User Dialog */}
			<Dialog
				open={createDialogOpen}
				onClose={handleCreateCancel}
				aria-labelledby="create-dialog-title"
				aria-describedby="create-dialog-description"
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle id="create-dialog-title">
					Create New User
				</DialogTitle>
				<DialogContent>
					<div className="mt-4 space-y-4">
						<TextField
							autoFocus
							margin="dense"
							id="fullName"
							name="fullName"
							label="Full Name"
							type="text"
							fullWidth
							value={createForm.fullName}
							onChange={handleCreateChange}
						/>
						<TextField
							margin="dense"
							id="email"
							name="email"
							label="Email"
							type="email"
							fullWidth
							value={createForm.email}
							onChange={handleCreateChange}
						/>
						<TextField
							margin="dense"
							id="phoneNumber"
							name="phoneNumber"
							label="Phone Number"
							type="text"
							fullWidth
							value={createForm.phoneNumber}
							onChange={handleCreateChange}
						/>
						<TextField
							margin="dense"
							id="password"
							name="password"
							label="Password"
							type="password"
							fullWidth
							value={createForm.password}
							onChange={handleCreateChange}
						/>
						<FormControl fullWidth margin="dense">
							<InputLabel id="role-label">Role</InputLabel>
							<Select
								labelId="role-label"
								id="role"
								name="role"
								value={createForm.role}
								label="Role"
								onChange={handleCreateSelectChange}
							>
								<MenuItem value="USER">User</MenuItem>
								<MenuItem value="ADMIN">Admin</MenuItem>
							</Select>
						</FormControl>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCreateCancel} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleCreateSubmit}
						color="primary"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Creating..." : "Create"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete User Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">Delete User</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						Are you sure you want to delete {selectedUser?.fullName}
						? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleDeleteSubmit}
						color="error"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add View User Dialog */}
			<Dialog
				open={viewDialogOpen}
				onClose={handleViewClose}
				aria-labelledby="view-dialog-title"
				maxWidth="md"
				fullWidth
			>
				<DialogTitle
					id="view-dialog-title"
					className="flex justify-between items-center"
				>
					<span>User Details</span>
					<Button onClick={handleViewClose} color="primary">
						Close
					</Button>
				</DialogTitle>
				<DialogContent>
					{selectedUser && (
						<div className="space-y-6 mt-2">
							{/* User Information */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-lg font-semibold mb-4">
									User Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium text-gray-500">
												Name
											</p>
											<p className="text-md text-gray-900">
												{selectedUser.fullName}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">
												Email
											</p>
											<p className="text-md text-gray-900">
												{selectedUser.email}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium text-gray-500">
												Phone
											</p>
											<p className="text-md text-gray-900">
												{selectedUser.phoneNumber}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">
												Role
											</p>
											<p className="text-md text-gray-900">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
														selectedUser.role ===
														"ADMIN"
															? "bg-purple-100 text-purple-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{selectedUser.role}
												</span>
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Loans Information */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-lg font-semibold mb-4">
									Loan Applications
								</h3>

								{loadingLoans ? (
									<div className="flex justify-center py-6">
										<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
									</div>
								) : userLoans.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Loan ID
													</th>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Product
													</th>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Amount
													</th>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Status
													</th>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Date
													</th>
													<th
														scope="col"
														className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
													>
														Action
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{userLoans.map((loan) => (
													<tr key={loan.id}>
														<td className="px-3 py-2 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{loan.id.substring(
																	0,
																	8
																)}
															</div>
														</td>
														<td className="px-3 py-2 whitespace-nowrap">
															<div className="text-sm text-gray-900">
																{loan.product
																	?.name ||
																	"N/A"}
															</div>
														</td>
														<td className="px-3 py-2 whitespace-nowrap">
															<div className="text-sm text-gray-900">
																{formatCurrency(
																	loan.amount
																)}
															</div>
														</td>
														<td className="px-3 py-2 whitespace-nowrap">
															<span
																className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
																	loan.status
																)}`}
															>
																{loan.status.replace(
																	/_/g,
																	" "
																)}
															</span>
														</td>
														<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
															{formatDate(
																loan.createdAt
															)}
														</td>
														<td className="px-3 py-2 whitespace-nowrap">
															<button
																onClick={() =>
																	handleViewLoanDetails(
																		loan.id,
																		loan.status
																	)
																}
																className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
															>
																View Details
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-6 text-gray-500">
										No loan applications found for this
										user.
									</div>
								)}
							</div>

							{/* Account Activity */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-lg font-semibold mb-4">
									Account Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium text-gray-500">
												Account Created
											</p>
											<p className="text-md text-gray-900">
												{formatDate(
													selectedUser.createdAt
												)}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium text-gray-500">
												Total Applications
											</p>
											<p className="text-md text-gray-900">
												{userLoans.length}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</AdminLayout>
	);
}
