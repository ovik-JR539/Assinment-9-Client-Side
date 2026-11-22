
"use client";

import { useState } from "react";
import { Plus, Check, LoaderCircle } from "lucide-react";
import { getBackendToken } from "@/lib/getBackendToken";

export default function AddToMyListingsButton({ serviceId }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [message, setMessage] = useState("");

    async function handleAddList() {
        try {
            setLoading(true);
            setMessage("");

            const token = await getBackendToken();

            if (!token) {
                setMessage("Please sign in to save this service.");
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}/add-list`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (response.status === 409) {
                setAdded(true);
                setMessage("This service is already in your My Listings.");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Could not save this service."
                );
            }

            setAdded(true);
            setMessage("Service saved! You can view it in My Listings.");

        } catch (error) {
            setMessage(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleAddList}
                disabled={loading || added}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                    added
                        ? "bg-green-600 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                } disabled:opacity-80`}
            >
                {loading ? (
                    <LoaderCircle size={17} className="animate-spin" />
                ) : added ? (
                    <Check size={17} />
                ) : (
                    <Plus size={17} />
                )}

                {loading
                    ? "Saving..."
                    : added
                    ? "Saved"
                    : "Add List"}
            </button>

            {message && (
                <p
                    className={`mt-2 text-xs ${
                        added ? "text-green-600" : "text-red-500"
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
