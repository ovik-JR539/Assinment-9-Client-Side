
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

import {
    Users,
    UserRound,
    Wrench,
    ClipboardList,
    CalendarDays,
    Clock,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchDashboardStats() {
        try {
            setLoading(true);
            setError("");

            const token = await getBackendToken();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
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
                    result.message || "Unable to load dashboard"
                );
            }

            setStats(result.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

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

        fetchDashboardStats();
    }, [session, isPending, router]);

    function formatDate(date) {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const cards = [
        {
            title: "Total Users",
            value: stats?.totalUsers ?? 0,
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Customers",
            value: stats?.totalCustomers ?? 0,
            icon: UserRound,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Technicians",
            value: stats?.totalTechnicians ?? 0,
            icon: Wrench,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "Pending Services",
            value: stats?.pendingServices ?? 0,
            icon: Clock,
            color: "bg-orange-100 text-orange-600",
        },
        {
            title: "Total Services",
            value: stats?.totalServices ?? 0,
            icon: ClipboardList,
            color: "bg-pink-100 text-pink-600",
        },
        {
            title: "Total Bookings",
            value: stats?.totalBookings ?? 0,
            icon: CalendarDays,
            color: "bg-indigo-100 text-indigo-600",
        },
    ];

    if (isPending || loading && !error && !stats) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">Loading admin dashboard...</p>
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">Checking admin access...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">

            {/* Heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 sm:text-3xl">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Manage and monitor your FixMate platform.
                    </p>
                </div>

                <button
                    onClick={fetchDashboardStats}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#6A0DAD] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b27] disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Data
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1c2029]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                                        {loading ? "..." : card.value}
                                    </h2>
                                </div>

                                <div className={`rounded-xl p-4 ${card.color}`}>
                                    <Icon size={25} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Bookings */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1c2029]">

                <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Recent Bookings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        The latest five repair requests on FixMate.
                    </p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Loading bookings...
                    </div>
                ) : stats?.recentBookings?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 dark:bg-[#151922] dark:text-gray-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">
                                        Service
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Customer
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Payment
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {stats.recentBookings.map((booking) => (
                                    <tr
                                        key={booking._id}
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                                            {booking.serviceTitle || "Repair Service"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p>
                                                {booking.customerName || "Customer"}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {booking.customerEmail || ""}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {booking.status || "N/A"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                booking.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }`}>
                                                {booking.paymentStatus || "unpaid"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {formatDate(booking.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                        No bookings available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
