
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    CalendarDays,
    Search,
    RefreshCw,
    ClipboardList,
    Loader2,
    UserRound,
    Wrench,
    CheckCircle,
    Clock,
    ImageIcon,
    TrendingUp,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

export default function AdminBookingsPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // ============================================
    // FETCH BOOKINGS
    // ============================================

    async function fetchBookings() {
        try {
            setLoading(true);
            setError("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/admin-bookings`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to fetch bookings."
                );
            }

            if (!Array.isArray(result.data)) {
                throw new Error("Invalid booking data received from server.");
            }

            setBookings(result.data);

        } catch (error) {
            console.error("Fetch bookings error:", error);
            setError(error.message || "Unable to load bookings.");
        } finally {
            setLoading(false);
        }
    }

    // ============================================
    // ADMIN AUTHENTICATION
    // ============================================

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.push("/sign-in");
            return;
        }

        if (session.user.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        fetchBookings();
    }, [session, isPending, router]);

    // ============================================
    // DATE FORMAT
    // ============================================

    function formatDate(date) {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    // ============================================
    // BOOKING STATUS STYLE
    // ============================================

    function getStatusStyle(status) {
        const styles = {
            requested:
                "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",

            approved:
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",

            rejected:
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",

            accepted:
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",

            "in-progress":
                "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",

            completed:
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

            cancelled:
                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    }

    // ============================================
    // TECHNICIAN WORKFLOW PROGRESS
    // ============================================

    function getProgressInfo(status) {
        const progress = {
            requested: {
                percentage: 0,
                label: "Waiting for approval",
                color: "bg-orange-500",
            },

            approved: {
                percentage: 10,
                label: "Approved",
                color: "bg-green-500",
            },

            accepted: {
                percentage: 30,
                label: "Technician accepted",
                color: "bg-blue-500",
            },

            "in-progress": {
                percentage: 65,
                label: "Repair in progress",
                color: "bg-purple-500",
            },

            completed: {
                percentage: 100,
                label: "Repair completed",
                color: "bg-emerald-500",
            },

            rejected: {
                percentage: 0,
                label: "Rejected",
                color: "bg-red-500",
            },

            cancelled: {
                percentage: 0,
                label: "Cancelled",
                color: "bg-gray-400",
            },
        };

        return progress[status] || {
            percentage: 0,
            label: "Not started",
            color: "bg-gray-400",
        };
    }

    // ============================================
    // SEARCH AND FILTER
    // ============================================

    const filteredBookings = bookings.filter((booking) => {
        const searchText = search.toLowerCase();

        const matchesSearch = [
            booking.serviceTitle,
            booking.serviceCategory,
            booking.customerName,
            booking.customerEmail,
            booking.technicianName,
            booking.technicianEmail,
        ].some((value) =>
            (value || "").toLowerCase().includes(searchText)
        );

        const matchesStatus =
            statusFilter === "all" ||
            booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statuses = [
        "all",
        "requested",
        "approved",
        "rejected",
        "accepted",
        "in-progress",
        "completed",
        "cancelled",
    ];

    // ============================================
    // SUMMARY DATA
    // ============================================

    const totalBookings = bookings.length;

    const requestedBookings = bookings.filter(
        (booking) => booking.status === "requested"
    ).length;

    const inProgressBookings = bookings.filter(
        (booking) => booking.status === "in-progress"
    ).length;

    const completedBookings = bookings.filter(
        (booking) => booking.status === "completed"
    ).length;

    // ============================================
    // LOADING
    // ============================================

    if (isPending || (loading && bookings.length === 0 && !error)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-[#111318]">
                <Loader2
                    size={32}
                    className="animate-spin text-[#E85D35]"
                />
            </div>
        );
    }

    if (!session?.user || session.user.role !== "admin") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500 dark:text-gray-300">
                    Checking admin access...
                </p>
            </div>
        );
    }

    // ============================================
    // PAGE
    // ============================================

    return (
        <div className="min-h-screen space-y-6 bg-white p-4 text-gray-900 transition-colors duration-300 dark:bg-[#111318] dark:text-white sm:p-6 lg:p-8">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Manage Bookings
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Monitor repair progress and booking status.
                    </p>
                </div>

                <button
                    onClick={fetchBookings}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E85D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94d28] disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Bookings
                </button>

            </div>

            {/* ERROR MESSAGE */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* BOOKING SUMMARY */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[
                    {
                        title: "Total Bookings",
                        value: totalBookings,
                        icon: ClipboardList,
                        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    },
                    {
                        title: "Pending Requests",
                        value: requestedBookings,
                        icon: Clock,
                        color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                    },
                    {
                        title: "Repairs In Progress",
                        value: inProgressBookings,
                        icon: Wrench,
                        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                    },
                    {
                        title: "Completed Repairs",
                        value: completedBookings,
                        icon: CheckCircle,
                        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1c2029]"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.title}
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                        {item.value}
                                    </h2>
                                </div>

                                <div className={`rounded-lg p-3 ${item.color}`}>
                                    <Icon size={22} />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* SEARCH AND FILTER */}

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#1c2029] lg:flex-row">

                <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search service, customer or technician..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#E85D35] dark:border-gray-700 dark:bg-[#151922] dark:text-white"
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#E85D35] dark:border-gray-700 dark:bg-[#151922] dark:text-white"
                >
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status === "all"
                                ? "All Booking Statuses"
                                : status
                                    .replace("-", " ")
                                    .replace(/\b\w/g, (letter) =>
                                        letter.toUpperCase()
                                    )}
                        </option>
                    ))}
                </select>

            </div>

            {/* BOOKING TABLE */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1c2029]">

                <div className="flex flex-col justify-between gap-2 border-b border-gray-200 p-5 dark:border-gray-800 sm:flex-row sm:items-center">

                    <h2 className="font-bold text-gray-900 dark:text-white">
                        Booking & Repair Monitoring ({filteredBookings.length})
                    </h2>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {requestedBookings} requests waiting for approval
                    </p>

                </div>

                {loading ? (

                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                        Loading bookings...
                    </div>

                ) : filteredBookings.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px] table-fixed text-left text-sm">

                            <thead className="bg-gray-50 text-gray-600 dark:bg-[#151922] dark:text-gray-400">
                                <tr>
                                    <th className="w-[300px] px-5 py-4">Service</th>
                                    <th className="w-[210px] px-5 py-4">Customer</th>
                                    <th className="w-[210px] px-5 py-4">Technician</th>
                                    <th className="w-[210px] px-5 py-4">Repair Progress</th>
                                    <th className="w-[160px] px-5 py-4">Booking Status</th>
                                    <th className="w-[150px] px-5 py-4">Preferred Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                                {filteredBookings.map((booking) => {
                                    const progress = getProgressInfo(booking.status);

                                    return (
                                        <tr
                                            key={booking._id}
                                            className="text-gray-700 dark:text-gray-300"
                                        >

                                            {/* SERVICE */}

                                            <td className="px-5 py-4">
                                                <div className="flex w-[260px] items-start gap-3">

                                                    {booking.serviceImage ? (
                                                        <img
                                                            src={booking.serviceImage}
                                                            alt={booking.serviceTitle || "Service"}
                                                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-700">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">

                                                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                                                            {booking.serviceTitle || "Unknown Service"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {booking.serviceCategory || "N/A"}
                                                        </p>

                                                    </div>

                                                </div>
                                            </td>

                                            {/* CUSTOMER */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <UserRound
                                                        size={15}
                                                        className="text-gray-400"
                                                    />

                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {booking.customerName || "Customer"}
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {booking.customerEmail || "N/A"}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {booking.customerPhone || "No phone"}
                                                </p>

                                            </td>

                                            {/* TECHNICIAN */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <Wrench
                                                        size={15}
                                                        className="text-gray-400"
                                                    />

                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {booking.technicianName || "Unknown"}
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {booking.technicianEmail || "N/A"}
                                                </p>

                                            </td>

                                            {/* REPAIR PROGRESS */}

                                            <td className="px-5 py-4">

                                                <div className="mb-2 flex items-center justify-between gap-3">

                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {progress.label}
                                                    </span>

                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                        {progress.percentage}%
                                                    </span>

                                                </div>

                                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">

                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
                                                        style={{
                                                            width: `${progress.percentage}%`,
                                                        }}
                                                    />

                                                </div>

                                            </td>

                                            {/* BOOKING STATUS */}

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(booking.status)}`}
                                                >
                                                    {(booking.status || "unknown").replace("-", " ")}
                                                </span>

                                            </td>

                                            {/* PREFERRED DATE */}

                                            <td className="whitespace-nowrap px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <CalendarDays
                                                        size={15}
                                                        className="text-gray-400"
                                                    />

                                                    {formatDate(booking.preferredDate)}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">

                        <ClipboardList
                            size={40}
                            className="mx-auto mb-3 opacity-40"
                        />

                        <h3 className="font-semibold text-gray-800 dark:text-white">
                            No bookings found
                        </h3>

                        <p className="mt-1 text-sm">
                            Try changing your search or filters.
                        </p>

                    </div>

                )}

            </div>

            {/* WORKFLOW INFORMATION */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">

                <div className="mb-4 flex items-center gap-2">

                    <TrendingUp
                        size={20}
                        className="text-[#E85D35]"
                    />

                    <h2 className="font-bold text-gray-900 dark:text-white">
                        Repair Progress Guide
                    </h2>

                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

                    {[
                        { label: "Waiting for approval", value: "0%" },
                        { label: "Approved", value: "10%" },
                        { label: "Technician accepted", value: "30%" },
                        { label: "Repair in progress", value: "65%" },
                        { label: "Completed", value: "100%" },
                    ].map((item) => (

                        <div
                            key={item.label}
                            className="rounded-lg bg-gray-50 p-3 dark:bg-[#151922]"
                        >
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {item.value}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                            </p>
                        </div>

                    ))}

                </div>

                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                    Progress percentages represent workflow stages, not measured
                    repair hours or individual tasks completed.
                </p>

            </div>

        </div>
    );
}
