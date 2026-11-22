
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    X,
    Trash2,
    RefreshCw,
    Loader2,
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    CalendarDays,
    Tag,
    AlertCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function TechnicianViewRequestPage() {
    const router = useRouter();

    const { data: session, isPending: sessionLoading } =
        authClient.useSession();

    const [services, setServices] = useState([]);
    const [dismissedIds, setDismissedIds] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Technician access check
    useEffect(() => {
        if (sessionLoading) return;

        if (!session) {
            router.replace("/sign-in");
            return;
        }

        if (session.user?.role !== "technician") {
            router.replace("/dashboard");
        }
    }, [session, sessionLoading, router]);

    // Fetch technician's service requests
    const fetchServices = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found. Please sign in again.");
            }

            const response = await fetch(
                `${API_URL}/api/services/my-services`,
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
                throw new Error(result.message || "Failed to load service requests.");
            }

            setServices(result.data || []);

            // Refresh brings dismissed cards back
            if (isRefresh) {
                setDismissedIds([]);
            }

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!sessionLoading && session?.user?.role === "technician") {
            fetchServices();
        }
    }, [session, sessionLoading, fetchServices]);

    // Hide one card from this page only
    const handleRemoveCard = (serviceId) => {
        setDismissedIds((previous) => {
            if (previous.includes(serviceId)) return previous;
            return [...previous, serviceId];
        });

        setMessage("Service card removed from this page.");
        setError("");
    };

    // Hide all cards from this page only
    const handleClearAll = () => {
        if (visibleServices.length === 0) return;

        setDismissedIds((previous) => [
            ...new Set([
                ...previous,
                ...visibleServices.map((service) => service._id || service.id),
            ]),
        ]);

        setMessage("All service cards removed from this page.");
        setError("");
    };

    // Status badge
    const getStatus = (status) => {
        const normalized = (status || "pending").toLowerCase();

        if (normalized === "approved") {
            return {
                label: "Approved",
                color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                icon: CheckCircle,
            };
        }

        if (normalized === "rejected") {
            return {
                label: "Rejected",
                color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                icon: XCircle,
            };
        }

        return {
            label: "Pending",
            color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            icon: Clock,
        };
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Only hide cards in the frontend
    const visibleServices = services.filter(
        (service) =>
            !dismissedIds.includes(service._id || service.id)
    );

    const approvedCount = visibleServices.filter(
        (service) => service.approvalStatus === "approved"
    ).length;

    const rejectedCount = visibleServices.filter(
        (service) => service.approvalStatus === "rejected"
    ).length;

    const pendingCount = visibleServices.filter(
        (service) =>
            !service.approvalStatus ||
            service.approvalStatus === "pending"
    ).length;

    if (sessionLoading || (loading && !session)) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#111318] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-orange-500">
                            <ClipboardList size={22} />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                Technician Dashboard
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            Service Requests
                        </h1>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            View your submitted services and their approval status.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => fetchServices(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-[#1c2029] dark:text-gray-200"
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            onClick={handleClearAll}
                            disabled={visibleServices.length === 0}
                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={17} />
                            All Clear
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Visible Requests
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {visibleServices.length}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Approved
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-green-600">
                            {approvedCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rejected
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-red-500">
                            {rejectedCount}
                        </h2>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle size={18} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        Pending: <strong className="text-yellow-600">{pendingCount}</strong>
                    </span>
                    <span>|</span>
                    <span>
                        Showing {visibleServices.length} request(s)
                    </span>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
                    </div>
                ) : visibleServices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-[#1c2029]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/20">
                            <ClipboardList size={30} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            No Visible Service Requests
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                            You have no visible requests here. Your service records are still saved. Click Refresh to display them again.
                        </p>

                        <button
                            onClick={() => fetchServices(true)}
                            className="mt-6 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            Show Requests Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleServices.map((service) => {
                            const serviceId = service._id || service.id;
                            const status = getStatus(service.approvalStatus);
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={serviceId}
                                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-[#1c2029]"
                                >
                                    {/* X button: frontend only */}
                                    <button
                                        onClick={() => handleRemoveCard(serviceId)}
                                        title="Hide this card"
                                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md transition hover:bg-red-500 hover:text-white dark:bg-gray-900/90"
                                    >
                                        <X size={19} />
                                    </button>

                                    {/* Image */}
                                    <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={service.image || "/theme/Avater.png"}
                                            alt={service.title || "Service"}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.src = "/theme/Avater.png";
                                            }}
                                        />
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}
                                            >
                                                <StatusIcon size={14} />
                                                {status.label}
                                            </span>

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {service.category || "Other"}
                                            </span>
                                        </div>

                                        <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
                                            {service.title || "Untitled Service"}
                                        </h3>

                                        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500 dark:text-gray-400">
                                            {service.description || "No description provided."}
                                        </p>

                                        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Base Price
                                                </span>
                                                <strong className="text-gray-900 dark:text-white">
                                                    ৳{Number(service.basePrice || 0).toLocaleString()}
                                                </strong>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <MapPin size={15} />
                                                <span className="line-clamp-1">
                                                    {service.serviceArea || "Area not specified"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Tag size={15} />
                                                <span>
                                                    {service.serviceMode || "Service mode not specified"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <CalendarDays size={15} />
                                                <span>
                                                    Submitted: {formatDate(service.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {service.approvalStatus === "rejected" &&
                                            service.rejectionReason && (
                                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                                                    <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                                        Rejection Reason
                                                    </p>
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                                                        {service.rejectionReason}
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
