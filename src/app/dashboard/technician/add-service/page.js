
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

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

export default function AddServicePage() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        basePrice: "",
        estimatedDuration: "",
        serviceMode: "",
        serviceArea: "",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Check technician authentication
    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.push("/sign-in");
            return;
        }

        if (session.user.role !== "technician") {
            router.push("/dashboard");
        }
    }, [session, isPending, router]);

    // Clean up image preview
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Handle input changes
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    }

    // Handle image selection
    function handleImageChange(event) {
        const selectedFile = event.target.files?.[0];

        setMessage("");
        setMessageType("");

        if (!selectedFile) {
            setImage(null);
            setPreview("");
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setMessage("Please select a valid image file.");
            setMessageType("error");
            event.target.value = "";
            setImage(null);
            setPreview("");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5 MB.");
            setMessageType("error");
            event.target.value = "";
            setImage(null);
            setPreview("");
            return;
        }

        setImage(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }

    // Upload image to ImgBB
    async function uploadImage(token) {
        const imageData = new FormData();

        imageData.append("image", image);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/services/upload-image`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: imageData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Image upload failed");
        }

        return result.imageUrl;
    }

    // Submit service
    async function handleSubmit(event) {
        event.preventDefault();

        if (!image) {
            setMessage("Please select a service image.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            // First upload the image
            const imageUrl = await uploadImage(token);

            // Then save service information
            const serviceData = {
                ...formData,
                image: imageUrl,
                basePrice: Number(formData.basePrice),
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(serviceData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Service submission failed");
            }

            setMessage("Service added successfully!");
            setMessageType("success");

            setFormData({
                title: "",
                category: "",
                description: "",
                basePrice: "",
                estimatedDuration: "",
                serviceMode: "",
                serviceArea: "",
            });

            setImage(null);
            setPreview("");

            event.target.reset();

        } catch (error) {
            setMessage(error.message || "Something went wrong.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    if (isPending || !session || session.user.role !== "technician") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg font-semibold">
                    Checking technician account...
                </p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-10">

            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/dashboard/technician")}
                        className="mb-5 font-semibold text-teal-700 hover:text-teal-900"
                    >
                        ← Back to Technician Dashboard
                    </button>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Add New Service
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Add your repair service to FixMate and make it available to customers.
                    </p>
                </div>

                {/* Technician Information */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="mb-4 text-lg font-bold text-slate-900">
                        Technician Information
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Technician Name
                            </label>

                            <input
                                type="text"
                                value={session.user.name || ""}
                                readOnly
                                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Technician Email
                            </label>

                            <input
                                type="email"
                                value={session.user.email || ""}
                                readOnly
                                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-600"
                            />
                        </div>

                    </div>
                </div>

                {/* Service Form */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
                >

                    <h2 className="mb-6 text-xl font-bold text-slate-900">
                        Service Information
                    </h2>

                    {/* Service Title */}
                    <div className="mb-5">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Example: Professional AC Repair Service"
                            required
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-5">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Category
                        </label>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                        >
                            <option value="">Select Category</option>

                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your repair service..."
                            rows={5}
                            minLength={20}
                            maxLength={2000}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                        />
                    </div>

                    {/* Price and Duration */}
                    <div className="mb-5 grid gap-5 sm:grid-cols-2">

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Base Price ($)
                            </label>

                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleChange}
                                placeholder="35"
                                min="0.01"
                                step="0.01"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Estimated Duration
                            </label>

                            <input
                                type="text"
                                name="estimatedDuration"
                                value={formData.estimatedDuration}
                                onChange={handleChange}
                                placeholder="Example: 2-3 hours"
                                required
                                maxLength={50}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                            />
                        </div>

                    </div>

                    {/* Service Mode */}
                    <div className="mb-5">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Mode
                        </label>

                        <select
                            name="serviceMode"
                            value={formData.serviceMode}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                        >
                            <option value="">Select Service Mode</option>
                            <option value="Home Visit">Home Visit</option>
                            <option value="Shop Drop-off">Shop Drop-off</option>
                        </select>
                    </div>

                    {/* Service Area */}
                    <div className="mb-5">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Area
                        </label>

                        <input
                            type="text"
                            name="serviceArea"
                            value={formData.serviceArea}
                            onChange={handleChange}
                            placeholder="Example: Dhaka"
                            required
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-600"
                        />
                    </div>

                    {/* Service Image */}
                    <div className="mb-6">
                        <label className="mb-2 block font-semibold text-slate-700">
                            Service Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required={!image}
                            className="w-full rounded-lg border border-slate-300 p-3"
                        />

                        <p className="mt-2 text-sm text-slate-500">
                            JPG, PNG or other image format. Maximum 5 MB.
                        </p>

                        {preview && (
                            <img
                                src={preview}
                                alt="Service preview"
                                className="mt-4 h-52 w-full rounded-xl object-cover"
                            />
                        )}
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={`mb-5 rounded-lg p-4 font-medium ${
                                messageType === "success"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-teal-700 px-6 py-4 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Uploading Image and Adding Service..."
                            : "Add Service"}
                    </button>

                </form>

            </div>
        </main>
    );
}
