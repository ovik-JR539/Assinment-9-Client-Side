
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    RefreshCw,
    ClipboardList,
    Trash2,
    MapPin,
    Clock,
    DollarSign,
    Wrench,
    LoaderCircle,
    AlertCircle,
}    from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyListingsPage() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    // Fetch technician listings
    async function fetchMyListings() {
        try {
            setLoading(true);
            setError("");

            const token = await getBackendToken();

            if (!token) {
                setError("Please sign in to view your listings.");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/services/my-listings`,
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
                    result.message || "Failed to load your listings."
                );
            }

            setListings(
                result.data || result.listings || []
            );
        } catch (err) {
            console.error("My Listings Error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    // Remove listing
    async function handleRemoveListing(listingId) {
        const confirmed = window.confirm(
            "Are you sure you want to remove this service from My Listings?"
        );

        if (!confirmed) return;

        try {
            setRemovingId(listingId);

            const token = await getBackendToken();

            const response = await fetch(
                `${API_URL}/api/services/my-listings/${listingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to remove listing."
                );
            }

            setListings((previousListings) =>
                previousListings.filter(
                    (listing) =>
                        listing._id !== listingId &&
                        listing.id !== listingId
                )
            );
        } catch (err) {
            console.error("Remove Listing Error:", err);
            alert(err.message || "Could not remove listing.");
        } finally {
            setRemovingId(null);
        }
    }

    useEffect(() => {
        if (!isPending && session) {
            fetchMyListings();
        }

        if (!isPending && !session) {
            setLoading(false);
        }
    }, [isPending, session]);

    if (isPending || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-teal-600" size={36} />
                    <p className="text-slate-500">
                        Loading your listings...
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full">
                    <AlertCircle className="mx-auto text-orange-500 mb-4" size={40} />

                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Login Required
                    </h2>

                    <p className="text-slate-500 mb-5">
                        Please sign in to access your listings.
                    </p>

                    <button
                        onClick={() => router.push("/sign-in")}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        My Listings
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Manage the services you`ve added to your listings.
                    </p>
                </div>

                <button
                    onClick={fetchMyListings}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Something went wrong</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Listing Count */}
            {!error && (
                <div className="mb-6 flex items-center gap-2 text-slate-600">
                    <ClipboardList size={18} className="text-teal-600" />
                    <span className="font-medium">
                        {listings.length} {listings.length === 1 ? "Listing" : "Listings"}
                    </span>
                </div>
            )}

            {/* Empty State */}
            {!error && listings.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 md:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                        <ClipboardList size={30} className="text-teal-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        No Listings Yet
                    </h2>

                    <p className="text-slate-500 max-w-md mx-auto">
                        You haven`t added any services to your listings yet.
                        Visit a service details page and click the Add List button
                        to add one here.
                    </p>

                    <button
                        onClick={() => router.push("/services")}
                        className="mt-6 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
                    >
                        Explore Services
                    </button>
                </div>
            )}

            {/* Listings Grid */}
            {listings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <div
                            key={listing._id || listing.id}
                            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition"
                        >
                            {/* Image */}
                            <div className="h-52 bg-slate-100 relative">
                                {listing.image ? (
                                    <img
                                        src={listing.image}
                                        alt={listing.title || "Repair service"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Wrench size={45} className="text-slate-300" />
                                    </div>
                                )}

                                {listing.category && (
                                    <span className="absolute top-3 left-3 bg-white/95 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        {listing.category}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                                    {listing.title || "Repair Service"}
                                </h2>

                                <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">
                                    {listing.description || "Professional repair service."}
                                </p>

                                {/* Price */}
                                <div className="flex items-center gap-2 mt-4 text-teal-700 font-bold">
                                    <DollarSign size={18} />
                                    <span>
                                        {listing.basePrice ?? "N/A"}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 mt-4 text-sm text-slate-500">
                                    {listing.estimatedDuration && (
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span>{listing.estimatedDuration}</span>
                                        </div>
                                    )}

                                    {listing.serviceArea && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span className="line-clamp-1">
                                                {listing.serviceArea}
                                            </span>
                                        </div>
                                    )}

                                    {listing.serviceMode && (
                                        <div className="flex items-center gap-2">
                                            <Wrench size={16} />
                                            <span>{listing.serviceMode}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() =>
                                        handleRemoveListing(
                                            listing._id || listing.id
                                        )
                                    }
                                    disabled={
                                        removingId === (listing._id || listing.id)
                                    }
                                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    {removingId === (listing._id || listing.id) ? (
                                        <LoaderCircle size={17} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={17} />
                                    )}

                                    <span className="font-semibold text-sm">
                                        {removingId === (listing._id || listing.id)
                                            ? "Removing..."
                                            : "Remove from Listings"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
