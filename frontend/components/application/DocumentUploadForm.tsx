import { useState, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Typography,
	CircularProgress,
	Alert,
	Paper,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	ListItemIcon,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";

// Override Material-UI styles for dark theme
const darkThemeOverrides = {
	"& .MuiTypography-root": {
		color: "white !important",
	},
	"& .MuiTypography-h6": {
		color: "white !important",
	},
	"& .MuiTypography-subtitle1": {
		color: "white !important",
	},
	"& .MuiTypography-body2": {
		color: "#D1D5DB !important",
	},
	"& .MuiButton-root": {
		color: "white !important",
		backgroundColor: "rgba(59, 130, 246, 0.8) !important",
		backdropFilter: "blur(12px) !important",
		border: "1px solid rgba(59, 130, 246, 0.5) !important",
		borderRadius: "8px !important",
		padding: "12px 24px !important",
		fontWeight: "500 !important",
		transition: "all 0.2s ease !important",
		boxShadow: "none !important",
		"&:hover": {
			backgroundColor: "rgba(59, 130, 246, 0.9) !important",
			borderColor: "rgba(96, 165, 250, 0.6) !important",
			boxShadow: "none !important",
		},
	},
	"& .MuiButton-outlined": {
		color: "rgb(209, 213, 219) !important",
		backgroundColor: "rgba(31, 41, 55, 0.5) !important",
		backdropFilter: "blur(12px) !important",
		borderColor: "rgba(107, 114, 128, 0.5) !important",
		borderRadius: "8px !important",
		padding: "12px 24px !important",
		fontWeight: "500 !important",
		transition: "all 0.2s ease !important",
		"&:hover": {
			backgroundColor: "rgba(55, 65, 81, 0.6) !important",
			borderColor: "rgba(156, 163, 175, 0.6) !important",
		},
	},
	"& .MuiButton-contained": {
		color: "white !important",
		backgroundColor: "rgba(59, 130, 246, 0.8) !important",
		backdropFilter: "blur(12px) !important",
		border: "1px solid rgba(59, 130, 246, 0.5) !important",
		borderRadius: "8px !important",
		padding: "12px 24px !important",
		fontWeight: "500 !important",
		transition: "all 0.2s ease !important",
		boxShadow: "none !important",
		"&:hover": {
			backgroundColor: "rgba(59, 130, 246, 0.9) !important",
			borderColor: "rgba(96, 165, 250, 0.6) !important",
			boxShadow: "none !important",
		},
	},
	"& .MuiButton-sizeSmall": {
		padding: "8px 16px !important",
		fontSize: "0.875rem !important",
	},
	"& .MuiListItem-root": {
		backgroundColor: "#374151 !important",
		border: "1px solid #4B5563 !important",
		borderRadius: "8px !important",
		marginBottom: "16px !important",
	},
	"& .MuiListItemText-primary": {
		color: "white !important",
	},
	"& .MuiListItemText-secondary": {
		color: "#9CA3AF !important",
	},
	"& .MuiIconButton-root": {
		color: "#9CA3AF !important",
		"&:hover": {
			color: "#F87171 !important",
			backgroundColor: "#7F1D1D20 !important",
		},
	},
	"& .MuiCircularProgress-root": {
		color: "#60A5FA !important",
	},
	"& .MuiAlert-root": {
		backgroundColor: "#374151 !important",
		color: "white !important",
		border: "1px solid #4B5563 !important",
	},
	"& .MuiDialogTitle-root": {
		color: "white",
		backgroundColor: "rgba(31, 41, 55, 0.95)",
		backdropFilter: "blur(20px)",
	},
	"& .MuiDialogContent-root": {
		backgroundColor: "rgba(31, 41, 55, 0.95)",
		backdropFilter: "blur(20px)",
		color: "white",
	},
	"& .MuiDialogActions-root": {
		backgroundColor: "rgba(31, 41, 55, 0.95)",
		backdropFilter: "blur(20px)",
		padding: "24px",
	},
	"& .MuiDialog-paper": {
		backgroundColor: "rgba(31, 41, 55, 0.95) !important",
		backdropFilter: "blur(20px) !important",
		border: "1px solid rgba(75, 85, 99, 0.3) !important",
		borderRadius: "12px !important",
		boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5) !important",
	},
	"& .MuiBackdrop-root": {
		backgroundColor: "rgba(0, 0, 0, 0.8) !important",
		backdropFilter: "blur(4px) !important",
	},
	// Override specific classes for file upload areas
	"& .bg-gray-50": {
		backgroundColor: "#374151 !important",
	},
	"& .bg-white": {
		backgroundColor: "#4B5563 !important",
	},
	"& .text-gray-900": {
		color: "white !important",
	},
	"& .text-gray-600": {
		color: "#D1D5DB !important",
	},
	"& .text-gray-400": {
		color: "#9CA3AF !important",
	},
	"& .text-red-600": {
		color: "#F87171 !important",
	},
	"& .text-green-600": {
		color: "#34D399 !important",
	},
	"& .text-indigo-600": {
		color: "#60A5FA !important",
	},
	"& .border-indigo-600": {
		borderColor: "#60A5FA !important",
	},
	"& .hover\\:bg-indigo-50:hover": {
		backgroundColor: "#1E3A8A20 !important",
	},
	"& .bg-blue-50": {
		backgroundColor: "#1E3A8A20 !important",
	},
	"& .text-blue-700": {
		color: "#60A5FA !important",
	},
	"& .ring-blue-700\\/10": {
		"--tw-ring-color": "rgb(96 165 250 / 0.1) !important",
	},
};
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useSearchParams, usePathname } from "next/navigation";
import { ProductType } from "@/types/product";

