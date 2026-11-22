
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Wrench,
    Send,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
    UploadCloud,
    ImagePlus,
    X,
    Trash2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = [
    "Smartphone",
    "Laptop & PC",
    "AC",
    "Refrigerator",
    "TV",
    "Washing Machine",
    "Electrical",
    "Other",
];

export default function ApplyServicePage() {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const { data: session, isPending } = authClient.useSession();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        image: "",
        basePrice: "",
        estimatedDuration: "",
        serviceMode: "",
        serviceArea: "",
    });

    const [preview, setPreview] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // Authentication and role check
    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.replace("/sign-in");
            return;
        }

        if (session.user.role !== "technician") {
            router.replace("/dashboard");
        }
    }, [session, isPending, router]);

    // Form input changes
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // Upload image to ImgBB
    async function uploadImage(file) {
        if (!file) return;

        setMessage("");
        setSuccess(false);

        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5 MB.");
            return;
        }

        const localPreview = URL.createObjectURL(file);

        setPreview((previous) => {
            if (previous.startsWith("blob:")) {
                URL.revokeObjectURL(previous);
            }

            return localPreview;
        });

        setFormData((previous) => ({
            ...previous,
            image: "",
        }));

        try {
            setUploadingImage(true);

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found. Please sign in again.");
            }

            const uploadData = new FormData();

            uploadData.append("image", file);

            const response = await fetch(
                `${API_URL}/api/services/upload-image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Image upload failed."
                );
            }

            if (!result.imageUrl) {
                throw new Error("Image URL was not returned by the server.");
            }

            setFormData((previous) => ({
                ...previous,
                image: result.imageUrl,
            }));

        } catch (error) {
            setMessage(error.message || "Unable to upload image.");

            setPreview((previous) => {
                if (previous.startsWith("blob:")) {
                    URL.revokeObjectURL(previous);
                }

                return "";
            });

        } finally {
            setUploadingImage(false);
        }
    }

    // File input selection
    function handleFileChange(event) {
        const file = event.target.files?.[0];

        if (file) {
            uploadImage(file);
        }

        event.target.value = "";
    }

    // Drag and drop handlers
    function handleDragOver(event) {
        event.preventDefault();
        setDragging(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDragging(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
            uploadImage(file);
        }
    }

    // Remove selected image
    function removeImage() {
        if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setPreview("");

        setFormData((previous) => ({
            ...previous,
            image: "",
        }));

        setMessage("");
    }

    // Submit service application
    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setSuccess(false);

        if (uploadingImage) {
            setMessage("Please wait until your image upload finishes.");
            return;
        }

        if (!formData.image) {
            setMessage("Please upload a service image first.");
            return;
        }

        if (
            !formData.title.trim() ||
            !formData.category ||
            !formData.description.trim() ||
            !formData.basePrice ||
            !formData.estimatedDuration.trim() ||
            !formData.serviceMode ||
            !formData.serviceArea.trim()
        ) {
            setMessage("Please fill in all fields.");
            return;
        }

        const price = Number(formData.basePrice);

        if (!Number.isFinite(price) || price <= 0) {
            setMessage("Please enter a valid service price.");
            return;
        }

        try {
            setLoading(true);

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found. Please sign in again.");
            }

            const response = await fetch(`${API_URL}/api/services`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    basePrice: price,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to submit your service."
                );
            }

            setSuccess(true);

            setMessage(
                "Your service has been submitted successfully and is waiting for admin approval."
            );

            if (preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }

            setPreview("");

            setFormData({
                title: "",
                category: "",
                description: "",
                image: "",
                basePrice: "",
                estimatedDuration: "",
                serviceMode: "",
                serviceArea: "",
            });

        } catch (error) {
            setMessage(error.message || "Something went wrong.");

        } finally {
            setLoading(false);
        }
    }

    if (isPending || !session?.user || session.user.role !== "technician") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle className="h-9 w-9 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-4xl">

            {/* Page Heading */}
            <div className="mb-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                    <Wrench size={25} />
                </div>

                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                    Technician Workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    Apply for a Service
                </h1>

                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Submit your repair service for admin review.
                    Customers can see it after approval.
                </p>
            </div>

            {/* Feedback Message */}
            {message && (
                <div
                    className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                        success
                            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    }`}
                >
                    {success ? (
                        <CheckCircle size={20} className="mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    )}

                    <p>{message}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8"
            >

                {/* Service Title */}
                <div>
                    <label
                        htmlFor="title"
                        className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                    >
                        Service Title
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Example: Professional AC Repair"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                    />
                </div>

                {/* Category and Price */}
                <div className="grid gap-6 sm:grid-cols-2">

                    <div>
                        <label
                            htmlFor="category"
                            className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Service Category
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        >
                            <option value="">Select a category</option>

                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="basePrice"
                            className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Base Price ($)
                        </label>

                        <input
                            id="basePrice"
                            name="basePrice"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.basePrice}
                            onChange={handleChange}
                            placeholder="Enter your price"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        />
                    </div>

                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="description"
                        className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                    >
                        Service Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your repair service and what customers can expect..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                    />
                </div>

                {/* Drag and Drop Image Upload */}
                <div>
                    <label className="mb-2 block font-semibold text-slate-700 dark:text-slate-200">
                        Service Image
                    </label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {!preview ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                                dragging
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                                    : "border-slate-300 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                            }`}
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                                <UploadCloud size={32} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Drag and drop your image here
                            </h3>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Or click to browse your computer
                            </p>

                            <span className="mt-4 rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white">
                                Choose Image
                            </span>

                            <p className="mt-4 text-xs text-slate-400">
                                JPG, PNG, GIF or WebP · Maximum 5 MB
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">

                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Service preview"
                                    className="h-72 w-full object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={uploadingImage || loading}
                                    className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                    <ImagePlus className="text-orange-600" size={20} />

                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {uploadingImage
                                            ? "Uploading to ImgBB..."
                                            : formData.image
                                                ? "Image uploaded successfully"
                                                : "Image selected"}
                                    </span>
                                </div>

                                {uploadingImage ? (
                                    <LoaderCircle
                                        className="animate-spin text-orange-600"
                                        size={20}
                                    />
                                ) : formData.image ? (
                                    <CheckCircle
                                        className="text-green-600"
                                        size={20}
                                    />
                                ) : null}
                            </div>

                            {!uploadingImage && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-t border-slate-200 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    Change Image
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Duration and Service Mode */}
                <div className="grid gap-6 sm:grid-cols-2">

                    <div>
                        <label
                            htmlFor="estimatedDuration"
                            className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Estimated Duration
                        </label>

                        <input
                            id="estimatedDuration"
                            name="estimatedDuration"
                            type="text"
                            value={formData.estimatedDuration}
                            onChange={handleChange}
                            placeholder="Example: 1-2 hours"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="serviceMode"
                            className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Service Mode
                        </label>

                        <select
                            id="serviceMode"
                            name="serviceMode"
                            value={formData.serviceMode}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        >
                            <option value="">Select service mode</option>
                            <option value="Home Visit">Home Visit</option>
                            <option value="Shop Drop-off">Shop Drop-off</option>
                        </select>
                    </div>

                </div>

                {/* Service Area */}
                <div>
                    <label
                        htmlFor="serviceArea"
                        className="mb-2 block font-semibold text-slate-700 dark:text-slate-200"
                    >
                        Service Area
                    </label>

                    <input
                        id="serviceArea"
                        name="serviceArea"
                        type="text"
                        value={formData.serviceArea}
                        onChange={handleChange}
                        placeholder="Example: Dhaka, Gulshan"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                    />
                </div>

                {/* Approval Notice */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
                    <p className="font-semibold text-orange-800 dark:text-orange-300">
                        Admin Approval Required
                    </p>

                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                        Your service will remain pending until an admin
                        reviews and approves it.
                    </p>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <LoaderCircle size={19} className="animate-spin" />
                            Submitting Service...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Submit Service for Approval
                        </>
                    )}
                </button>

            </form>
        </main>
    );
}
