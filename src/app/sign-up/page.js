
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { toast, Toaster } from "sonner";

import {
    Eye,
    EyeOff,
    Wrench,
    UserRound,
    ShieldCheck,
    Upload,
    X,
    MapPin,
    Phone,
    ImagePlus,
    Loader2,
} from "lucide-react";

export default function SignUp() {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("customer");

    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState("");
    const [dragging, setDragging] = useState(false);

    const isBusy = loading || Boolean(socialLoading);

    // Handle avatar selection
    function handleImage(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    // Remove avatar
    function removeImage() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setAvatarFile(null);
        setPreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    // Upload avatar
    async function uploadAvatar() {
        if (!avatarFile) return "";

        const formData = new FormData();
        formData.append("image", avatarFile);

        const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
            cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Image upload failed.");
        }

        return result.imageUrl;
    }

    // Google and GitHub signup
    async function handleSocialSignUp(provider) {
        try {
            setSocialLoading(provider);

            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: "/",
            });

            if (error) {
                toast.error(
                    error.message || `Unable to register with ${provider}.`
                );

                setSocialLoading("");
            }
        } catch (error) {
            console.error(`${provider} signup error:`, error);

            toast.error(
                error.message || "Social registration failed."
            );

            setSocialLoading("");
        }
    }

    // Email signup
    async function handleSignUp(e) {
        e.preventDefault();

        if (isBusy) return;

        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword ||
            !phone.trim() ||
            !area.trim()
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must contain at least 6 characters.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            toast.error("Password must contain an uppercase letter.");
            return;
        }

        if (!/[a-z]/.test(password)) {
            toast.error("Password must contain a lowercase letter.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        try {
            setLoading(true);

            let imageUrl = "";

            if (avatarFile) {
                toast.info("Uploading your avatar...");
                imageUrl = await uploadAvatar();
            }

            const { error } = await authClient.signUp.email({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                phone: phone.trim(),
                area: area.trim(),
                ...(imageUrl ? { image: imageUrl } : {}),
            });

            if (error) {
                toast.error(error.message || "Registration failed.");
                return;
            }

            toast.success("Account created successfully!");

            window.location.assign("/dashboard");

        } catch (error) {
            console.error("Registration error:", error);

            toast.error(
                error.message || "Something went wrong. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">

            <Toaster position="top-right" richColors />

            <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-7 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-9">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                        <Wrench size={28} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Create Account
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Join FixMate and get started today.
                    </p>
                </div>

                {/* Social Signup */}
                <div className="space-y-3">

                    <button
                        type="button"
                        onClick={() => handleSocialSignUp("google")}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                        {socialLoading === "google" ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <span className="font-bold text-lg text-blue-600">G</span>
                        )}

                        {socialLoading === "google"
                            ? "Connecting to Google..."
                            : "Continue with Google"}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSocialSignUp("github")}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                        {socialLoading === "github" ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <span className="text-xl">●</span>
                        )}

                        {socialLoading === "github"
                            ? "Connecting to GitHub..."
                            : "Continue with GitHub"}
                    </button>

                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />

                    <span className="text-xs font-medium uppercase text-slate-400">
                        Or sign up with email
                    </span>

                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">

                    {/* Avatar */}
                    <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Profile Picture
                            <span className="ml-2 font-normal text-slate-400">
                                (Optional)
                            </span>
                        </label>

                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragging(false);
                                handleImage(e.dataTransfer.files[0]);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
                                dragging
                                    ? "border-teal-600 bg-teal-50 dark:bg-teal-500/10"
                                    : "border-slate-300 hover:border-teal-500 dark:border-slate-600"
                            }`}
                        >
                            {previewUrl ? (
                                <div className="relative">
                                    <img
                                        src={previewUrl}
                                        alt="Avatar preview"
                                        className="h-24 w-24 rounded-full border-4 border-teal-100 object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 rounded-full bg-teal-50 p-4 text-teal-700">
                                        <ImagePlus size={30} />
                                    </div>

                                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                                        Drag and drop your image
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Or click to browse your computer
                                    </p>
                                </>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    handleImage(e.target.files[0]);
                                    e.target.value = "";
                                }}
                            />
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                            Maximum image size: 5 MB.
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Full Name *
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                            disabled={isBusy}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Email Address *
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            autoComplete="email"
                            required
                            disabled={isBusy}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <Phone size={16} />
                            Phone Number *
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            autoComplete="tel"
                            required
                            disabled={isBusy}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <MapPin size={16} />
                            Living Location *
                        </label>

                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="Enter your city or area"
                            autoComplete="address-level2"
                            required
                            disabled={isBusy}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Password *
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                disabled={isBusy}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Minimum 6 characters, including uppercase and lowercase letters.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Confirm Password *
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                                disabled={isBusy}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Select Account Type *
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setRole("customer")}
                                className={`rounded-xl border p-4 text-center ${
                                    role === "customer"
                                        ? "border-teal-600 bg-teal-50 text-teal-800"
                                        : "border-slate-200 text-slate-600"
                                }`}
                            >
                                <UserRound className="mx-auto mb-2" size={25} />
                                <span className="text-sm font-semibold">Customer</span>
                            </button>

                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setRole("technician")}
                                className={`rounded-xl border p-4 text-center ${
                                    role === "technician"
                                        ? "border-teal-600 bg-teal-50 text-teal-800"
                                        : "border-slate-200 text-slate-600"
                                }`}
                            >
                                <Wrench className="mx-auto mb-2" size={25} />
                                <span className="text-sm font-semibold">Technician</span>
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                    >
                        <Upload size={18} />
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Sign In */}
                <p className="mt-7 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="font-semibold text-teal-700 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

                {/* Security */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={15} />
                    Your account information is protected.
                </div>

            </div>
        </main>
    );
}
