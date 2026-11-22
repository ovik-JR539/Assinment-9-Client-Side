
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
    RefreshCw,
    CheckCircle,
    XCircle,
    CalendarDays,
    UserRound,
    Phone,
    MapPin,
    LoaderCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

export default function TechnicianDashboard() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [finalAmount, setFinalAmount] = useState("");

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
    async function updateBookingStatus(bookingId, status, amount = null) {
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

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking._id === bookingId
                        ? {
                              ...booking,
                              status: result.status || status,
                              ...(status === "completed" && {
                                  finalAmount:
                                      result.finalAmount ?? Number(amount),
                              }),
                          }
                        : booking
                )
            );

            if (status === "completed") {
                setSelectedBooking(null);
                setFinalAmount("");
            }
        } catch (error) {
            setMessage(error.message || "Unable to update booking.");
        } finally {
            setUpdatingId(null);
        }
    }

    // Open completion modal
    function openCompletionModal(booking) {
        setSelectedBooking(booking);
        setFinalAmount(String(booking.basePrice || ""));
        setMessage("");
    }

    // Complete repair
    function handleCompleteRepair() {
        if (!selectedBooking) return;

        const amount = Number(finalAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setMessage("Please enter a valid final repair amount.");
            return;
        }

        updateBookingStatus(
            selectedBooking._id,
            "completed",
            amount
        );
    }

    // Loading screen
    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-orange-600" />

                    <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
                        Loading repair requests...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-slate-950 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
                            Technician Workspace
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                            Repair Requests
                        </h1>

                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Welcome back, {session?.user?.name || "Technician"}.
                            Manage your customer repair bookings here.
                        </p>
                    </div>

                    {/* Refresh Button Only */}
                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>

                </div>

                {/* Error Message */}
                {message && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                        <XCircle size={20} />
                        <p>{message}</p>
                    </div>
                )}

                {/* Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-5">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

                        <div className="flex items-center justify-between">

                            <p className="font-medium text-slate-500 dark:text-slate-400">
                                Total Bookings
                            </p>

                            <CalendarDays
                                className="text-blue-600 dark:text-blue-400"
                                size={24}
                            />

                        </div>

                        <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                            {bookings.length}
                        </h2>

                    </div>

                </div>

                {/* Booking List Heading */}
                <div className="mb-5">

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        My Customer Bookings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Review admin-approved requests and update repair progress.
                    </p>

                </div>

                {/* Empty State */}
                {bookings.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">

                        <CalendarDays
                            size={48}
                            className="mx-auto text-slate-300 dark:text-slate-600"
                        />

                        <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                            No bookings found
                        </h3>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Admin-approved customer requests will appear here.
                        </p>

                    </div>
                )}

                {/* Booking Cards */}
                <div className="grid gap-6">

                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
                        >

                            <div className="flex flex-col gap-5 lg:flex-row">

                                {/* Service Image */}
                                {booking.serviceImage && (
                                    <img
                                        src={booking.serviceImage}
                                        alt={
                                            booking.serviceTitle ||
                                            "Repair service"
                                        }
                                        className="h-48 w-full rounded-xl object-cover lg:h-44 lg:w-56"
                                    />
                                )}

                                {/* Booking Details */}
                                <div className="min-w-0 flex-1">

                                    {/* Service Heading */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {booking.serviceTitle}
                                        </h3>

                                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                            {booking.status?.replace("-", " ")}
                                        </span>

                                    </div>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Category: {booking.serviceCategory}
                                    </p>

                                    {/* Customer Information */}
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                                        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <UserRound
                                                size={17}
                                                className="shrink-0 text-slate-400"
                                            />
                                            {booking.customerName}
                                        </p>

                                        <p className="flex items-center gap-2 break-all text-slate-700 dark:text-slate-200">
                                            <Phone
                                                size={17}
                                                className="shrink-0 text-slate-400"
                                            />
                                            {booking.customerPhone}
                                        </p>

                                        <p className="break-all text-slate-600 dark:text-slate-300">
                                            <strong>Email:</strong>{" "}
                                            {booking.customerEmail}
                                        </p>

                                        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <CalendarDays
                                                size={17}
                                                className="shrink-0 text-slate-400"
                                            />
                                            {booking.preferredDate
                                                ? new Date(
                                                      booking.preferredDate
                                                  ).toLocaleDateString("en-BD")
                                                : "Date not available"}
                                        </p>

                                    </div>

                                    {/* Customer Address */}
                                    <div className="mt-5">

                                        <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                                            <MapPin
                                                size={17}
                                                className="text-orange-600"
                                            />
                                            Customer Address
                                        </p>

                                        <p className="mt-1 text-slate-600 dark:text-slate-300">
                                            {booking.customerAddress}
                                        </p>

                                    </div>

                                    {/* Problem Description */}
                                    <div className="mt-5">

                                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                                            Problem Description
                                        </p>

                                        <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                                            {booking.problemDescription}
                                        </p>

                                    </div>

                                    {/* Price */}
                                    <div className="mt-5 flex flex-wrap gap-6">

                                        <p className="text-slate-600 dark:text-slate-300">
                                            Base Price:{" "}
                                            <strong className="text-slate-900 dark:text-white">
                                                ${booking.basePrice}
                                            </strong>
                                        </p>

                                        {booking.finalAmount != null && (
                                            <p className="text-green-700 dark:text-green-400">
                                                Final Amount:{" "}
                                                <strong>
                                                    ${booking.finalAmount}
                                                </strong>
                                            </p>
                                        )}

                                    </div>

                                    {/* Booking Actions */}
                                    <div className="mt-6 flex flex-wrap gap-3">

                                        {/* Accept or Reject */}
                                        {booking.status === "approved" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        updateBookingStatus(
                                                            booking._id,
                                                            "accepted"
                                                        )
                                                    }
                                                    disabled={
                                                        updatingId === booking._id
                                                    }
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
                                                    disabled={
                                                        updatingId === booking._id
                                                    }
                                                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {updatingId === booking._id
                                                        ? "Updating..."
                                                        : "Reject Request"}
                                                </button>
                                            </>
                                        )}

                                        {/* Start Repair */}
                                        {booking.status === "accepted" && (
                                            <button
                                                onClick={() =>
                                                    updateBookingStatus(
                                                        booking._id,
                                                        "in-progress"
                                                    )
                                                }
                                                disabled={
                                                    updatingId === booking._id
                                                }
                                                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {updatingId === booking._id
                                                    ? "Updating..."
                                                    : "Start Repair"}
                                            </button>
                                        )}

                                        {/* Complete Repair */}
                                        {booking.status === "in-progress" && (
                                            <button
                                                onClick={() =>
                                                    openCompletionModal(booking)
                                                }
                                                disabled={
                                                    updatingId === booking._id
                                                }
                                                className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
                                            >
                                                Complete Repair
                                            </button>
                                        )}

                                        {/* Completed */}
                                        {booking.status === "completed" && (
                                            <span className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
                                                <CheckCircle size={18} />
                                                Repair Completed
                                            </span>
                                        )}

                                        {/* Rejected */}
                                        {booking.status === "rejected" && (
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                                Request Rejected
                                            </span>
                                        )}

                                        {/* Cancelled */}
                                        {booking.status === "cancelled" && (
                                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                                Booking Cancelled
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>

                {/* Final Repair Amount Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">

                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Complete Repair
                            </h2>

                            <p className="mt-2 text-slate-600 dark:text-slate-300">
                                Enter the final repair amount for:
                            </p>

                            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                {selectedBooking.serviceTitle}
                            </p>

                            {/* Original Price */}
                            <div className="mt-5 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Original Base Price
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    ${selectedBooking.basePrice}
                                </p>

                            </div>

                            {/* Final Amount Input */}
                            <div className="mt-5">

                                <label
                                    htmlFor="finalAmount"
                                    className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                                >
                                    Final Repair Amount ($)
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
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900"
                                />

                            </div>

                            {/* Modal Error */}
                            {message && (
                                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                                    {message}
                                </p>
                            )}

                            {/* Modal Buttons */}
                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    onClick={() => {
                                        setSelectedBooking(null);
                                        setFinalAmount("");
                                        setMessage("");
                                    }}
                                    disabled={
                                        updatingId === selectedBooking._id
                                    }
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCompleteRepair}
                                    disabled={
                                        updatingId === selectedBooking._id
                                    }
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
