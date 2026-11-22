
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    DollarSign,
    Search,
    RefreshCw,
    TrendingUp,
    Loader2,
    CheckCircle,
    Receipt,
    CalendarDays,
    UserRound,
    Clock,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

export default function AdminTransactionsPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [transactions, setTransactions] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [unpaidCount, setUnpaidCount] = useState(0);
    const [unpaidAmount, setUnpaidAmount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.push("/sign-in");
            return;
        }

        if (session.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        fetchTransactions();
    }, [session, isPending]);

    async function fetchTransactions() {
        try {
            setLoading(true);
            setError("");

            const token = await getBackendToken();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to fetch transactions"
                );
            }

            setTransactions(result.data || []);
            setTotalRevenue(Number(result.totalRevenue || 0));
            setUnpaidCount(Number(result.unpaidCount || 0));
            setUnpaidAmount(Number(result.unpaidAmount || 0));

        } catch (error) {
            console.error("Fetch transactions error:", error);
            setError(error.message || "Unable to load transactions");
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date) {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function formatAmount(amount, currency = "usd") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(Number(amount || 0));
    }

    const paidTransactions = transactions.filter(
        (transaction) => transaction.status === "paid"
    );

    const filteredTransactions = transactions.filter((transaction) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            (transaction.customerEmail || "").toLowerCase().includes(searchValue) ||
            (transaction.technicianEmail || "").toLowerCase().includes(searchValue) ||
            (transaction.serviceTitle || "").toLowerCase().includes(searchValue) ||
            String(transaction.bookingId || "").toLowerCase().includes(searchValue) ||
            (transaction.stripeSessionId || "").toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "all" || transaction.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#E85D35]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 sm:text-3xl">
                        Manage Transactions
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Monitor Stripe payments and FixMate revenue.
                    </p>
                </div>

                <button
                    onClick={fetchTransactions}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E85D35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d94d28]"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total Revenue */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#1c2029]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Revenue
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                {formatAmount(totalRevenue)}
                            </h2>
                        </div>

                        <div className="rounded-lg bg-green-100 p-3 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                            <DollarSign size={22} />
                        </div>
                    </div>
                </div>

                {/* Total Transactions */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#1c2029]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Transactions
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                {transactions.length}
                            </h2>
                        </div>

                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <Receipt size={22} />
                        </div>
                    </div>
                </div>

                {/* Successful Payments */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#1c2029]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Successful Payments
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                {paidTransactions.length}
                            </h2>
                        </div>

                        <div className="rounded-lg bg-purple-100 p-3 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                            <CheckCircle size={22} />
                        </div>
                    </div>
                </div>

                {/* Unpaid Bookings */}
                <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/50 dark:bg-[#1c2029]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Unpaid Bookings
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                                {unpaidCount}
                            </h2>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Outstanding: {formatAmount(unpaidAmount)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-red-100 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            <Clock size={22} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#1c2029]">
                <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer, service, booking ID or Stripe ID..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#E85D35] dark:border-gray-600 dark:bg-[#151922] dark:text-white"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#E85D35] dark:border-gray-600 dark:bg-[#151922] dark:text-white"
                    >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid</option>
                    </select>

                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Transactions List */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1c2029]">

                <div className="border-b border-gray-200 p-5 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        All Transactions ({filteredTransactions.length})
                    </h2>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="p-10 text-center">
                        <CreditCard
                            size={40}
                            className="mx-auto text-gray-400"
                        />

                        <h3 className="mt-3 font-semibold text-gray-800 dark:text-white">
                            No transactions found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            No payment records match your search.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">

                        {filteredTransactions.map((transaction) => (
                            <div
                                key={transaction._id}
                                className="space-y-4 p-5 transition hover:bg-gray-50 dark:hover:bg-[#222733]"
                            >

                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {transaction.serviceTitle || "Repair Service"}
                                        </h3>

                                        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                                            Payment ID: {transaction._id}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                            {transaction.status}
                                        </span>

                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatAmount(
                                                transaction.amount,
                                                transaction.currency
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">

                                    <div>
                                        <p className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <UserRound size={14} />
                                            Customer
                                        </p>

                                        <p className="break-all font-medium text-gray-800 dark:text-gray-200">
                                            {transaction.customerEmail || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <TrendingUp size={14} />
                                            Technician
                                        </p>

                                        <p className="break-all font-medium text-gray-800 dark:text-gray-200">
                                            {transaction.technicianEmail || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CalendarDays size={14} />
                                            Payment Date
                                        </p>

                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                            Currency
                                        </p>

                                        <p className="font-medium uppercase text-gray-800 dark:text-gray-200">
                                            {transaction.currency || "USD"}
                                        </p>
                                    </div>

                                </div>

                                <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-[#151922]">

                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Booking ID
                                        </p>

                                        <p className="mt-1 break-all text-xs text-gray-700 dark:text-gray-300">
                                            {transaction.bookingId?.toString() || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Stripe Checkout Session ID
                                        </p>

                                        <p className="mt-1 break-all text-xs text-gray-700 dark:text-gray-300">
                                            {transaction.stripeSessionId || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Stripe Payment Intent ID
                                        </p>

                                        <p className="mt-1 break-all text-xs text-gray-700 dark:text-gray-300">
                                            {transaction.stripePaymentIntentId || "N/A"}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}
