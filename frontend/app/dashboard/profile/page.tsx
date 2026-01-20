"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import "react-phone-input-2/lib/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Home,
  Briefcase,
  Banknote,
  Shield,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  DollarSign,
  CreditCard,
  FileText,
  Eye,
  GraduationCap,
  Pencil,
  EyeOff,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowRight,
  Users,
  Lock,
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { fetchWithTokenRefresh, checkAuth, TokenStorage } from "@/lib/authUtils";
import { validatePhoneNumber } from "@/lib/phoneUtils";
import EnhancedOTPVerification from "@/components/EnhancedOTPVerification";
import PhoneInput from "react-phone-input-2";
import { formatMalaysianIC } from "@/lib/icUtils";
import { checkProfileCompleteness } from "@/lib/profileUtils";

interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  dateOfBirth: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  employmentStatus: string | null;
  employerName: string | null;
  monthlyIncome: string | null;
  serviceLength: string | null;
  bankName: string | null;
  accountNumber: string | null;
  isOnboardingComplete: boolean;
  onboardingStep: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  kycStatus: boolean;
  icNumber?: string | null;
  icType?: string | null;
  educationLevel?: string | null;
  race?: string | null;
  gender?: string | null;
  occupation?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

interface UserDocument {
  id: string;
  type: string;
  status: string;
  fileUrl: string;
  applicationId: string | null;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    product: {
      name: string;
      code: string;
    };
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  // Certificate status state
  const [certificateStatus, setCertificateStatus] = useState<{
    loading: boolean;
    hasValidCert: boolean;
    certificateData?: any;
    nameMatches?: boolean;
    expectedName?: string;
  }>({
    loading: false,
    hasValidCert: false,
  });