interface DocumentUploadFormProps {
	onSubmit?: (values: { documents: File[]; documentTypes: string[] }) => void;
	onBack?: () => void;
	selectedProduct?: ProductType;
	applicationId?: string;
	productCode?: string;
	onSuccess?: () => void;
	existingDocuments?: Array<{
		id: string;
		name: string;
		type: string;
		status: string;
	}>;
}

interface UploadedFile {
	name: string;
	file?: File;
	url?: string;
	id?: string;
}

interface Document {
	id: string;
	name: string;
	type: string;
	status: "pending" | "uploading" | "success" | "error";
	file?: File;
	error?: string;
	files?: UploadedFile[];
	documentType?: string;
	fileUrl?: string;
}

export default function DocumentUploadForm({
	onSubmit,
	onBack,
	selectedProduct,
	applicationId,
	productCode,
	onSuccess,
	existingDocuments,
}: DocumentUploadFormProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [productName, setProductName] = useState<string>("");
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmDialogType, setConfirmDialogType] = useState<
		"none" | "incomplete"
	>("none");

	const getApplicationId = useCallback(() => {
		// First try the prop
		if (applicationId) return applicationId;

		// Then try URL path
		const pathParts = pathname.split("/");
		const idIndex = pathParts.indexOf("applications") + 1;
		if (idIndex > 0 && idIndex < pathParts.length) {
			return pathParts[idIndex];
		}

		// Finally try URL params
		return searchParams.get("applicationId") || undefined;
	}, [applicationId, pathname, searchParams]);

	const getProductCode = useCallback(() => {
		// First try the productCode prop
		if (productCode) {
			console.log("Using productCode prop:", productCode);
			return productCode;
		}

		// Then try the selectedProduct prop
		if (selectedProduct?.code) {
			console.log("Using selectedProduct code:", selectedProduct.code);
			return selectedProduct.code;
		}

		// Then try URL params
		const urlProductCode = searchParams.get("productCode");
		if (urlProductCode) {
			console.log("Using URL productCode param:", urlProductCode);
			return urlProductCode;
		}

		console.log("No product code found in any source");
		return null;
	}, [searchParams, selectedProduct, productCode]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const currentApplicationId = getApplicationId();
				console.log("Current application ID:", currentApplicationId);

				if (!currentApplicationId) {
					throw new Error(
						"Application ID is required. Please ensure you're accessing this page with a valid application ID."
					);
				}

				const productCode = getProductCode();
				console.log("Product code for API call:", productCode);

				if (!productCode) {
					throw new Error(
						"Product code is required. Please ensure a product is selected or provided in the URL."
					);
				}

				// Fetch product details and existing documents in parallel
				const productUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products?code=${productCode}`;
				console.log("Fetching product from URL:", productUrl);

				const [productResponse, documentsResponse] = await Promise.all([
					fetch(productUrl, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
					}),
					fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${currentApplicationId}/documents`,
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem(
									"token"
								)}`,
							},
						}
					),
				]);

				if (!productResponse.ok) {
					console.error("Product API error:", {
						status: productResponse.status,
						statusText: productResponse.statusText,
					});
					throw new Error(
						productResponse.status === 404
							? "Product not found. Please ensure you're using a valid product code."
							: "Failed to fetch product requirements. Please try again later."
					);
				}

				if (!documentsResponse.ok) {
					console.error("Documents API error:", {
						status: documentsResponse.status,
						statusText: documentsResponse.statusText,
					});
					throw new Error(
						"Failed to fetch existing documents. Please try again later."
					);
				}

				const products = await productResponse.json();
				console.log("Products API response:", products);

				const existingDocuments = await documentsResponse.json();
				console.log("Documents API response:", existingDocuments);

				// Handle both array and single object responses
				const productData = Array.isArray(products)
					? products[0]
					: products;

				if (!productData || typeof productData !== "object") {
					throw new Error(
						"Invalid product data received. Please try again later."
					);
				}

				if (!productData.name || !productData.requiredDocuments) {
					throw new Error(
						"Product data is incomplete. Please try again later."
					);
				}

				setProductName(productData.name);

				// Create a map of existing documents by type
				const documentsByType = (existingDocuments || []).reduce(
					(acc: { [key: string]: any[] }, doc: any) => {
						if (!acc[doc.type]) {
							acc[doc.type] = [];
						}
						acc[doc.type].push(doc);
						return acc;
					},
					{}
				);

				// Initialize documents array with required document types and existing files
				const initialDocs = productData.requiredDocuments.map(
					(docName: string, index: number) => {
						const existingDocs = documentsByType[docName] || [];
						return {
							id: `doc-${index}`,
							name: docName,
							type: "file",
							status:
								existingDocs.length > 0 ? "success" : "pending",
							files: existingDocs.map((doc: any) => ({
								name:
									doc.fileUrl?.split("/").pop() ||
									doc.name ||
									"Unknown file",
								url: doc.fileUrl,
								id: doc.id,
							})),
							documentType: docName,
						};
					}
				);

				setDocuments(initialDocs);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unexpected error occurred. Please try again later."
				);
				console.error("Error fetching data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [getApplicationId, getProductCode]);

	const handleFileChange = async (docId: string, file: File) => {
		// Check file size (50MB limit)
		const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
		if (file.size > MAX_FILE_SIZE) {
			setDocuments((prev) =>
				prev.map((doc) =>
					doc.id === docId
						? {
								...doc,
								status: "error",
								error: `File "${file.name}" exceeds the 50MB size limit.`,
						  }
						: doc
				)
			);
			return;
		}

		// Create a new uploaded file object
		const newFile: UploadedFile = {
			name: file.name,
			file: file,
		};

		setDocuments((prev) =>
			prev.map((doc) =>
				doc.id === docId
					? {
							...doc,
							status: "uploading",
							error: undefined,
							files: [...(doc.files || []), newFile],
							documentType: doc.name,
					  }
					: doc
			)
		);

		try {
			// Get application ID from props, URL path, or URL params
			let currentApplicationId: string | undefined = applicationId;

			if (!currentApplicationId) {
				// Try to get from URL path (e.g., /dashboard/applications/[id])
				const pathParts = pathname.split("/");
				const idIndex = pathParts.indexOf("applications") + 1;
				if (idIndex > 0 && idIndex < pathParts.length) {
					currentApplicationId = pathParts[idIndex];
				}
			}

			// Fall back to URL params if still not found
			if (!currentApplicationId) {
				const urlParamId = searchParams.get("applicationId");
				if (urlParamId) {
					currentApplicationId = urlParamId;
				}
			}

			if (!currentApplicationId) {
				throw new Error("Application ID not found");
			}

			// Create FormData and append file
			const formData = new FormData();
			formData.append("documents", file);
			formData.append(
				"documentTypes",
				JSON.stringify([documents.find((d) => d.id === docId)?.name])
			);

			// Upload the file
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${currentApplicationId}/documents`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error("Failed to upload file");
			}

			const uploadedDocs = await response.json();
			const uploadedDoc = uploadedDocs[0];

			// Update the document state with the uploaded file info
			setDocuments((prev) =>
				prev.map((doc) =>
					doc.id === docId
						? {
								...doc,
								status: "success",
								files: [
									...(doc.files || []).slice(0, -1),
									{
										name: file.name,
										url: uploadedDoc.fileUrl,
										id: uploadedDoc.id,
									},
								],
						  }
						: doc
				)
			);
		} catch (err) {
			console.error("Error uploading file:", err);
			setError(
				err instanceof Error ? err.message : "Failed to upload file"
			);
			// Revert the document state on error
			setDocuments((prev) =>
				prev.map((doc) =>
					doc.id === docId
						? {
								...doc,
								status:
									doc.files && doc.files.length > 1
										? "success"
										: "pending",
								files: (doc.files || []).slice(0, -1),
						  }
						: doc
				)
			);
		}
	};

	const handleDelete = async (docId: string, fileToDelete: UploadedFile) => {
		// Set the document to a loading state during deletion
		setDocuments((prev) =>
			prev.map((doc) =>
				doc.id === docId
					? {
							...doc,
							status: "uploading",
					  }
					: doc
			)
		);

		try {
			// Get application ID from props, URL path, or URL params
			let currentApplicationId: string | undefined = applicationId;

			if (!currentApplicationId) {
				// Try to get from URL path (e.g., /dashboard/applications/[id])
				const pathParts = pathname.split("/");
				const idIndex = pathParts.indexOf("applications") + 1;
				if (idIndex > 0 && idIndex < pathParts.length) {
					currentApplicationId = pathParts[idIndex];
				}
			}

			// Fall back to URL params if still not found
			if (!currentApplicationId) {
				const urlParamId = searchParams.get("applicationId");
				if (urlParamId) {
					currentApplicationId = urlParamId;
				}
			}

			if (!currentApplicationId) {
				throw new Error("Application ID not found");
			}

			// If the file has an ID (existing file), delete it from the server
			if (fileToDelete.id) {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${currentApplicationId}/documents/${fileToDelete.id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to delete file");
				}
			}

			// Update local state
			setDocuments((prev) =>
				prev.map((doc) =>
					doc.id === docId
						? {
								...doc,
								status:
									doc.files && doc.files.length === 1
										? "pending"
										: "success",
								error: undefined,
								files:
									doc.files?.filter(
										(f) =>
											f.id !== fileToDelete.id &&
											f !== fileToDelete
									) || [],
						  }
						: doc
				)
			);
		} catch (err) {
			console.error("Error deleting file:", err);
			// Update the document state to show the error
			setDocuments((prev) =>
				prev.map((doc) =>
					doc.id === docId
						? {
								...doc,
								status: "error",
								error: "Failed to delete file. Please try again.",
						  }
						: doc
				)
			);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Check document upload status
		const hasAnyDocuments = documents.some(
			(doc) => doc.files && doc.files.length > 0
		);
		const hasAllDocuments = documents.every(
			(doc) => doc.files && doc.files.length > 0
		);

		if (!hasAnyDocuments) {
			setConfirmDialogType("none");
			setShowConfirmDialog(true);
			return;
		}

		if (!hasAllDocuments) {
			setConfirmDialogType("incomplete");
			setShowConfirmDialog(true);
			return;
		}

		submitDocuments();
	};

	const submitDocuments = () => {
		// Collect files and their types
		const files: File[] = [];
		const documentTypes: string[] = [];

		documents.forEach((doc) => {
			if (doc.files) {
				doc.files.forEach((uploadedFile) => {
					if (uploadedFile.file) {
						files.push(uploadedFile.file);
						documentTypes.push(doc.name);
					}
				});
			}
		});

		if (onSubmit) {
			onSubmit({ documents: files, documentTypes });
		}

		if (onSuccess) {
			onSuccess();
		}
	};

	const handleBack = () => {
		const currentStep = parseInt(searchParams.get("step") || "1", 10);
		const newStep = Math.max(currentStep - 1, 1);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("step", newStep.toString());
		window.location.href = newUrl.toString();
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
					<p className="text-gray-300">Loading documents...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<h2 className="text-xl font-semibold text-white mb-4">
					Upload Documents
				</h2>
				<div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
					<p className="text-red-400">{error}</p>
				</div>
				<div className="flex justify-between pt-6">
					<button
						type="button"
						onClick={handleBack}
						className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 bg-gray-800/50 backdrop-blur-md hover:bg-gray-700/50 transition-colors"
					>
						Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			className="space-y-6"
			sx={darkThemeOverrides}
		>
			<div className="flex items-center gap-3 mb-4">
				<Typography variant="h6" className="text-gray-900">
					Document Upload - {productName}
				</Typography>
				<span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
					Optional
				</span>
			</div>

			<Typography className="text-gray-600 mb-6">
				You can upload your documents now or later. Providing documents
				at this stage will help us process your application faster. All
				documents must be in JPG, PNG, or PDF format and must not exceed
				50MB in size.
			</Typography>

			<List className="space-y-4">
				{documents.map((doc) => (
					<ListItem
						key={doc.id}
						className="bg-gray-50 rounded-lg p-4 flex items-start"
						sx={{ gap: 2 }}
					>
						<ListItemIcon sx={{ minWidth: 40 }}>
							{doc.status === "pending" && (
								<CloudUploadIcon className="text-gray-400" />
							)}
							{doc.status === "uploading" && (
								<CircularProgress size={24} />
							)}
							{doc.status === "success" && (
								<CheckCircleIcon className="text-green-600" />
							)}
							{doc.status === "error" && (
								<ErrorIcon className="text-red-600" />
							)}
						</ListItemIcon>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography
								variant="subtitle1"
								className="text-gray-900"
							>
								{doc.name}
							</Typography>
							{doc.error ? (
								<Typography
									variant="body2"
									className="text-red-600 mt-1"
								>
									{doc.error}
								</Typography>
							) : (
								<Typography
									variant="body2"
									className="text-gray-600 mt-1"
								>
									{doc.status === "uploading"
										? "Uploading..."
										: doc.files && doc.files.length > 0
										? `${doc.files.length} file(s) uploaded`
										: "Click to upload (max 50MB)"}
								</Typography>
							)}
							{doc.files && doc.files.length > 0 && (
								<Box className="mt-3 space-y-2">
									{doc.files.map((file, index) => (
										<Box
											key={index}
											className="flex items-center bg-white p-2 rounded"
										>
											<div className="flex-1 flex items-center min-w-0 mr-2">
												<div className="truncate">
													<Typography
														variant="body2"
														className="text-gray-600"
													>
														{file.name}
													</Typography>
												</div>
												{file.url && (
													<a
														href={`${
															process.env
																.NEXT_PUBLIC_API_URL
														}/api/loan-applications/${getApplicationId()}/documents/${
															file.id
														}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-indigo-600 hover:text-indigo-500 text-sm ml-2 flex-shrink-0"
													>
														View
													</a>
												)}
											</div>
											<IconButton
												onClick={() =>
													handleDelete(doc.id, file)
												}
												disabled={
													doc.status === "uploading"
												}
												size="small"
												className="text-gray-400 hover:text-gray-600"
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Box>
									))}
								</Box>
							)}
						</Box>
						<Box
							sx={{ width: 120, flexShrink: 0 }}
							className="ml-4"
						>
							{/* Show upload button only if no files and not uploading */}
							{!doc.files?.length &&
								doc.status !== "uploading" && (
									<Button
										component="label"
										variant="outlined"
										fullWidth
										size="small"
										className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
									>
										Upload
										<input
											type="file"
											hidden
											multiple
											accept=".jpg,.jpeg,.png,.pdf"
											onChange={(e) => {
												const files = Array.from(
													e.target.files || []
												);
												if (files.length > 0) {
													const invalidFiles =
														files.filter(
															(file) =>
																!file.type.match(
																	/^(image\/(jpeg|png)|application\/pdf)$/
																)
														);
													if (
														invalidFiles.length > 0
													) {
														setDocuments((prev) =>
															prev.map((d) =>
																d.id === doc.id
																	? {
																			...d,
																			status: "error",
																			error: "Invalid file type. Only JPG, PNG, and PDF files are allowed.",
																	  }
																	: d
															)
														);
														return;
													}
													files.forEach((file) => {
														handleFileChange(
															doc.id,
															file
														);
													});
												}
											}}
										/>
									</Button>
								)}
							{/* Add More button when files exist */}
							{doc.files &&
								doc.files.length > 0 &&
								doc.status !== "uploading" && (
									<Button
										component="label"
										variant="outlined"
										fullWidth
										size="small"
										className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
									>
										Add More
										<input
											type="file"
											hidden
											multiple
											accept=".jpg,.jpeg,.png,.pdf"
											onChange={(e) => {
												const files = Array.from(
													e.target.files || []
												);
												if (files.length > 0) {
													const invalidFiles =
														files.filter(
															(file) =>
																!file.type.match(
																	/^(image\/(jpeg|png)|application\/pdf)$/
																)
														);
													if (
														invalidFiles.length > 0
													) {
														setDocuments((prev) =>
															prev.map((d) =>
																d.id === doc.id
																	? {
																			...d,
																			status: "error",
																			error: "Invalid file type. Only JPG, PNG, and PDF files are allowed.",
																	  }
																	: d
															)
														);
														return;
													}
													files.forEach((file) => {
														handleFileChange(
															doc.id,
															file
														);
													});
												}
											}}
										/>
									</Button>
								)}
						</Box>
					</ListItem>
				))}
			</List>

			<Box className="flex justify-between pt-6">
				<Button
					type="button"
					variant="outlined"
					onClick={handleBack}
					className="text-gray-700 border-gray-300 hover:bg-gray-50"
				>
					Back
				</Button>
				<Button
					type="submit"
					variant="contained"
					className="bg-indigo-600 hover:bg-indigo-700 text-white"
				>
					{documents.some((doc) => doc.files && doc.files.length > 0)
						? "Continue"
						: "Continue Without Uploading"}
				</Button>
			</Box>

			<Dialog
				open={showConfirmDialog}
				onClose={() => setShowConfirmDialog(false)}
				maxWidth="sm"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: "rgba(31, 41, 55, 0.95)",
						backdropFilter: "blur(20px)",
						border: "1px solid rgba(75, 85, 99, 0.3)",
						borderRadius: "12px",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
					},
					"& .MuiBackdrop-root": {
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						backdropFilter: "blur(4px)",
					},
					"& .MuiDialogTitle-root": {
						color: "white",
						backgroundColor: "rgba(31, 41, 55, 0.95)",
						backdropFilter: "blur(20px)",
					},
					"& .MuiDialogContent-root": {
						backgroundColor: "rgba(31, 41, 55, 0.95)",
						backdropFilter: "blur(20px)",
						color: "white",
					},
					"& .MuiDialogActions-root": {
						backgroundColor: "rgba(31, 41, 55, 0.95)",
						backdropFilter: "blur(20px)",
						padding: "24px",
					},
					"& .MuiTypography-root": {
						color: "white",
					},
					"& .MuiButton-outlined": {
						color: "rgb(209, 213, 219)",
						backgroundColor: "rgba(31, 41, 55, 0.5)",
						backdropFilter: "blur(12px)",
						borderColor: "rgba(107, 114, 128, 0.5)",
						"&:hover": {
							backgroundColor: "rgba(55, 65, 81, 0.6)",
							borderColor: "rgba(156, 163, 175, 0.6)",
						},
					},
					"& .MuiButton-contained": {
						color: "white",
						backgroundColor: "rgba(59, 130, 246, 0.8)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(59, 130, 246, 0.5)",
						boxShadow: "none",
						"&:hover": {
							backgroundColor: "rgba(59, 130, 246, 0.9)",
							borderColor: "rgba(96, 165, 250, 0.6)",
							boxShadow: "none",
						},
					},
				}}
			>
				<DialogTitle>
					{confirmDialogType === "none"
						? "Continue Without Documents?"
						: "Continue With Incomplete Documents?"}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{confirmDialogType === "none"
							? "While document upload is optional, providing complete documentation at this stage will help us process your application faster. You can always upload documents later."
							: "You haven't uploaded all the requested documents. While you can continue with incomplete documentation, providing all documents at this stage will help us process your application faster. You can always upload the remaining documents later."}
					</Typography>
					{confirmDialogType === "incomplete" && (
						<Box className="mt-4">
							<Typography variant="subtitle2" className="mb-2">
								Missing Documents:
							</Typography>
							<ul className="list-disc pl-5">
								{documents
									.filter(
										(doc) =>
											!doc.files || doc.files.length === 0
									)
									.map((doc) => (
										<li key={doc.id} className="text-sm">
											{doc.name}
										</li>
									))}
							</ul>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setShowConfirmDialog(false)}
						variant="outlined"
					>
						Go Back
					</Button>
					<Button
						onClick={() => {
							setShowConfirmDialog(false);
							submitDocuments();
						}}
						variant="contained"
					>
						{confirmDialogType === "none"
							? "Continue Without Documents"
							: "Continue With Incomplete Documents"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
