
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Clock,
    CalendarDays,
    MapPin,
    Home,
    Store,
    CheckCircle2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function RequestRepairForm({ serviceId, serviceMode }) {
    const { data: session, isPending } = authClient.useSession();

    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [problemDescription, setProblemDescription] = useState("");

    const [repairMethod, setRepairMethod] = useState(
        serviceMode === "Shop Drop-off" ? "Shop Drop-off" : "Home Visit"
    );

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // Get today's date in Bangladesh timezone.
    function getBangladeshDate() {
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());

        const year = parts.find((part) => part.type === "year").value;
        const month = parts.find((part) => part.type === "month").value;
        const day = parts.find((part) => part.type === "day").value;

        return `${year}-${month}-${day}`;
    }

    const today = getBangladeshDate();

    async function handleSubmit(e) {
        e.preventDefault();

        setMessage("");
        setSuccess(false);

        // Phone validation
        if (
            !phone.trim() ||
            phone.trim().length < 8 ||
            phone.trim().length > 20
        ) {
            setMessage("Please enter a valid phone number.");
            return;
        }

        // Repair method validation
        if (
            repairMethod !== "Home Visit" &&
            repairMethod !== "Shop Drop-off"
        ) {
            setMessage("Please select a repair method.");
            return;
        }

        // Address validation
        if (!address.trim() || address.trim().length < 5) {
            setMessage("Please enter your complete contact address.");
            return;
        }

        // Date and time validation
        if (!bookingDate || !bookingTime) {
            setMessage("Please select your preferred booking date and time.");
            return;
        }

        // Convert selected Bangladesh date and time to a Date object.
        const selectedDateTime = new Date(
            `${bookingDate}T${bookingTime}:00+06:00`
        );

        if (
            Number.isNaN(selectedDateTime.getTime()) ||
            bookingDate < today ||
            selectedDateTime.getTime() <= Date.now()
        ) {
            setMessage("Please select a future date and time.");
            return;
        }

        // Problem description validation
        if (problemDescription.trim().length < 20) {
            setMessage(
                "Please describe your problem using at least 20 characters."
            );
            return;
        }

        if (problemDescription.trim().length > 1000) {
            setMessage("Your description cannot exceed 1000 characters.");
            return;
        }

        try {
            setLoading(true);

            const token = await getBackendToken();

            if (!token) {
                throw new Error(
                    "Unable to verify your account. Please sign in again."
                );
            }

            const response = await fetch(`${API_URL}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    serviceId,
                    phone: phone.trim(),
                    address: address.trim(),
                    repairMethod,
                    bookingDate,
                    bookingTime,
                    problemDescription: problemDescription.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to submit repair request."
                );
            }

            setSuccess(true);
            setMessage(
                result.message ||
                "Your repair request was submitted successfully!"
            );

            // Clear the form after successful submission.
            setPhone("");
            setAddress("");
            setBookingDate("");
            setBookingTime("");
            setProblemDescription("");
        } catch (error) {
            console.error("Booking submission error:", error);

            setSuccess(false);
            setMessage(
                error.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    // Loading state
    if (isPending) {
        return (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                Checking your account...
            </div>
        );
    }

    // Sign-in required
    if (!session?.user) {
        return (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">
                    Request This Repair
                </h2>

                <p className="mt-3 text-slate-600">
                    Please sign in to request this repair service.
                </p>

                <Link
                    href="/sign-in"
                    className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                    Sign In to Continue
                </Link>
            </div>
        );
    }

    // Customer role required
    if (session.user.role !== "customer") {
        return (
            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-7">
                <h2 className="text-xl font-bold text-amber-800">
                    Repair Request Unavailable
                </h2>

                <p className="mt-2 text-amber-700">
                    Only customers can request a repair.
                </p>
            </div>
        );
    }

    return (
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
                Request This Repair
            </h2>

            <p className="mt-2 text-slate-500">
                Fill in the information below to submit your repair request.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-6">

                {/* Customer Information */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Customer Name
                        </label>

                        <input
                            type="text"
                            value={session.user.name || ""}
                            readOnly
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={session.user.email || ""}
                            readOnly
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                        />
                    </div>
                </div>

                {/* Phone Number */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        minLength={8}
                        maxLength={20}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                {/* Repair Method */}
                <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                        Select Repair Method
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">

                        {/* Home Visit */}
                        <button
                            type="button"
                            onClick={() => setRepairMethod("Home Visit")}
                            aria-pressed={repairMethod === "Home Visit"}
                            className={`relative rounded-2xl border-2 p-5 text-left transition ${
                                repairMethod === "Home Visit"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-slate-200 bg-white hover:border-orange-300"
                            }`}
                        >
                            {repairMethod === "Home Visit" && (
                                <CheckCircle2
                                    size={20}
                                    className="absolute right-4 top-4 text-orange-500"
                                />
                            )}

                            <Home
                                size={28}
                                className={
                                    repairMethod === "Home Visit"
                                        ? "text-orange-600"
                                        : "text-slate-500"
                                }
                            />

                            <h3 className="mt-3 font-bold text-slate-900">
                                Home Visit
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                The technician visits your home to repair your device.
                            </p>
                        </button>

                        {/* Shop Drop-off */}
                        <button
                            type="button"
                            onClick={() => setRepairMethod("Shop Drop-off")}
                            aria-pressed={repairMethod === "Shop Drop-off"}
                            className={`relative rounded-2xl border-2 p-5 text-left transition ${
                                repairMethod === "Shop Drop-off"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-slate-200 bg-white hover:border-orange-300"
                            }`}
                        >
                            {repairMethod === "Shop Drop-off" && (
                                <CheckCircle2
                                    size={20}
                                    className="absolute right-4 top-4 text-orange-500"
                                />
                            )}

                            <Store
                                size={28}
                                className={
                                    repairMethod === "Shop Drop-off"
                                        ? "text-orange-600"
                                        : "text-slate-500"
                                }
                            />

                            <h3 className="mt-3 font-bold text-slate-900">
                                Shop Drop-off
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                You take your device to the technician's shop.
                            </p>
                        </button>
                    </div>
                </div>

                {/* Contact Address */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <MapPin size={17} />
                        Your Contact Address
                    </label>

                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={
                            repairMethod === "Home Visit"
                                ? "Enter your complete home address..."
                                : "Enter your contact address..."
                        }
                        rows={3}
                        minLength={5}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                        This address is for customer contact purposes.
                    </p>
                </div>

                {/* Preferred Date and Time */}
                <div className="grid gap-5 sm:grid-cols-2">

                    {/* Preferred Repair Date */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <CalendarDays size={17} />
                            Preferred Repair Date
                        </label>

                        <input
                            type="date"
                            value={bookingDate}
                            min={today}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {/* Preferred Repair Time */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Clock size={17} />
                            Preferred Repair Time
                        </label>

                        <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                </div>

                <p className="text-sm text-slate-500">
                    Please select a future date and time. All booking times use Bangladesh Standard Time (UTC+6).
                </p>

                {/* Problem Description */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Describe Your Problem
                    </label>

                    <textarea
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        placeholder="Describe the appliance problem..."
                        rows={5}
                        minLength={20}
                        maxLength={1000}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Minimum 20 characters, maximum 1000 characters.
                        {" "}
                        {problemDescription.length}/1000
                    </p>
                </div>

                {/* Success / Error Message */}
                {message && (
                    <div
                        role="alert"
                        className={`rounded-xl p-4 text-sm font-medium ${
                            success
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Submitting Request..."
                        : "Submit Repair Request"}
                </button>
            </form>
        </section>
    );
}
