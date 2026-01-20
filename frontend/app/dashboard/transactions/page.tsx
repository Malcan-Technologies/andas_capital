"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkAuth,
  fetchWithTokenRefresh,
  TokenStorage,
} from "@/lib/authUtils";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "LOAN_DISBURSEMENT" | "LOAN_REPAYMENT";
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description: string;
  createdAt: string;
  reference?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");
    if (
      filterParam &&
      ["LOAN_DISBURSEMENT", "LOAN_REPAYMENT"].includes(filterParam)
    ) {
      setTransactionFilter(filterParam);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const accessToken = TokenStorage.getAccessToken();
        const refreshToken = TokenStorage.getRefreshToken();

        if (!accessToken && !refreshToken) {
          router.push("/login");
          return;
        }

        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          TokenStorage.clearTokens();
          router.push("/login");
          return;
        }

        const userData = await fetchWithTokenRefresh<any>("/api/users/me");

        if (userData.firstName) {
          setUserName(userData.firstName);
        } else if (userData.fullName) {
          setUserName(userData.fullName.split(" ")[0]);
        } else {
          setUserName("User");
        }

        fetchTransactions();
      } catch (error) {
        console.error("Transactions - Auth check error:", error);
        TokenStorage.clearTokens();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      const data = await fetchWithTokenRefresh<{
        transactions: Transaction[];
      }>("/api/wallet/transactions?limit=50");
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
    }).format(Math.abs(amount));
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
    });
  };

  const getTransactionConfig = (type: Transaction["type"]) => {
    switch (type) {
      case "DEPOSIT":
      case "LOAN_DISBURSEMENT":
        return {
          icon: <ArrowDownLeft className="h-5 w-5" />,
          color: "text-green-600",
          bg: "bg-green-100",
          label: type === "DEPOSIT" ? "Deposit" : "Disbursement",
        };
      case "WITHDRAWAL":
        return {
          icon: <ArrowUpRight className="h-5 w-5" />,
          color: "text-slate-600",
          bg: "bg-slate-100",
          label: "Withdrawal",
        };
      case "LOAN_REPAYMENT":
        return {
          icon: <ArrowRightLeft className="h-5 w-5" />,
          color: "text-teal-600",
          bg: "bg-teal-100",
          label: "Repayment",
        };
      default:
        return {
          icon: <Wallet className="h-5 w-5" />,
          color: "text-slate-400",
          bg: "bg-slate-100",
          label: "Transaction",
        };
    }
  };

  const getStatusConfig = (status: Transaction["status"]) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Completed",
        };
      case "PENDING":
        return {
          icon: <Clock className="h-3.5 w-3.5" />,
          bg: "bg-amber-100",
          text: "text-amber-700",
          label: "Pending",
        };
      case "REJECTED":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Failed",
        };
    }
  };

  const getFilteredTransactions = () => {
    if (transactionFilter === "ALL") {
      return transactions;
    }
    return transactions.filter(
      (transaction) => transaction.type === transactionFilter
    );
  };

  // Calculate stats
  const totalInflow = transactions
    .filter((t) => t.amount > 0 && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.amount < 0 && t.status === "APPROVED")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  // Group transactions by date
  const groupedTransactions = getFilteredTransactions().reduce(
    (groups: Record<string, Transaction[]>, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString("en-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  if (loading) {
    return (
      <DashboardLayout userName={userName} title="Transactions">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={userName} title="Transactions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Inflow */}
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-green-600 font-body mb-1">
                    Total Received
                  </p>
                  <p className="text-2xl font-heading font-bold text-green-700">
                    {formatCurrency(totalInflow)}
                  </p>
                </div>
                <div className="p-2.5 bg-green-100 rounded-xl">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Outflow */}
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-body mb-1">
                    Total Paid
                  </p>
                  <p className="text-2xl font-heading font-bold text-slate-700">
                    {formatCurrency(totalOutflow)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-200 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-body mb-1">
                    Pending
                  </p>
                  <p className="text-2xl font-heading font-bold text-amber-700">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-amber-500 mt-1">
                    transaction{pendingCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 rounded-xl">
                    <Receipt className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-semibold text-slate-900">
                      Transaction History
                    </h2>
                    <p className="text-sm text-slate-500 font-body">
                      {transactions.length} total transaction
                      {transactions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    setRefreshing(true);
                    try {
                      await fetchTransactions();
                      toast.success("Refreshed successfully");
                    } catch (error) {
                      toast.error("Failed to refresh");
                    } finally {
                      setRefreshing(false);
                    }
                  }}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Filter Tabs */}
              {transactions.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {[
                    { value: "ALL", label: "All" },
                    { value: "LOAN_DISBURSEMENT", label: "Disbursements" },
                    { value: "LOAN_REPAYMENT", label: "Repayments" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setTransactionFilter(filter.value)}
                      className={`px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all ${
                        transactionFilter === filter.value
                          ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="divide-y divide-gray-100">
              {Object.keys(groupedTransactions).length > 0 ? (
                Object.entries(groupedTransactions).map(([date, txns]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="px-5 py-3 bg-slate-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 font-body">
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Transactions for this date */}
                    {txns.map((transaction) => {
                      const config = getTransactionConfig(transaction.type);
                      const statusConfig = getStatusConfig(transaction.status);

                      return (
                        <div
                          key={transaction.id}
                          className="px-5 py-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                              className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                            >
                              <span className={config.color}>{config.icon}</span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 font-body truncate">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400 font-body">
                                      {config.label}
                                    </span>
                                    {transaction.reference && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs text-slate-400 font-body truncate">
                                          {transaction.reference}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Amount & Status */}
                                <div className="text-right flex-shrink-0">
                                  <p
                                    className={`text-base font-heading font-bold ${
                                      transaction.amount > 0
                                        ? "text-green-600"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {transaction.amount > 0 ? "+" : "-"}
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                  <Badge
                                    className={`mt-1 ${statusConfig.bg} ${statusConfig.text} text-xs border-0`}
                                  >
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : transactions.length > 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Search className="h-8 w-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 font-heading mb-2">
                    No Matching Transactions
                  </h4>
                  <p className="text-slate-500 font-body mb-4">
                    Try changing your filter to see more results.
                  </p>
                  <Button
                    onClick={() => setTransactionFilter("ALL")}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Show All Transactions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-teal-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 font-heading mb-2">
                    No Transactions Yet
                  </h4>
                  <p className="text-slate-500 font-body max-w-sm mx-auto mb-6">
                    Your transaction history will appear here once you receive
                    disbursements or make repayments.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/apply")}
                    className="bg-teal-400 hover:bg-teal-500 text-white rounded-xl"
                  >
                    Apply for a Loan
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