  // Password editing state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Phone change states
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [phoneChangeStep, setPhoneChangeStep] = useState<
    "new-phone" | "verify-new" | "success"
  >("new-phone");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneChangeToken, setPhoneChangeToken] = useState("");
  const [phoneChangeError, setPhoneChangeError] = useState("");
  const [phoneChangeLoading, setPhoneChangeLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const data = await fetchWithTokenRefresh<UserDocument[]>(
        `/api/users/me/documents?t=${Date.now()}`
      );

      const uniqueDocuments = data
        ? data.reduce((acc: UserDocument[], current) => {
            const existingIndex = acc.findIndex(
              (doc) => doc.fileUrl === current.fileUrl
            );
            if (existingIndex === -1) {
              acc.push(current);
            } else {
              if (
                new Date(current.createdAt) >
                new Date(acc[existingIndex].createdAt)
              ) {
                acc[existingIndex] = current;
              }
            }
            return acc;
          }, [])
        : [];

      setDocuments(uniqueDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchCertificateStatus = async () => {
    if (!profile?.icNumber) {
      return;
    }

    try {
      setCertificateStatus((prev) => ({ ...prev, loading: true }));

      const certResponse = (await fetchWithTokenRefresh(
        `/api/mtsa/cert-info/${profile.icNumber}?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )) as any;

      const isSuccess =
        certResponse.success && certResponse.data?.statusCode === "000";
      const hasValidCert = isSuccess && certResponse.data?.certStatus === "Valid";

      if (hasValidCert && certResponse.data) {
        const subjectDN = certResponse.data.certSubjectDN || "";
        const expectedName =
          subjectDN
            .split(",")
            .find((part: string) => part.trim().startsWith("CN="))
            ?.replace("CN=", "")
            ?.trim() || "";

        const profileName = (profile.fullName || "").toLowerCase().trim();
        const certName = expectedName.toLowerCase().trim();
        const nameMatches = profileName === certName;

        setCertificateStatus({
          loading: false,
          hasValidCert: true,
          certificateData: certResponse.data,
          nameMatches,
          expectedName,
        });
      } else {
        setCertificateStatus({
          loading: false,
          hasValidCert: false,
        });
      }
    } catch (error) {
      console.error("Error fetching certificate status:", error);
      setCertificateStatus({
        loading: false,
        hasValidCert: false,
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const isAuthenticated = await checkAuth();

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      const data = await fetchWithTokenRefresh<UserProfile>(
        `/api/users/me?t=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split("T")[0];
      }
      setProfile(data);

      fetchDocuments();
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  useEffect(() => {
    if (profile?.icNumber && !certificateStatus.loading) {
      fetchCertificateStatus();
    }
  }, [profile?.icNumber]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profile) {
        fetchProfile();
        fetchDocuments();
        if (profile.icNumber) {
          fetchCertificateStatus();
        }
      }
    };

    const handleFocus = () => {
      if (profile) {
        fetchProfile();
        fetchDocuments();
        if (profile.icNumber) {
          fetchCertificateStatus();
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "profile_updated" && e.newValue) {
        fetchProfile();
        fetchDocuments();
        if (profile?.icNumber) {
          fetchCertificateStatus();
        }
        localStorage.removeItem("profile_updated");
      }

      if (e.key === "mobile_profile_update" && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData.action === "redirect_to_profile" && updateData.url) {
            localStorage.removeItem("mobile_profile_update");
            router.push(updateData.url);
          }
        } catch (error) {
          console.warn("Failed to parse mobile profile update data:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [profile]);

  const profileStatus = checkProfileCompleteness(profile);

  if (loading) {
    return (
      <DashboardLayout
        userName={profile?.fullName?.split(" ")[0] || "User"}
        title="Profile"
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout userName="User" title="Profile">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <p className="text-slate-700 font-body">
              Failed to load profile information.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const formatDocumentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const getFileExtension = (fileUrl: string) => {
    return fileUrl.split(".").pop()?.toUpperCase() || "FILE";
  };

  const handleDocumentView = (document: UserDocument) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

    if (document.applicationId) {
      window.open(
        `${backendUrl}/api/loan-applications/${document.applicationId}/documents/${document.id}`,
        "_blank"
      );
    } else {
      window.open(`/api/users/me/documents/${document.id}`, "_blank");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All password fields are required");
      return;
    }

    if (/\s/.test(passwordData.newPassword)) {
      setPasswordError("New password cannot contain spaces");
      return;
    }

    const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordData.newPassword);
    if (passwordData.newPassword.length < 8 || !hasUppercase || !hasSpecial) {
      setPasswordError(
        "Password must be 8+ chars with 1 uppercase & 1 special character"
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetchWithTokenRefresh("/api/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response) {
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password changed successfully!");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(
        error.message || "Failed to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleStartPhoneChange = () => {
    setIsChangingPhone(true);
    setPhoneChangeStep("new-phone");
    setNewPhoneNumber("");
    setPhoneChangeToken("");
    setPhoneChangeError("");
  };

  const handleCancelPhoneChange = () => {
    setIsChangingPhone(false);
    setPhoneChangeStep("new-phone");
    setNewPhoneNumber("");
    setPhoneChangeToken("");
    setPhoneChangeError("");
  };

  const handleNewPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneChangeError("");

    const phoneValidation = validatePhoneNumber(newPhoneNumber, {
      requireMobile: false,
      allowLandline: true,
    });

    if (!phoneValidation.isValid) {
      setPhoneChangeError(
        phoneValidation.error || "Please enter a valid phone number"
      );
      return;
    }

    if (newPhoneNumber === profile?.phoneNumber) {
      setPhoneChangeError("New phone number must be different from current");
      return;
    }

    setPhoneChangeLoading(true);

    try {
      const data = await fetchWithTokenRefresh<{
        changeToken: string;
        newPhone: string;
        message: string;
      }>("/api/users/me/phone/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPhoneNumber }),
      });

      setPhoneChangeToken(data.changeToken);
      setPhoneChangeStep("verify-new");
    } catch (error) {
      setPhoneChangeError(
        error instanceof Error ? error.message : "Failed to initiate phone change"
      );
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleNewPhoneVerified = (data: any) => {
    setPhoneChangeStep("success");
    fetchProfile();
    toast.success("Phone number updated successfully!");

    setTimeout(() => {
      handleCancelPhoneChange();
    }, 3000);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout
      userName={profile?.fullName?.split(" ")[0] || "User"}
      title="Profile"
    >
      <div className="space-y-6">
        {/* Hero Profile Card */}
        <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full translate-y-32 -translate-x-32" />
          <CardContent className="p-6 lg:p-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24 border-4 border-teal-400/30 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-2xl lg:text-3xl font-heading font-bold">
                    {getInitials(profile?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold mb-1">
                    {profile?.fullName || "User Profile"}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-body">{profile?.phoneNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartPhoneChange}
                      className="text-teal-400 hover:text-teal-300 hover:bg-white/10 h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  </div>
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-slate-400 mt-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-body">{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Progress & Actions */}
              <div className="lg:ml-auto flex flex-col gap-4 lg:items-end">
                {/* Profile Completion */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[280px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-body">Profile Completion</span>
                    <span className="text-sm font-semibold text-teal-400">
                      {profileStatus.completionPercentage}%
                    </span>
                  </div>
                  <Progress
                    value={profileStatus.completionPercentage}
                    className="h-2 bg-slate-700"
                  />
                  {!profileStatus.isComplete && profileStatus.missing.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2 font-body">
                      Missing: {profileStatus.missing.slice(0, 3).join(", ")}
                      {profileStatus.missing.length > 3 && ` +${profileStatus.missing.length - 3} more`}
                    </p>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {profileStatus.isComplete ? (
                    <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                  {profile?.icNumber && (
                    <Badge
                      className={`${
                        certificateStatus.loading
                          ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
                          : certificateStatus.hasValidCert
                            ? certificateStatus.nameMatches
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                      } border`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {certificateStatus.loading
                        ? "Checking..."
                        : certificateStatus.hasValidCert
                          ? certificateStatus.nameMatches
                            ? "Cert Ready"
                            : "Name Mismatch"
                          : "No Certificate"}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => router.push("/onboarding?step=0")}
                  className="bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-lg shadow-teal-500/20"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {profileStatus.isComplete ? "Edit Profile" : "Complete Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Name Mismatch Warning */}
        {certificateStatus.hasValidCert &&
          !certificateStatus.nameMatches &&
          certificateStatus.expectedName && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-800 font-body mb-1">
                      Name Mismatch with Digital Certificate
                    </h4>
                    <p className="text-sm text-amber-700 font-body">
                      Profile: <strong>{profile?.fullName || "Not set"}</strong> | Certificate:{" "}
                      <strong>{certificateStatus.expectedName}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Tabbed Content */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg font-body"
            >
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="employment"
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg font-body"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Employment
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg font-body"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg font-body"
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Basic Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <ProfileRow label="Full Name" value={profile?.fullName} />
                    <ProfileRow label="Email" value={profile?.email} />
                    <ProfileRow
                      label="Date of Birth"
                      value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : null}
                    />
                    <ProfileRow label="Gender" value={profile?.gender} />
                    <ProfileRow label="Race" value={profile?.race} />
                    <ProfileRow label="Education" value={profile?.educationLevel} />
                  </div>
                </CardContent>
              </Card>

              {/* Identity & Certificate */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <CreditCard className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Identity & Certificate
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <ProfileRow
                      label={profile?.icType === "IC" ? "IC Number" : "Passport"}
                      value={
                        profile?.icNumber
                          ? profile.icType === "IC"
                            ? formatMalaysianIC(profile.icNumber)
                            : profile.icNumber
                          : null
                      }
                    />
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-slate-500 font-body">Digital Certificate</p>
                            <p className="text-sm font-medium text-slate-900 font-body">
                              {certificateStatus.loading
                                ? "Checking..."
                                : certificateStatus.hasValidCert
                                  ? `Valid until ${certificateStatus.certificateData?.certValidTo}`
                                  : "Not available"}
                            </p>
                          </div>
                        </div>
                        {certificateStatus.hasValidCert && (
                          <Badge className="bg-green-100 text-green-700">Valid</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Emergency Contact
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <ProfileRow label="Contact Name" value={profile?.emergencyContactName} />
                    <ProfileRow label="Phone Number" value={profile?.emergencyContactPhone} />
                    <ProfileRow label="Relationship" value={profile?.emergencyContactRelationship} />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <Home className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Address
                    </h3>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        {profile?.address1 || profile?.city ? (
                          <>
                            {profile?.address1 && (
                              <p className="text-sm text-slate-900 font-body">{profile.address1}</p>
                            )}
                            {profile?.address2 && (
                              <p className="text-sm text-slate-900 font-body">{profile.address2}</p>
                            )}
                            {(profile?.city || profile?.state || profile?.zipCode) && (
                              <p className="text-sm text-slate-600 font-body">
                                {[profile.city, profile.state, profile.zipCode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-slate-400 italic font-body">
                            Address not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employment Details */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <Briefcase className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Employment Details
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <ProfileRow label="Occupation" value={profile?.occupation} />
                    <ProfileRow label="Employment Status" value={profile?.employmentStatus} />
                    <ProfileRow label="Employer Name" value={profile?.employerName} />
                    <ProfileRow
                      label="Service Length"
                      value={profile?.serviceLength ? `${profile.serviceLength} years` : null}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Income & Banking */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <Banknote className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Income & Banking
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <ProfileRow
                      label="Monthly Income"
                      value={
                        profile?.monthlyIncome
                          ? `RM ${Number(profile.monthlyIncome).toLocaleString()}`
                          : null
                      }
                    />
                    <ProfileRow label="Bank Name" value={profile?.bankName} />
                    <ProfileRow
                      label="Account Number"
                      value={
                        profile?.accountNumber
                          ? "••••" + profile.accountNumber.slice(-4)
                          : null
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">
                        Uploaded Documents
                      </h3>
                      <p className="text-sm text-slate-500 font-body">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
                      </p>
                    </div>
                  </div>
                </div>

                {documentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="group p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
                        onClick={() => handleDocumentView(document)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-900 font-body truncate">
                                {document.type}
                              </h4>
                              {getDocumentStatusBadge(document.status)}
                            </div>
                            <p className="text-xs text-slate-500 font-body">
                              {getFileExtension(document.fileUrl)} • Uploaded{" "}
                              {formatDocumentDate(document.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4 text-teal-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 font-heading mb-2">
                      No Documents Yet
                    </h4>
                    <p className="text-slate-500 font-body mb-6 max-w-sm mx-auto">
                      Documents are uploaded during loan applications.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/apply")}
                      className="bg-teal-400 hover:bg-teal-500 text-white rounded-xl"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <Lock className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">
                        Password & Security
                      </h3>
                      <p className="text-sm text-slate-500 font-body">
                        Manage your account security
                      </p>
                    </div>
                  </div>
                  {!isEditingPassword && (
                    <Button
                      onClick={() => setIsEditingPassword(true)}
                      variant="outline"
                      className="border-teal-200 text-teal-600 hover:bg-teal-50 rounded-xl"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  )}
                </div>

                {!isEditingPassword ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-slate-500 font-body">Password</p>
                            <p className="text-sm font-medium text-slate-900 font-body tracking-widest">
                              ••••••••••••
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-teal-800 font-body">
                            Security Tip
                          </p>
                          <p className="text-sm text-teal-700 font-body">
                            Use a strong password with at least 8 characters, including uppercase
                            letters and special characters.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-sm text-red-700 font-body">{passwordError}</p>
                      </div>
                    )}

                    <PasswordField
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      show={showPasswords.current}
                      onToggle={() => togglePasswordVisibility("current")}
                      placeholder="Enter current password"
                    />

                    <PasswordField
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      show={showPasswords.new}
                      onToggle={() => togglePasswordVisibility("new")}
                      placeholder="Min 8 chars, 1 uppercase, 1 special"
                    />

                    <PasswordField
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      show={showPasswords.confirm}
                      onToggle={() => togglePasswordVisibility("confirm")}
                      placeholder="Confirm new password"
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-teal-400 hover:bg-teal-500 text-white rounded-xl"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          "Save Password"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelPasswordEdit}
                        disabled={passwordLoading}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Phone Change Modal */}
      {isChangingPhone && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelPhoneChange();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 relative">
            {phoneChangeStep === "new-phone" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-teal-500" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      Change Phone Number
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPhoneChange}
                    className="rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-teal-800 font-body mb-1">
                          Current: {profile?.phoneNumber}
                        </p>
                        <p className="text-sm text-teal-700 font-body">
                          You&apos;ll need to verify your new phone number.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleNewPhoneSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 font-body">
                        New Phone Number
                      </label>
                      <div className="relative">
                        <PhoneInput
                          country="my"
                          value={newPhoneNumber}
                          onChange={(value) => {
                            setNewPhoneNumber(value);
                            if (phoneChangeError) setPhoneChangeError("");
                          }}
                          inputProps={{
                            required: true,
                            placeholder: "12 345 6789",
                          }}
                          containerClass="!w-full !relative"
                          inputClass="!w-full !h-12 !pl-16 !pr-4 !py-3 !text-base !font-body !bg-white !border !border-gray-300 !text-slate-900 !placeholder-slate-400 hover:!border-teal-400 focus:!border-teal-400 focus:!ring-2 focus:!ring-teal-400/20 !transition-all !rounded-xl !outline-none"
                          buttonClass="!h-12 !w-14 !border !border-gray-300 !bg-white hover:!bg-gray-50 !text-slate-700 !transition-colors !border-r-0 !rounded-l-xl !absolute !left-0 !top-0 !z-10"
                          dropdownClass="!bg-white !border !border-gray-300 !text-slate-900 !shadow-2xl !rounded-xl !mt-2 !max-h-60 !overflow-y-auto !min-w-80 !z-50"
                          enableSearch
                          disableSearchIcon
                          searchPlaceholder="Search country..."
                          searchClass="!px-3 !py-2 !border-b !border-gray-200 !text-sm"
                        />
                      </div>
                      {phoneChangeError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700 font-body">
                            {phoneChangeError}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelPhoneChange}
                        className="flex-1 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={phoneChangeLoading}
                        className="flex-1 bg-teal-400 hover:bg-teal-500 text-white rounded-xl"
                      >
                        {phoneChangeLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Starting...
                          </div>
                        ) : (
                          "Continue"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {phoneChangeStep === "verify-new" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-teal-500" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      Verify New Phone
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPhoneChange}
                    className="rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-800 font-body mb-1">
                        Verifying: {newPhoneNumber}
                      </p>
                      <p className="text-sm text-teal-700 font-body">
                        Enter the code sent to your new phone.
                      </p>
                    </div>
                  </div>
                </div>

                <EnhancedOTPVerification
                  phoneNumber={newPhoneNumber}
                  purpose="phone-change-new"
                  changeToken={phoneChangeToken}
                  onVerificationSuccess={handleNewPhoneVerified}
                  onBack={() => setPhoneChangeStep("new-phone")}
                />
              </div>
            )}

            {phoneChangeStep === "success" && (
              <div className="p-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">
                    Phone Number Updated!
                  </h3>
                  <p className="text-base text-slate-600 font-body mb-6">
                    Your phone number has been successfully changed.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700 font-body">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                      <span>Closing automatically...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Helper Components
function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 font-body">{label}</span>
      <span className="text-sm font-medium text-slate-900 font-body text-right">
        {value || <span className="text-slate-400 italic">Not provided</span>}
      </span>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 font-body">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 font-body text-slate-900 placeholder-slate-400"
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          {show ? (
            <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
          ) : (
            <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
}
