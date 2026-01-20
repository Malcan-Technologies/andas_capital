"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import PieChart from "@/components/PieChart";
import ActionNotificationBar from "@/components/ActionNotificationBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Wallet,
  CreditCard,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Target,
  PiggyBank,
} from "lucide-react";
import {
  TokenStorage,
  fetchWithTokenRefresh,
  checkAuth,
} from "@/lib/authUtils";
import { checkProfileCompleteness } from "@/lib/profileUtils";

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

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    availableForWithdrawal: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalDisbursed: 0,
    pendingTransactions: 0,
    bankConnected: false,
  });
  const [incompleteApplications, setIncompleteApplications] = useState<any[]>(
    []
  );
  const [loans, setLoans] = useState<any[]>([]);
  const [loanSummary, setLoanSummary] = useState<any>({
    totalOutstanding: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    nextPaymentDue: null,
    nextPaymentAmount: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const accessToken = TokenStorage.getAccessToken();
        const refreshToken = TokenStorage.getRefreshToken();

        if (!accessToken && !refreshToken) {
          console.error(
            "Dashboard - No tokens available, redirecting to login"
          );
          router.push("/login");
          return;
        }

        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          console.error("Dashboard - Auth check failed, redirecting to login");
          TokenStorage.clearTokens();
          router.push("/login");
          return;
        }

        const data = await fetchWithTokenRefresh<any>("/api/users/me");
        setUserProfile(data);
        fetchWalletData();

        if (data.firstName) {
          setUserName(data.firstName);
        } else if (data.fullName) {
          const firstPart = data.fullName.split(" ")[0];
          setUserName(firstPart);
        } else {
          setUserName("Guest");
        }

        fetchIncompleteApplications();
        fetchLoans();
        fetchLoanSummary();
        fetchTransactions();
      } catch (error) {
        console.error("Dashboard - Auth check error:", error);
        TokenStorage.clearTokens();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const fetchWalletData = async () => {
    try {
      const data = await fetchWithTokenRefresh<
        WalletData & { loanSummary: any }
      >("/api/wallet");
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
      console.error("Error fetching wallet data:", error);
    }
  };

  const fetchIncompleteApplications = async () => {
    try {
      const data = await fetchWithTokenRefresh<any[]>("/api/loan-applications");
      const filteredApps = data.filter((app: any) =>
        [
          "INCOMPLETE",
          "PENDING_APP_FEE",
          "PENDING_KYC",
          "PENDING_PROFILE_CONFIRMATION",
          "PENDING_APPROVAL",
          "PENDING_FRESH_OFFER",
          "APPROVED",
          "PENDING_ATTESTATION",
          "CERT_CHECK",
          "PENDING_SIGNING_OTP",
          "PENDING_CERTIFICATE_OTP",
          "PENDING_SIGNATURE",
          "REJECTED",
        ].includes(app.status)
      );
      setIncompleteApplications(filteredApps);
    } catch (error) {
      console.error("Error fetching incomplete applications:", error);
    }
  };

  const fetchLoans = async () => {
    try {
      const data = await fetchWithTokenRefresh<{ loans: any[] }>("/api/loans");
      if (data?.loans) {
        setLoans(data.loans);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const fetchLoanSummary = async () => {
    try {
      const data = await fetchWithTokenRefresh<any>("/api/wallet");
      if (data?.loanSummary) {
        setLoanSummary(data.loanSummary);
      }
    } catch (error) {
      console.error("Error fetching loan summary:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await fetchWithTokenRefresh<any>(
        "/api/wallet/transactions?limit=3"
      );
      if (data?.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateNextPaymentInfo = () => {
    if (!loans || loans.length === 0) {
      return {
        amount: 0,
        isOverdue: false,
        includesLateFees: false,
        description: "No payments due",
        dueDate: null,
        totalLateFees: 0,
      };
    }

    let nextPayment = null;
    let earliestDueDate = null;
    let totalLateFees = 0;

    const activeLoans = loans.filter(
      (loan) => loan.status === "ACTIVE" || loan.status === "PENDING_DISCHARGE"
    );

    for (const loan of activeLoans) {
      if (
        loan.overdueInfo?.hasOverduePayments &&
        loan.overdueInfo?.totalLateFees > 0
      ) {
        totalLateFees += loan.overdueInfo.totalLateFees;
      }
    }

    for (const loan of activeLoans) {
      if (loan.nextPaymentInfo && loan.nextPaymentInfo.amount > 0) {
        let actualDueDate = null;

        if (
          loan.overdueInfo?.hasOverduePayments &&
          loan.overdueInfo?.overdueRepayments &&
          loan.overdueInfo.overdueRepayments.length > 0
        ) {
          const earliestOverdueDate = loan.overdueInfo.overdueRepayments
            .map((rep: any) => new Date(rep.dueDate))
            .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];
          actualDueDate = earliestOverdueDate;
        } else if (loan.nextPaymentDue) {
          actualDueDate = new Date(loan.nextPaymentDue);
        }

        if (
          !nextPayment ||
          (actualDueDate &&
            (!earliestDueDate || actualDueDate < earliestDueDate))
        ) {
          nextPayment = {
            ...loan.nextPaymentInfo,
            dueDate: actualDueDate ? actualDueDate.toISOString() : null,
          };
          earliestDueDate = actualDueDate;
        }
      }
    }

    if (nextPayment && totalLateFees > 0) {
      return {
        ...nextPayment,
        amount: nextPayment.amount + totalLateFees,
        includesLateFees: true,
        totalLateFees,
        description:
          totalLateFees > 0
            ? `Includes ${formatCurrency(totalLateFees)} late fees`
            : nextPayment.description,
      };
    }

    if (totalLateFees > 0) {
      return {
        amount: totalLateFees,
        isOverdue: true,
        includesLateFees: true,
        totalLateFees,
        description: "Outstanding late fees",
        dueDate: null,
      };
    }

    return (
      nextPayment || {
        amount: 0,
        isOverdue: false,
        includesLateFees: false,
        description: "No payments due",
        dueDate: null,
        totalLateFees: 0,
      }
    );
  };

  const getActionNotifications = () => {
    const notifications: any[] = [];

    const profileStatus = checkProfileCompleteness(userProfile);
    if (!profileStatus.isComplete && profileStatus.missing.length > 0) {
      notifications.push({
        id: "profile-incomplete",
        type: "PROFILE_INCOMPLETE" as const,
        title: "Complete Your Profile",
        description: `Your profile is ${profileStatus.completionPercentage}% complete. Missing: ${profileStatus.missing.join(", ")}`,
        buttonText: "Complete Profile",
        buttonHref: "/dashboard/profile",
        priority: "MEDIUM" as const,
        metadata: {
          completionPercentage: profileStatus.completionPercentage,
          missing: profileStatus.missing,
          date: "Complete for better loan eligibility",
        },
      });
    }

    const actionableApps = incompleteApplications.filter((app: any) =>
      [
        "INCOMPLETE",
        "PENDING_APP_FEE",
        "PENDING_KYC",
        "APPROVED",
        "PENDING_FRESH_OFFER",
        "PENDING_ATTESTATION",
        "CERT_CHECK",
        "PENDING_SIGNING_OTP",
        "PENDING_PROFILE_CONFIRMATION",
        "PENDING_CERTIFICATE_OTP",
        "PENDING_SIGNING_OTP_DS",
        "PENDING_SIGNATURE",
      ].includes(app.status)
    );

    const appNotifications = actionableApps.map((app: any) => {
      const getNotificationData = (status: string) => {
        switch (status) {
          case "INCOMPLETE":
            return {
              type: "INCOMPLETE_APPLICATION" as const,
              title: "Complete Your Loan Application",
              description: `You have an incomplete application for ${
                app.product?.name || "loan"
              }${
                app.amount ? ` of ${formatCurrency(parseFloat(app.amount))}` : ""
              }`,
              buttonText: "Resume Application",
              buttonHref: `/dashboard/apply?applicationId=${app.id}&step=${app.appStep}&productCode=${app.product?.code || ""}`,
              priority: "HIGH" as const,
            };
          case "PENDING_APP_FEE":
            return {
              type: "PENDING_APP_FEE" as const,
              title: "Application Fee Payment Required",
              description: `Your loan application is pending fee payment for ${
                app.product?.name || "loan"
              }${
                app.amount ? ` of ${formatCurrency(parseFloat(app.amount))}` : ""
              }`,
              buttonText: "Pay Fee",
              buttonHref: `/dashboard/applications/${app.id}`,
              priority: "HIGH" as const,
            };
          case "PENDING_KYC":
            return {
              type: "PENDING_KYC" as const,
              title: "KYC Verification Required",
              description: `Your application for ${
                app.product?.name || "loan"
              }${
                app.amount ? ` of ${formatCurrency(parseFloat(app.amount))}` : ""
              } requires identity verification`,
              buttonText: "Continue KYC",
              buttonHref: `/dashboard/applications/${app.id}/kyc-verification`,
              priority: "HIGH" as const,
            };
          case "APPROVED":
            return {
              type: "APPROVED" as const,
              title: "Loan Application Approved!",
              description: `Your application for ${
                app.product?.name || "loan"
              }${
                app.amount ? ` of ${formatCurrency(parseFloat(app.amount))}` : ""
              } has been approved`,
              buttonText: "View Details",
              buttonHref: `/dashboard/applications/${app.id}`,
              priority: "MEDIUM" as const,
            };
          case "PENDING_FRESH_OFFER":
            return {
              type: "PENDING_FRESH_OFFER" as const,
              title: "Fresh Offer Available",
              description: `New offer for your ${app.product?.name || "loan"} application`,
              buttonText: "Review Offer",
              buttonHref: `/dashboard/loans?tab=applications&scroll=true`,
              priority: "HIGH" as const,
            };
          case "PENDING_ATTESTATION":
            return {
              type: "PENDING_ATTESTATION" as const,
              title: "Attestation Required",
              description: `Your loan requires attestation to proceed`,
              buttonText: "Complete Attestation",
              buttonHref: `/dashboard/applications/${app.id}/attestation`,
              priority: "HIGH" as const,
            };
          case "CERT_CHECK":
            return {
              type: "CERT_CHECK" as const,
              title: "Certificate Verification",
              description: `Checking digital certificate status`,
              buttonText: "Check Certificate",
              buttonHref: `/dashboard/applications/${app.id}/cert-check`,
              priority: "HIGH" as const,
            };
          case "PENDING_SIGNING_OTP":
            return {
              type: "PENDING_SIGNING_OTP" as const,
              title: "OTP Verification Required",
              description: `OTP verification needed before signing`,
              buttonText: "Complete OTP",
              buttonHref: `/dashboard/applications/${app.id}/otp-verification`,
              priority: "HIGH" as const,
            };
          case "PENDING_CERTIFICATE_OTP":
            return {
              type: "PENDING_CERTIFICATE_OTP" as const,
              title: "Certificate OTP Required",
              description: `Certificate OTP verification needed`,
              buttonText: "Complete OTP",
              buttonHref: `/dashboard/applications/${app.id}/otp-verification`,
              priority: "HIGH" as const,
            };
          case "PENDING_PROFILE_CONFIRMATION":
            return {
              type: "PENDING_PROFILE_CONFIRMATION" as const,
              title: "Profile Confirmation Required",
              description: `Please confirm your personal details`,
              buttonText: "Confirm Profile",
              buttonHref: `/dashboard/applications/${app.id}/profile-confirmation`,
              priority: "HIGH" as const,
            };
          case "PENDING_SIGNING_OTP_DS":
            return {
              type: "PENDING_SIGNING_OTP_DS" as const,
              title: "Digital Signature Verification",
              description: `Complete signature verification`,
              buttonText: "Complete Verification",
              buttonHref: `/dashboard/applications/${app.id}/signing-otp-verification`,
              priority: "HIGH" as const,
            };
          case "PENDING_SIGNATURE":
            if (
              app.loan?.agreementStatus === "BORROWER_SIGNED" ||
              app.loan?.agreementStatus === "WITNESS_SIGNED"
            ) {
              return null;
            }
            return {
              type: "PENDING_SIGNATURE" as const,
              title: "Document Signing Required",
              description: `Digital signature needed to proceed`,
              buttonText: app.loan?.docusealSignUrl
                ? "Resume Signing"
                : "Sign Agreement",
              buttonHref: `/dashboard/loans?tab=applications&scroll=true`,
              priority: "HIGH" as const,
            };
          default:
            return {
              type: "INCOMPLETE_APPLICATION" as const,
              title: "Application Update",
              description: "Your loan application requires attention",
              buttonText: "View Application",
              buttonHref: `/dashboard/applications/${app.id}`,
              priority: "MEDIUM" as const,
            };
        }
      };

      const notificationData = getNotificationData(app.status);
      if (!notificationData) return null;

      return {
        id: app.id,
        ...notificationData,
        metadata: {
          productName: app.product?.name,
          amount: app.amount
            ? formatCurrency(parseFloat(app.amount))
            : undefined,
          date:
            app.status === "APPROVED"
              ? `Approved on ${formatDate(app.approvedAt || app.updatedAt)}`
              : `Started on ${formatDate(app.createdAt)}`,
          applicationId: app.id,
        },
      };
    });

    const validAppNotifications = appNotifications.filter(
      (notification) => notification !== null
    );
    return [...notifications, ...validAppNotifications];
  };

  // Calculate data
  const activeLoans = loans.filter(
    (loan) => loan.status === "ACTIVE" || loan.status === "PENDING_DISCHARGE"
  );

  const totalBorrowed = activeLoans.reduce(
    (sum, loan) => sum + (loan.totalAmount || 0),
    0
  );

  const totalOutstanding = activeLoans.reduce(
    (sum, loan) => sum + (loan.outstandingBalance || 0),
    0
  );

  const totalPrincipalPaid = activeLoans.reduce((sum, loan) => {
    if (!loan.repayments) return sum;
    const loanPrincipalPaid = loan.repayments.reduce(
      (loanSum: number, repayment: any) => {
        if (repayment.status === "COMPLETED") {
          return (
            loanSum +
            (Number(repayment.principalPaid) || Number(repayment.amount) || 0)
          );
        } else if (repayment.status === "PARTIAL") {
          return (
            loanSum +
            (Number(repayment.principalPaid) ||
              Number(repayment.actualAmount) ||
              0)
          );
        }
        return loanSum;
      },
      0
    );
    return sum + loanPrincipalPaid;
  }, 0);

  const nextPaymentInfo = calculateNextPaymentInfo();
  const repaymentProgress =
    totalBorrowed > 0 ? (totalPrincipalPaid / totalBorrowed) * 100 : 0;

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-8">
        {/* Action Notifications */}
        <ActionNotificationBar notifications={getActionNotifications()} />

        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Outstanding Balance - Primary Card */}
          <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/5 rounded-full translate-y-24 -translate-x-24" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-body mb-1">
                    Outstanding Balance
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-heading font-bold">
                    {formatCurrency(totalOutstanding)}
                  </h2>
                </div>
                <div className="p-3 bg-teal-400/20 rounded-xl">
                  <Wallet className="h-6 w-6 text-teal-400" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Repayment Progress</span>
                    <span>{repaymentProgress.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={repaymentProgress}
                    className="h-2 bg-slate-700"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Total borrowed: {formatCurrency(totalBorrowed)}
                </span>
                <Link
                  href="/dashboard/loans"
                  className="text-teal-400 text-sm font-medium flex items-center gap-1 hover:text-teal-300 transition-colors"
                >
                  View loans <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Next Payment Card */}
          <Card
            className={`border-0 overflow-hidden ${
              nextPaymentInfo.isOverdue
                ? "bg-gradient-to-br from-red-50 to-red-100"
                : "bg-gradient-to-br from-teal-50 to-emerald-50"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    nextPaymentInfo.isOverdue ? "bg-red-100" : "bg-teal-100"
                  }`}
                >
                  <Calendar
                    className={`h-5 w-5 ${
                      nextPaymentInfo.isOverdue
                        ? "text-red-600"
                        : "text-teal-600"
                    }`}
                  />
                </div>
                {nextPaymentInfo.isOverdue && (
                  <Badge
                    variant="destructive"
                    className="bg-red-500 text-white text-xs"
                  >
                    Overdue
                  </Badge>
                )}
              </div>
              <p
                className={`text-sm font-body mb-1 ${
                  nextPaymentInfo.isOverdue ? "text-red-600" : "text-slate-500"
                }`}
              >
                {nextPaymentInfo.isOverdue ? "Overdue Payment" : "Next Payment"}
              </p>
              <p
                className={`text-2xl font-heading font-bold ${
                  nextPaymentInfo.isOverdue ? "text-red-700" : "text-slate-900"
                }`}
              >
                {nextPaymentInfo.amount > 0
                  ? formatCurrency(nextPaymentInfo.amount)
                  : "—"}
              </p>
              {nextPaymentInfo.dueDate && (
                <p
                  className={`text-xs mt-2 ${
                    nextPaymentInfo.isOverdue
                      ? "text-red-500"
                      : "text-slate-400"
                  }`}
                >
                  {nextPaymentInfo.isOverdue ? "Was due " : "Due "}
                  {formatDate(nextPaymentInfo.dueDate)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active Loans Card */}
          <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-violet-100 rounded-xl">
                  <CreditCard className="h-5 w-5 text-violet-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-body mb-1">
                Active Loans
              </p>
              <p className="text-2xl font-heading font-bold text-slate-900">
                {activeLoans.length}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {activeLoans.length === 1 ? "loan" : "loans"} in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Loan Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Breakdown Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">
                        Loan Overview
                      </h3>
                      <p className="text-sm text-slate-500 font-body">
                        Your borrowing at a glance
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    <Link href="/dashboard/loans">
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {activeLoans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart */}
                    <div className="flex flex-col items-center justify-center">
                      <PieChart
                        borrowed={totalBorrowed}
                        repaid={totalPrincipalPaid}
                        size={200}
                        theme="light"
                      />
                      <div className="mt-4 text-center">
                        <p className="text-sm text-slate-500 font-body">
                          Total Repaid
                        </p>
                        <p className="text-xl font-heading font-bold text-teal-600">
                          {formatCurrency(totalPrincipalPaid)}
                        </p>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-slate-400" />
                            <span className="text-sm text-slate-600 font-body">
                              Total Borrowed
                            </span>
                          </div>
                          <span className="font-heading font-semibold text-slate-900">
                            {formatCurrency(totalBorrowed)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-teal-400" />
                            <span className="text-sm text-slate-600 font-body">
                              Amount Repaid
                            </span>
                          </div>
                          <span className="font-heading font-semibold text-teal-700">
                            {formatCurrency(totalPrincipalPaid)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <span className="text-sm text-slate-600 font-body">
                              Remaining
                            </span>
                          </div>
                          <span className="font-heading font-semibold text-amber-700">
                            {formatCurrency(totalOutstanding)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <PiggyBank className="h-8 w-8 text-teal-500" />
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-slate-900 mb-2">
                      No Active Loans
                    </h4>
                    <p className="text-slate-500 font-body mb-6 max-w-sm mx-auto">
                      You don&apos;t have any active loans yet. Apply for a loan
                      to get started with your financial journey.
                    </p>
                    <Button
                      asChild
                      className="bg-teal-400 hover:bg-teal-500 text-white rounded-xl"
                    >
                      <Link href="/dashboard/apply">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply for a Loan
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/apply"
                className="group p-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm mb-1">Quick Action</p>
                    <p className="text-lg font-heading font-semibold">
                      Apply for a Loan
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/transactions"
                className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-teal-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">View History</p>
                    <p className="text-lg font-heading font-semibold text-slate-900">
                      Transactions
                    </p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-teal-50 transition-colors">
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column - Payment Schedule */}
          <div className="space-y-6">
            {/* Upcoming Payment Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Payment Schedule
                    </h3>
                    <p className="text-sm text-slate-500 font-body">
                      Upcoming payments
                    </p>
                  </div>
                </div>

                {nextPaymentInfo.amount > 0 ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl border-2 ${
                        nextPaymentInfo.isOverdue
                          ? "border-red-200 bg-red-50"
                          : "border-teal-200 bg-teal-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            nextPaymentInfo.isOverdue
                              ? "text-red-600"
                              : "text-teal-600"
                          }`}
                        >
                          {nextPaymentInfo.isOverdue
                            ? "Overdue Payment"
                            : "Next Payment Due"}
                        </span>
                        {nextPaymentInfo.isOverdue && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p
                        className={`text-2xl font-heading font-bold ${
                          nextPaymentInfo.isOverdue
                            ? "text-red-700"
                            : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(nextPaymentInfo.amount)}
                      </p>
                      {nextPaymentInfo.dueDate && (
                        <p className="text-sm text-slate-500 mt-2">
                          {nextPaymentInfo.isOverdue ? "Was due " : "Due on "}
                          {formatDate(nextPaymentInfo.dueDate)}
                        </p>
                      )}
                      {nextPaymentInfo.includesLateFees && (
                        <p className="text-xs text-amber-600 mt-1">
                          Includes {formatCurrency(nextPaymentInfo.totalLateFees)}{" "}
                          in late fees
                        </p>
                      )}
                    </div>

                    <Button
                      asChild
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      <Link href="/dashboard/loans">
                        View Payment Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-slate-600 font-body">
                      No upcoming payments
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      You&apos;re all caught up!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {transactions.length > 0 && (
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-slate-900">
                      Recent Activity
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <Link href="/dashboard/transactions">View all</Link>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              tx.amount > 0 ? "bg-green-100" : "bg-slate-100"
                            }`}
                          >
                            {tx.amount > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">
                              {tx.description}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            tx.amount > 0 ? "text-green-600" : "text-slate-700"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
