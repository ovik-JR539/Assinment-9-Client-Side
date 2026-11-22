"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    RefreshCw,
    Plus,
    CheckCircle,
    XCircle,
    CalendarDays,
    UserRound,
    Phone,
    MapPin,
    LoaderCircle,
    X,
    Trash2,
    Play,
    ClipboardList,
    DollarSign,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

export default function TechnicianDashboard() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
    const [updatingId, setUpdatingId] = useState(null);

    // Completion modal
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [finalAmount, setFinalAmount] = useState("");
    const [priceExplanation, setPriceExplanation] = useState("");

    // Hidden booking cards
    const [dismissedBookings, setDismissedBookings] = useState([]);

    const storageKey = session?.user?.email
        ? `fixmate-technician-hidden-bookings:${session.user.email}`
        : null;

    // Load hidden cards from localStorage
    useEffect(() => {
        if (!storageKey) return;

        const savedIds = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        setDismissedBookings(savedIds);
    }, [storageKey]);

    // Fetch technician bookings
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/technician-bookings`,
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
                    result.message || "Failed to load bookings."
                );
            }

            setBookings(result.data || []);
        } catch (error) {
            setMessage(error.message || "Something went wrong.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }, []);

    // Authentication and role check
    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.replace("/sign-in");
            return;
        }

        if (session.user.role !== "technician") {
            router.replace("/dashboard");
            return;
        }

        fetchBookings();
    }, [session, isPending, router, fetchBookings]);

    // Update booking status
    async function updateBookingStatus(
        bookingId,
        status,
        amount = null,
        description = ""
    ) {
        try {
            setUpdatingId(bookingId);
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                        ...(status === "completed" && {
                            finalAmount: Number(amount),
                            priceExplanation: description,
                        }),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Booking update failed."
                );
            }

            // Update the card without removing it
            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking._id === bookingId
                        ? {
                              ...booking,
                              status: result.status || status,
                              ...(status === "completed" && {
                                  finalAmount:
                                      result.finalAmount ?? Number(amount),
                                  priceExplanation:
                                      result.priceExplanation ?? description,
                              }),
                          }
                        : booking
                )
            );

            if (status === "accepted") {
                setMessage("Request accepted successfully.");
                setMessageType("success");
            }

            if (status === "in-progress") {
                setMessage("Repair work has started.");
                setMessageType("success");
            }

            if (status === "completed") {
                setMessage("Repair completed successfully.");
                setMessageType("success");
                setSelectedBooking(null);
                setFinalAmount("");
                setPriceExplanation("");
            }

            if (status === "rejected") {
                setMessage("Request rejected.");
                setMessageType("success");
            }
        } catch (error) {
            setMessage(error.message || "Unable to update booking.");
            setMessageType("error");
        } finally {
            setUpdatingId(null);
        }
    }

    // Open completion modal
    function openCompletionModal(booking) {
        setSelectedBooking(booking);
        setFinalAmount(String(booking.basePrice || ""));
        setPriceExplanation("");
        setMessage("");
    }

    // Complete repair
    function handleCompleteRepair() {
        if (!selectedBooking) return;

        const amount = Number(finalAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setMessage("Please enter a valid final repair amount.");
            setMessageType("error");
            return;
        }

        if (!priceExplanation.trim()) {
            setMessage("Please describe the work you completed.");
            setMessageType("error");
            return;
        }

        updateBookingStatus(
            selectedBooking._id,
            "completed",
            amount,
            priceExplanation.trim()
        );
    }

    // Hide one booking card (does not delete the booking)
    function dismissBooking(bookingId) {
        const updatedIds = [...new Set([...dismissedBookings, bookingId])];

        setDismissedBookings(updatedIds);

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(updatedIds));
        }
    }

    // Hide all booking cards (does not delete the bookings)
    function clearAllBookings() {
        const allIds = bookings.map((booking) => booking._id);

        const updatedIds = [
            ...new Set([...dismissedBookings, ...allIds]),
        ];

        setDismissedBookings(updatedIds);

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(updatedIds));
        }

        setMessage("All booking cards have been hidden.");
        setMessageType("success");
    }

    // Restore hidden cards
    function showAllBookingsAgain() {
        setDismissedBookings([]);

        if (storageKey) {
            localStorage.removeItem(storageKey);
        }

        setMessage("All booking cards are visible again.");
        setMessageType("success");
    }

    // Visible cards
    const visibleBookings = bookings.filter(
        (booking) => !dismissedBookings.includes(booking._id)
    );

    // Loading screen
    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-orange-600" />
                    <p className="mt-3 font-medium text-slate-600">
                        Loading repair requests...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
                            Technician Workspace
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Repair Requests
                        </h1>

                        <p className="mt-2 text-slate-600">
                            Welcome back, {session?.user?.name || "Technician"}.
                            Manage your customer repair bookings here.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() =>
                                router.push("/dashboard/technician/add-service")
                            }
                            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                        >
                            <Plus size={18} />
                            Add Service
                        </button>

                        <button
                            onClick={fetchBookings}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
                            messageType === "success"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {messageType === "success" ? (
                            <CheckCircle size={20} />
                        ) : (
                            <XCircle size={20} />
                        )}
                        <p>{message}</p>
                    </div>
                )}

                {/* Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-500">
                                Total Bookings
                            </p>
                            <CalendarDays className="text-blue-600" size={24} />
                        </div>

                        <h2 className="mt-4 text-3xl font-bold text-slate-900">
                            {bookings.length}
                        </h2>
                    </div>
                </div>

                {/* Booking List Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            My Customer Bookings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Accept requests, start work, and complete repairs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                            Showing {visibleBookings.length} of {bookings.length}
                        </span>

                        <button
                            onClick={clearAllBookings}
                            disabled={visibleBookings.length === 0}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Trash2 size={17} />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {visibleBookings.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <ClipboardList
                            size={48}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 text-xl font-bold text-slate-800">
                            {bookings.length > 0
                                ? "All Booking Cards Hidden"
                                : "No bookings found"}
                        </h3>

                        <p className="mt-2 text-slate-500">
                            {bookings.length > 0
                                ? "You have hidden all booking cards."
                                : "Admin-approved customer requests will appear here."}
                        </p>

                        {bookings.length > 0 && (
                            <button
                                onClick={showAllBookingsAgain}
                                className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
                            >
                                Show All Bookings Again
                            </button>
                        )}
                    </div>
                )}

                {/* Booking Cards */}
                <div className="grid gap-6">
                    {visibleBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            {/* X Button */}
                            <button
                                onClick={() => dismissBooking(booking._id)}
                                title="Hide booking card"
                                className="absolute right-4 top-4 rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex flex-col gap-5 lg:flex-row">

                                {/* Service Image */}
                                {booking.serviceImage && (
                                    <img
                                        src={booking.serviceImage}
                                        alt={booking.serviceTitle || "Repair service"}
                                        className="h-48 w-full rounded-xl object-cover lg:h-44 lg:w-56"
                                    />
                                )}

                                {/* Booking Details */}
                                <div className="min-w-0 flex-1">

                                    {/* Title and Status */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {booking.serviceTitle}
                                        </h3>

                                        <span
                                            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                                                booking.status === "approved"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : booking.status === "accepted"
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : booking.status === "in-progress"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : booking.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : booking.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {booking.status === "approved"
                                                ? "Pending"
                                                : booking.status?.replace("-", " ")}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Category: {booking.serviceCategory}
                                    </p>

                                    {/* Customer Information */}
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <UserRound size={17} className="text-slate-400" />
                                            {booking.customerName || "No name"}
                                        </p>

                                        <p className="flex items-center gap-2 break-all text-slate-700">
                                            <Phone size={17} className="shrink-0 text-slate-400" />
                                            {booking.customerPhone || "No phone"}
                                        </p>

                                        <p className="break-all text-slate-600">
                                            <strong>Email:</strong>{" "}
                                            {booking.customerEmail || "Not provided"}
                                        </p>

                                        <p className="flex items-center gap-2 text-slate-700">
                                            <CalendarDays size={17} className="text-slate-400" />
                                            {booking.preferredDate
                                                ? new Date(booking.preferredDate).toLocaleDateString("en-BD")
                                                : "No preferred date"}
                                        </p>
                                    </div>

                                    {/* Customer Address */}
                                    <div className="mt-5">
                                        <p className="flex items-center gap-2 font-semibold text-slate-800">
                                            <MapPin size={17} className="text-orange-600" />
                                            Customer Address
                                        </p>

                                        <p className="mt-1 text-slate-600">
                                            {booking.customerAddress || "No address provided"}
                                        </p>
                                    </div>

                                    {/* Customer Problem */}
                                    <div className="mt-5">
                                        <p className="font-semibold text-slate-800">
                                            Problem Description
                                        </p>

                                        <p className="mt-1 leading-relaxed text-slate-600">
                                            {booking.problemDescription || "No problem description provided."}
                                        </p>
                                    </div>

                                    {/* Prices */}
                                    <div className="mt-5 flex flex-wrap gap-6">
                                        <p className="text-slate-600">
                                            Base Price:{" "}
                                            <strong className="text-slate-900">
                                                ${booking.basePrice ?? 0}
                                            </strong>
                                        </p>

                                        {booking.finalAmount != null && (
                                            <p className="text-green-700">
                                                Final Amount:{" "}
                                                <strong>
                                                    ${booking.finalAmount}
                                                </strong>
                                            </p>
                                        )}
                                    </div>

                                    {/* Work Description for completed repair */}
                                    {booking.status === "completed" &&
                                        booking.priceExplanation && (
                                            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                                                <p className="font-semibold text-green-800">
                                                    Work Completed
                                                </p>

                                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-green-700">
                                                    {booking.priceExplanation}
                                                </p>
                                            </div>
                                        )}

                                    {/* Actions */}
                                    <div className="mt-6 flex flex-wrap gap-3">

                                        {/* Accept / Reject */}
                                        {booking.status === "approved" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        updateBookingStatus(
                                                            booking._id,
                                                            "accepted"
                                                        )
                                                    }
                                                    disabled={updatingId === booking._id}
                                                    className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {updatingId === booking._id
                                                        ? "Updating..."
                                                        : "Accept Request"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        updateBookingStatus(
                                                            booking._id,
                                                            "rejected"
                                                        )
                                                    }
                                                    disabled={updatingId === booking._id}
                                                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {updatingId === booking._id
                                                        ? "Updating..."
                                                        : "Reject Request"}
                                                </button>
                                            </>
                                        )}

                                        {/* Start Work */}
                                        {booking.status === "accepted" && (
                                            <button
                                                onClick={() =>
                                                    updateBookingStatus(
                                                        booking._id,
                                                        "in-progress"
                                                    )
                                                }
                                                disabled={updatingId === booking._id}
                                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                <Play size={17} />
                                                {updatingId === booking._id
                                                    ? "Starting..."
                                                    : "Start Work"}
                                            </button>
                                        )}

                                        {/* Complete Work */}
                                        {booking.status === "in-progress" && (
                                            <button
                                                onClick={() =>
                                                    openCompletionModal(booking)
                                                }
                                                disabled={updatingId === booking._id}
                                                className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
                                            >
                                                <CheckCircle size={17} />
                                                Complete Work
                                            </button>
                                        )}

                                        {/* Completed */}
                                        {booking.status === "completed" && (
                                            <span className="flex items-center gap-2 font-semibold text-green-700">
                                                <CheckCircle size={18} />
                                                Work Completed
                                            </span>
                                        )}

                                        {/* Rejected */}
                                        {booking.status === "rejected" && (
                                            <span className="font-semibold text-red-600">
                                                Request Rejected
                                            </span>
                                        )}

                                        {/* Cancelled */}
                                        {booking.status === "cancelled" && (
                                            <span className="font-semibold text-slate-500">
                                                Booking Cancelled
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Completion Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
                        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Complete Work
                                </h2>

                                <button
                                    onClick={() => {
                                        setSelectedBooking(null);
                                        setFinalAmount("");
                                        setPriceExplanation("");
                                        setMessage("");
                                    }}
                                    disabled={updatingId === selectedBooking._id}
                                    className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="mt-2 text-slate-600">
                                Add the final repair amount and describe the work you completed.
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {selectedBooking.serviceTitle}
                            </p>

                            {/* Base Price */}
                            <div className="mt-5 rounded-xl bg-slate-100 p-4">
                                <p className="text-sm text-slate-500">
                                    Original Base Price
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    ${selectedBooking.basePrice ?? 0}
                                </p>
                            </div>

                            {/* Final Amount */}
                            <div className="mt-5">
                                <label
                                    htmlFor="finalAmount"
                                    className="mb-2 flex items-center gap-2 font-semibold text-slate-700"
                                >
                                    <DollarSign size={17} />
                                    Final Repair Amount
                                </label>

                                <input
                                    id="finalAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={finalAmount}
                                    onChange={(event) =>
                                        setFinalAmount(event.target.value)
                                    }
                                    placeholder="Enter final amount"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Work Description */}
                            <div className="mt-5">
                                <label
                                    htmlFor="priceExplanation"
                                    className="mb-2 block font-semibold text-slate-700"
                                >
                                    Work Description
                                </label>

                                <textarea
                                    id="priceExplanation"
                                    rows={5}
                                    value={priceExplanation}
                                    onChange={(event) =>
                                        setPriceExplanation(event.target.value)
                                    }
                                    placeholder="Describe the repair work completed, replaced parts, and other details..."
                                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Modal Error */}
                            {message && messageType === "error" && (
                                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {message}
                                </div>
                            )}

                            {/* Modal Buttons */}
                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedBooking(null);
                                        setFinalAmount("");
                                        setPriceExplanation("");
                                        setMessage("");
                                    }}
                                    disabled={updatingId === selectedBooking._id}
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCompleteRepair}
                                    disabled={updatingId === selectedBooking._id}
                                    className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
                                >
                                    {updatingId === selectedBooking._id
                                        ? "Completing..."
                                        : "Confirm Completion"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
