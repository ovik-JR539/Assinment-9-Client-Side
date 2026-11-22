
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    X,
    RefreshCw,
    Clock,
    ClipboardList,
    CalendarDays,
    MapPin,
    Phone,
    User,
    Mail,
    Wrench,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

// --------------------
// Local storage helpers
// --------------------

function getDismissedIds(storageKey) {
    try {
        if (!storageKey || typeof window === "undefined") return [];

        const saved = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

// --------------------
// Date and time helpers
// --------------------

function formatDate(dateValue) {
    if (!dateValue) return "Not provided";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Dhaka",
    });
}

function getBookingDate(booking) {
    return (
        booking.bookingDate ||
        booking.preferredDate ||
        booking.bookingDateTime ||
        null
    );
}

function getBookingTime(booking) {
    if (booking.bookingTime) {
        return booking.bookingTime;
    }

    if (booking.bookingDateTime) {
        const date = new Date(booking.bookingDateTime);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleTimeString("en-BD", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Dhaka",
            });
        }
    }

    return "Not provided";
}

// --------------------
// Booking status helpers
// --------------------

function getStatusStyle(status) {
    switch (status) {
        case "requested":
            return "bg-orange-100 text-orange-700";

        case "approved":
            return "bg-orange-100 text-orange-700";

        case "accepted":
            return "bg-blue-100 text-blue-700";

        case "in-progress":
            return "bg-purple-100 text-purple-700";

        case "completed":
            return "bg-green-100 text-green-700";

        case "rejected":
            return "bg-red-100 text-red-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getStatusLabel(status) {
    switch (status) {
        case "requested":
            return "New Request";

        case "approved":
            return "Pending (Old Booking)";

        case "accepted":
            return "Accepted";

        case "in-progress":
            return "In Progress";

        case "completed":
            return "Completed";

        case "rejected":
            return "Rejected";

        default:
            return status || "Unknown";
    }
}

// --------------------
// Main component
// --------------------

export default function TechnicianRequests() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const storageKey = session?.user?.email
        ? `fixmate-dismissed-requests:${session.user.email}`
        : null;

    // --------------------
    // Fetch bookings
    // --------------------

    async function fetchBookings() {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await fetch(
                `${API_URL}/api/bookings/technician-bookings`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load customer requests."
                );
            }

            const allBookings = Array.isArray(data.data)
                ? data.data
                : [];

            const dismissedIds = getDismissedIds(storageKey);

            const visibleBookings = allBookings.filter(
                (booking) => !dismissedIds.includes(booking._id)
            );

            setBookings(visibleBookings);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    // --------------------
    // Authentication check
    // --------------------

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.push("/sign-in");
            return;
        }

        if (session.user.role !== "technician") {
            router.push("/dashboard");
            return;
        }

        fetchBookings();
    }, [session, isPending]);

    // --------------------
    // Update booking status
    // --------------------

    async function updateStatus(bookingId, newStatus) {
        try {
            setUpdatingId(bookingId);
            setError("");
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await fetch(
                `${API_URL}/api/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update customer request."
                );
            }

            // Update local UI after backend confirms success
            if (newStatus === "rejected") {
                setBookings((previous) =>
                    previous.filter(
                        (booking) => booking._id !== bookingId
                    )
                );
            } else {
                setBookings((previous) =>
                    previous.map((booking) =>
                        booking._id === bookingId
                            ? {
                                  ...booking,
                                  status: newStatus,
                                  ...(data.data || {}),
                              }
                            : booking
                    )
                );
            }

            setMessage(
                data.message ||
                    `Booking status changed to ${getStatusLabel(newStatus)} successfully.`
            );
        } catch (err) {
            setError(err.message || "Failed to update request.");
        } finally {
            setUpdatingId(null);
        }
    }

    // --------------------
    // Hide one booking card
    // --------------------

    function dismissBooking(bookingId) {
        const dismissedIds = getDismissedIds(storageKey);

        if (!dismissedIds.includes(bookingId)) {
            dismissedIds.push(bookingId);
        }

        if (storageKey) {
            localStorage.setItem(
                storageKey,
                JSON.stringify(dismissedIds)
            );
        }

        setBookings((previous) =>
            previous.filter((booking) => booking._id !== bookingId)
        );
    }

    // --------------------
    // Hide all booking cards
    // --------------------

    function clearAllBookings() {
        if (bookings.length === 0) return;

        const currentIds = bookings.map((booking) => booking._id);

        const previousDismissed = getDismissedIds(storageKey);

        const updatedDismissed = [
            ...new Set([...previousDismissed, ...currentIds]),
        ];

        if (storageKey) {
            localStorage.setItem(
                storageKey,
                JSON.stringify(updatedDismissed)
            );
        }

        setBookings([]);
        setMessage("All request cards have been cleared.");
    }

    // --------------------
    // Loading screen
    // --------------------

    if (isPending || loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={32}
                        className="mx-auto mb-3 animate-spin text-orange-600"
                    />

                    <p className="font-medium text-slate-600">
                        Loading customer requests...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------
    // Main UI
    // --------------------

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Customer Requests
                        </h1>

                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            View customer repair requests and manage your jobs.
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Technician:{" "}
                            {session?.user?.name || session?.user?.email}
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Requests Summary */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/30">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/50">
                            <Clock size={24} />
                        </div>

                        <div>
                            <h2 className="font-bold text-orange-900 dark:text-orange-300">
                                Repair Requests
                            </h2>

                            <p className="text-sm text-orange-700 dark:text-orange-400">
                                Customer requests assigned to you
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="rounded-full bg-orange-600 px-4 py-2 text-lg font-bold text-white">
                            {bookings.length}
                        </span>

                        <button
                            onClick={clearAllBookings}
                            disabled={bookings.length === 0}
                            className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                        <CheckCircle size={20} />
                        <p>{message}</p>
                    </div>
                )}

                {/* Empty State */}
                {bookings.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <ClipboardList
                            size={48}
                            className="mx-auto mb-4 text-slate-400"
                        />

                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                            No Customer Requests
                        </h2>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            New repair requests assigned to you will appear here.
                        </p>

                        <button
                            onClick={fetchBookings}
                            className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700"
                        >
                            Check Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            {/* Hide Button */}
                            <button
                                onClick={() => dismissBooking(booking._id)}
                                title="Hide this request"
                                className="absolute right-4 top-4 rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-600 hover:text-white dark:bg-red-950/50"
                            >
                                <X size={18} />
                            </button>

                            {/* Service Information */}
                            <div className="mb-5 flex items-start gap-4 pr-10">
                                {booking.serviceImage && (
                                    <img
                                        src={booking.serviceImage}
                                        alt={booking.serviceTitle || "Repair service"}
                                        className="h-20 w-20 rounded-lg object-cover"
                                    />
                                )}

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {booking.serviceTitle ||
                                            booking.title ||
                                            "Repair Service"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {booking.serviceCategory || "General Repair"}
                                    </p>

                                    <span
                                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(booking.status)}`}
                                    >
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
                                <h3 className="mb-2 font-semibold text-slate-800 dark:text-white">
                                    Customer Information
                                </h3>

                                <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <User size={17} className="mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Customer:</strong>{" "}
                                        {booking.customerName || "Not provided"}
                                    </span>
                                </p>

                                <p className="flex items-start gap-2 break-all text-sm text-slate-700 dark:text-slate-300">
                                    <Mail size={17} className="mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Email:</strong>{" "}
                                        {booking.customerEmail || "Not provided"}
                                    </span>
                                </p>

                                <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <Phone size={17} className="mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Phone:</strong>{" "}
                                        {booking.customerPhone ||
                                            booking.phone ||
                                            "Not provided"}
                                    </span>
                                </p>

                                <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <MapPin size={17} className="mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Address:</strong>{" "}
                                        {booking.customerAddress ||
                                            booking.address ||
                                            "Not provided"}
                                    </span>
                                </p>
                            </div>

                        {/* Booking Details */}
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                    Booking Details
                </h3>

                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CalendarDays size={17} className="shrink-0" />
                    <span>
                        <strong>Preferred Date:</strong>{" "}
                        {formatDate(getBookingDate(booking))}
                    </span>
                </p>

                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Clock size={17} className="shrink-0" />
                    <span>
                        <strong>Preferred Time:</strong>{" "}
                        {getBookingTime(booking)}
                    </span>
                </p>

                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Wrench size={17} className="shrink-0" />
                    <span>
                        <strong>Repair Method:</strong>{" "}
                        {booking.repairMethod ||
                            booking.serviceMethod ||
                            booking.serviceMode ||
                            "Not provided"}
                    </span>
                </p>

                <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Base Price:</strong>{" "}
                    ৳{booking.basePrice ?? "Not provided"}
                </p>
            </div>

            {/* Problem Description */}
            <div className="mt-4">
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-white">
                    Customer's Problem
                </h3>

                <p className="break-words whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere] dark:bg-slate-800 dark:text-slate-300">
                    {booking.problemDescription ||
                        "No problem description provided."}
                </p>
            </div>

            {/* Accept / Reject */}
            {(booking.status === "requested" ||
                booking.status === "approved") && (
                <div className="mt-6 flex gap-3">
                    <button
                        disabled={updatingId !== null}
                        onClick={() =>
                            updateStatus(booking._id, "accepted")
                        }
                        className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {updatingId === booking._id
                            ? "Updating..."
                            : "Accept"}
                    </button>

                    <button
                        disabled={updatingId !== null}
                        onClick={() =>
                            updateStatus(booking._id, "rejected")
                        }
                        className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {updatingId === booking._id
                            ? "Updating..."
                            : "Reject"}
                    </button>
                </div>
            )}

            {/* Accepted */}
            {booking.status === "accepted" && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-900 dark:bg-blue-950/30">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                        Request Accepted
                    </p>

                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                        You have accepted this customer's repair request.
                    </p>

                    <button
                        disabled={updatingId !== null}
                        onClick={() =>
                            updateStatus(booking._id, "in-progress")
                        }
                        className="mt-4 rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                        {updatingId === booking._id
                            ? "Updating..."
                            : "Start Repair"}
                    </button>
                </div>
            )}

            {/* In Progress */}
            {booking.status === "in-progress" && (
                <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-900 dark:bg-purple-950/30">
                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                        Repair In Progress
                    </p>

                    <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                        You are currently working on this repair.
                    </p>
                </div>
            )}

            {/* Completed */}
            {booking.status === "completed" && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/30">
                    <p className="font-semibold text-green-700 dark:text-green-300">
                        Repair Completed
                    </p>

                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        This repair request has been completed.
                    </p>

                    {booking.finalAmount !== undefined && (
                        <p className="mt-2 text-sm font-semibold text-green-700 dark:text-green-300">
                            Final Amount: ৳{booking.finalAmount}
                        </p>
                    )}
                </div>
            )}
        </div>
    ))}
</div>
)}
</div>
</div>
);
}