
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

import {
    CalendarDays,
    MapPin,
    Clock,
    ArrowLeft,
    ClipboardList,
    RefreshCw,
    XCircle,
    CreditCard,
    X,
    Trash2,
} from "lucide-react";

export default function MyBookingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, isPending } = authClient.useSession();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelLoading, setCancelLoading] = useState("");
    const [paymentLoading, setPaymentLoading] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [paymentNotice, setPaymentNotice] = useState("");

    // Hidden booking cards
    const [dismissedBookings, setDismissedBookings] = useState([]);
    const [dismissedLoaded, setDismissedLoaded] = useState(false);

    // Redirect logged-out users
    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/sign-in");
        }
    }, [session, isPending, router]);

    // Load hidden cards for the current customer
    useEffect(() => {
        if (isPending || !session?.user?.email) return;

        const storageKey = `fixmate-dismissed-bookings:${session.user.email}`;

        try {
            const savedBookings = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

            setDismissedBookings(Array.isArray(savedBookings) ? savedBookings : []);
        } catch {
            setDismissedBookings([]);
        }

        setDismissedLoaded(true);
    }, [session, isPending]);

    // Save hidden cards
    useEffect(() => {
        if (!dismissedLoaded || !session?.user?.email) return;

        const storageKey = `fixmate-dismissed-bookings:${session.user.email}`;

        localStorage.setItem(storageKey, JSON.stringify(dismissedBookings));
    }, [dismissedBookings, dismissedLoaded, session]);

    // Fetch customer bookings
    async function fetchBookings(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to load bookings");
            }

            const fetchedBookings = result.data || [];
            setBookings(fetchedBookings);
            return fetchedBookings;
        } catch (error) {
            setError(error.message || "Failed to load bookings.");
            return [];
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (isPending || !session?.user) return;

        fetchBookings();
    }, [session, isPending]);

        // Refresh payment status after returning from Stripe Checkout.
    useEffect(() => {
        if (isPending || !session?.user) return;

        const paymentResult = searchParams.get("payment");
        if (paymentResult === "success") {
            setPaymentNotice("Payment successful. Updating your booking payment status...");
        } else if (paymentResult === "cancelled") {
            setPaymentNotice("Payment was cancelled. You can try again when you're ready.");
        }

        let attempts = 0;
        const maxAttempts = 30;
        let pollTimer;

        async function refreshAfterPayment() {
            const refreshedBookings = await fetchBookings(true);
            attempts += 1;

            // Stop polling as soon as the booking is marked paid.
            const paymentIsConfirmed = refreshedBookings.some(
                (booking) => booking.paymentStatus?.toLowerCase() === "paid"
            );

            if (paymentIsConfirmed || attempts >= maxAttempts) {
                if (paymentIsConfirmed) {
                    setPaymentNotice("Payment confirmed! Your booking is marked as PAID.");
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete("payment");
                    cleanUrl.searchParams.delete("session_id");
                    router.replace(`${cleanUrl.pathname}${cleanUrl.search}`, { scroll: false });
                }
                return;
            }

            pollTimer = setTimeout(refreshAfterPayment, 3000);
        }

        if (paymentResult === "success") {
            // Start polling shortly after the first bookings request.
            pollTimer = setTimeout(refreshAfterPayment, 1500);
        }

        // Refresh whenever the user returns to this browser tab.
        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                fetchBookings(true);
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (pollTimer) clearTimeout(pollTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [session, isPending, searchParams, router]);

    // Check if booking can be cancelled within 24 hours of creation
    function canCancelBooking(booking) {
        if (booking.status !== "requested" || !booking.createdAt) {
            return false;
        }

        const createdTime = new Date(booking.createdAt).getTime();
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        const timePassed = currentTime - createdTime;

        return (
            !Number.isNaN(createdTime) &&
            timePassed >= 0 &&
            timePassed <= twentyFourHours
        );
    }

    // Cancel booking
    async function handleCancelBooking(bookingId) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this repair booking? You can cancel only within 24 hours of placing the request."
        );

        if (!confirmed) return;

        try {
            setCancelLoading(bookingId);
            setError("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to cancel booking");
            }

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, status: "cancelled" }
                        : booking
                )
            );

            alert("Booking cancelled successfully!");
        } catch (error) {
            setError(error.message || "Failed to cancel booking.");
        } finally {
            setCancelLoading("");
        }
    }

    // Hide one booking card (does not delete from database)
    function handleDismissBooking(bookingId) {
        setDismissedBookings((previous) =>
            previous.includes(bookingId)
                ? previous
                : [...previous, bookingId]
        );
    }

    // Hide all visible booking cards (does not delete from database)
    function handleClearAll() {
        const confirmed = window.confirm(
            "Hide all booking cards from this page? Your bookings will not be deleted."
        );

        if (!confirmed) return;

        const visibleBookingIds = bookings
            .filter((booking) => !dismissedBookings.includes(booking._id))
            .map((booking) => booking._id);

        setDismissedBookings((previous) => [
            ...new Set([...previous, ...visibleBookingIds]),
        ]);
    }

    // CUSTOMER: PAY FOR COMPLETED REPAIR
    async function handlePayment(bookingId) {
        try {
            setPaymentLoading(bookingId);
            setError("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ bookingId }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to start payment");
            }

            if (!result.url) {
                throw new Error("Stripe Checkout URL was not received");
            }

            window.location.href = result.url;
        } catch (error) {
            setError(error.message || "Unable to start payment.");
            setPaymentLoading("");
        }
    }

    // Customer-friendly status labels
    function getStatusLabel(status) {
        switch (status) {
            case "requested":
                return "Waiting for Technician";
            case "accepted":
                return "Request Accepted";
            case "in-progress":
                return "Repair in Progress";
            case "completed":
                return "Repair Completed";
            case "rejected":
                return "Request Rejected";
            case "cancelled":
                return "Booking Cancelled";
            default:
                return status;
        }
    }

    // Booking status colors
    function getStatusColor(status) {
        switch (status) {
            case "requested":
                return "bg-amber-100 text-amber-700";
            case "accepted":
                return "bg-blue-100 text-blue-700";
            case "in-progress":
                return "bg-purple-100 text-purple-700";
            case "completed":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "cancelled":
                return "bg-slate-200 text-slate-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    }

    // Repair progress indicator
    function getProgress(status) {
        const steps = [
            "requested",
            "accepted",
            "in-progress",
            "completed",
        ];

        return steps.indexOf(status);
    }

    // Visible booking cards
    const visibleBookings = bookings.filter(
        (booking) => !dismissedBookings.includes(booking._id)
    );

    if (isPending || !session) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Checking your account...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-5 py-10">
            <div className="mx-auto max-w-6xl">

                {/* Back button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                {/* Page heading */}
                <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            My Bookings
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Track and manage your repair requests.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => fetchBookings(true)}
                            disabled={loading || refreshing}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh Bookings
                        </button>

                        <Link
                            href="/services"
                            className="w-fit rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
                        >
                            Book Another Service
                        </Link>
                    </div>
                </div>

                {/* Booking count */}
                {!loading && !error && (
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">
                            Total Repair Requests
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-900">
                            {bookings.length}
                        </h2>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">
                        <RefreshCw
                            className="mx-auto animate-spin text-teal-700"
                            size={32}
                        />

                        <p className="mt-4 text-slate-500">
                            Loading your bookings...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                        {error}
                    </div>
                )}

                                {/* Stripe return notice */}
                {paymentNotice && (
                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
                        {paymentNotice}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <ClipboardList
                            size={48}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            No Bookings Yet
                        </h2>

                        <p className="mt-2 text-slate-500">
                            You haven`t requested any repair services yet.
                        </p>

                        <Link
                            href="/services"
                            className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
                        >
                            Explore Services
                        </Link>
                    </div>
                )}

                {/* Clear All button */}
                {!loading && !error && visibleBookings.length > 0 && (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Showing {visibleBookings.length} of {bookings.length} bookings
                        </p>

                        <button
                            onClick={handleClearAll}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                            <Trash2 size={17} />
                            Clear All
                        </button>
                    </div>
                )}

                {/* All cards hidden state */}
                {!loading && !error && bookings.length > 0 && visibleBookings.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                        <ClipboardList
                            size={45}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-4 text-xl font-bold text-slate-900">
                            All Booking Cards Hidden
                        </h2>

                        <p className="mt-2 text-slate-500">
                            You cleared all booking cards from this page. Your bookings are still saved.
                        </p>

                        <button
                            onClick={() => setDismissedBookings([])}
                            className="mt-6 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800"
                        >
                            Show All Bookings Again
                        </button>
                    </div>
                )}

                {/* Booking cards */}
                {!loading && !error && visibleBookings.length > 0 && (
                    <div className="mt-8 grid gap-6">
                        {visibleBookings.map((booking) => {
                            const progress = getProgress(booking.status);

                            const isPaid =
                                booking.paymentStatus?.toLowerCase() === "paid";

                            const canPay =
                                booking.status === "completed" && !isPaid;

                            const cancellationAllowed = canCancelBooking(booking);

                            return (
                                <div
                                    key={booking._id}
                                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    {/* X dismiss button */}
                                    <button
                                        onClick={() => handleDismissBooking(booking._id)}
                                        title="Hide this booking card"
                                        aria-label="Hide booking card"
                                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <X size={19} />
                                    </button>

                                    <div className="grid md:grid-cols-[240px_1fr]">

                                        {/* Service image */}
                                        <div className="h-52 bg-slate-100 md:h-full">
                                            {booking.serviceImage ? (
                                                <img
                                                    src={booking.serviceImage}
                                                    alt={booking.serviceTitle}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Booking information */}
                                        <div className="p-6">

                                            {/* Category and status */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
                                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                                                    {booking.serviceCategory}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(booking.status)}`}
                                                >
                                                    {getStatusLabel(booking.status)}
                                                </span>
                                            </div>

                                            {/* Service title */}
                                            <h2 className="mt-4 text-xl font-bold text-slate-900">
                                                {booking.serviceTitle}
                                            </h2>

                                            <p className="mt-2 text-sm text-slate-500">
                                                Technician: {booking.technicianName}
                                            </p>

                                            {/* Repair progress */}
                                            {progress !== -1 && (
                                                <div className="mt-7">
                                                    <h3 className="mb-5 font-semibold text-slate-800">
                                                        Repair Progress
                                                    </h3>

                                                    <div className="grid grid-cols-4 gap-2">
                                                        {[
                                                            "Requested",
                                                            "Accepted",
                                                            "In Progress",
                                                            "Completed",
                                                        ].map((step, index) => (
                                                            <div
                                                                key={step}
                                                                className="text-center"
                                                            >
                                                                <div
                                                                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                                                        index <= progress
                                                                            ? "bg-green-600 text-white"
                                                                            : "bg-slate-200 text-slate-500"
                                                                    }`}
                                                                >
                                                                    {index + 1}
                                                                </div>

                                                                <p
                                                                    className={`mt-2 text-xs font-semibold ${
                                                                        index <= progress
                                                                            ? "text-green-700"
                                                                            : "text-slate-400"
                                                                    }`}
                                                                >
                                                                    {step}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejected message */}
                                            {booking.status === "rejected" && (
                                                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                                                    Your repair request was rejected by the technician.
                                                </div>
                                            )}

                                            {/* Cancelled message */}
                                            {booking.status === "cancelled" && (
                                                <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                                                    This repair booking has been cancelled.
                                                </div>
                                            )}

                                            {/* Booking details */}
                                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CalendarDays
                                                        size={18}
                                                        className="text-teal-700"
                                                    />

                                                    {new Date(booking.preferredDate).toLocaleDateString(
                                                        "en-BD",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin
                                                        size={18}
                                                        className="text-teal-700"
                                                    />

                                                    {booking.customerAddress}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock
                                                        size={18}
                                                        className="text-teal-700"
                                                    />

                                                    {booking.estimatedDuration}
                                                </div>
                                            </div>

                                            {/* Price and payment */}
                                            <div className="mt-7 border-t border-slate-200 pt-6">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                                    {/* Base Price */}
                                                    <div className="rounded-xl bg-slate-50 p-4">
                                                        <p className="text-xs font-semibold text-slate-500">
                                                            Base Price
                                                        </p>

                                                        <p className="mt-2 text-2xl font-extrabold text-teal-700">
                                                            ${booking.basePrice ?? 0}
                                                        </p>
                                                    </div>

                                                    {/* Final Price */}
                                                    <div className="rounded-xl bg-slate-50 p-4">
                                                        <p className="text-xs font-semibold text-slate-500">
                                                            Final Price
                                                        </p>

                                                        <p className="mt-2 text-2xl font-extrabold text-slate-900">
                                                            {booking.finalAmount !== undefined &&
                                                            booking.finalAmount !== null
                                                                ? `$${booking.finalAmount}`
                                                                : "Not set yet"}
                                                        </p>
                                                    </div>

                                                    {/* Payment Status */}
                                                    <div
                                                        className={`rounded-xl p-4 ${
                                                            isPaid
                                                                ? "bg-green-50"
                                                                : "bg-red-50"
                                                        }`}
                                                    >
                                                        <p className="text-xs font-semibold text-slate-500">
                                                            Payment Status
                                                        </p>

                                                        <p
                                                            className={`mt-2 text-xl font-extrabold ${
                                                                isPaid
                                                                    ? "text-green-700"
                                                                    : "text-red-700"
                                                            }`}
                                                        >
                                                            {booking.paymentStatus
                                                                ? booking.paymentStatus.toUpperCase()
                                                                : "UNPAID"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Booking ID and actions */}
                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-xs text-slate-400">
                                                        Booking ID: {booking._id.slice(-8)}
                                                    </p>

                                                    <div className="flex flex-wrap gap-3">

                                                        {/* Pay Now */}
                                                        {canPay && (
                                                            <button
                                                                onClick={() => handlePayment(booking._id)}
                                                                disabled={paymentLoading === booking._id}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <CreditCard size={17} />
                                                                {paymentLoading === booking._id
                                                                    ? "Redirecting..."
                                                                    : "Pay Now"}
                                                            </button>
                                                        )}

                                                        {/* Cancel booking - only within 24 hours */}
                                                        {cancellationAllowed && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                disabled={cancelLoading === booking._id}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <XCircle size={17} />
                                                                {cancelLoading === booking._id
                                                                    ? "Cancelling..."
                                                                    : "Cancel Booking"}
                                                            </button>
                                                        )}

                                                        {/* 24 hour expiration note */}
                                                        {booking.status === "requested" && !cancellationAllowed && (
                                                            <p className="self-center text-xs text-slate-500">
                                                                Cancellation period has expired (24 hours).
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
