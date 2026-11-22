
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { toast, Toaster } from "sonner";

import {
    Eye,
    EyeOff,
    Wrench,
    ShieldCheck,
    Loader2,
} from "lucide-react";

export default function SignIn() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState("");

    // Email and password login
    async function handleSignIn(e) {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter your email and password");
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await authClient.signIn.email({
                email: email.trim().toLowerCase(),
                password,
                rememberMe: true,
            });

            if (error) {
                toast.error(error.message || "Invalid email or password");
                return;
            }

            toast.success("Welcome back to FixMate!");

            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Google and GitHub login
   async function handleSocialSignIn(provider) {
    try {
        setSocialLoading(provider);

        const { error } = await authClient.signIn.social({
            provider,
            callbackURL: "/",
        });

        if (error) {
            toast.error(
                error.message || `Unable to sign in with ${provider}.`
            );

            setSocialLoading("");
        }
    } catch (error) {
        console.error(`${provider} login error:`, error);

        toast.error(
            error.message || "Unable to sign in. Please try again."
        );

        setSocialLoading("");
    }
}

    const isBusy = loading || Boolean(socialLoading);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">

            <Toaster position="top-right" richColors />

            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-7 shadow-xl sm:p-9">

                {/* Heading */}
                <div className="mb-8 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Wrench size={28} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Sign in to continue to FixMate.
                    </p>

                </div>

                {/* Social Login */}
                <div className="space-y-3">

                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => handleSocialSignIn("google")}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {socialLoading === "google" ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <svg
                                viewBox="0 0 48 48"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#EA4335"
                                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                                    transform="translate(0 3)"
                                />
                                <path
                                    fill="#4285F4"
                                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.63 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z"
                                    transform="translate(0 3)"
                                />
                                <path
                                    fill="#34A853"
                                    d="M24 48c6.48 0 11.93-2.13 15.91-5.89l-7.63-5.91c-2.12 1.42-4.84 2.27-8.28 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                                    transform="translate(0 -3)"
                                />
                            </svg>
                        )}

                        {socialLoading === "google"
                            ? "Connecting to Google..."
                            : "Continue with Google"}
                    </button>

                    {/* GitHub */}
                    <button
                        type="button"
                        onClick={() => handleSocialSignIn("github")}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {socialLoading === "github" ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
                            </svg>
                        )}

                        {socialLoading === "github"
                            ? "Connecting to GitHub..."
                            : "Continue with GitHub"}
                    </button>

                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />

                    <span className="text-xs font-medium uppercase text-slate-400">
                        Or continue with email
                    </span>

                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Email and Password Form */}
                <form onSubmit={handleSignIn} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            autoComplete="email"
                            required
                            disabled={isBusy}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                disabled={isBusy}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-slate-600">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="accent-teal-700"
                            />
                            Remember me
                        </label>

                        <span className="text-slate-400">
                            Forgot password?
                        </span>
                    </div>

                    {/* Sign In */}
                    <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full rounded-xl bg-teal-700 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                {/* Sign Up */}
                <p className="mt-7 text-center text-sm text-slate-500">
                    Don't have an account?{" "}

                    <Link
                        href="/sign-up"
                        className="font-semibold text-teal-700 hover:underline"
                    >
                        Create Account
                    </Link>
                </p>

                {/* Security */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={15} />
                    Secure authentication with Better Auth.
                </div>

            </div>
        </main>
    );
}
