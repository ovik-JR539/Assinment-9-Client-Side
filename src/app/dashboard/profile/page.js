
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";
import api from "@/lib/api";

import {
    X,
    Phone,
    MapPin,
    Mail,
    ShieldCheck,
    Save,
    Loader2,
    UploadCloud,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
    const { data: session, isPending } = authClient.useSession();

    const router = useRouter();
    const searchParams = useSearchParams();

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
        image: "",
        phone: "",
        area: "",
        bio: "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dragging, setDragging] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Show completion message when redirected by the server
    const completionRequired = searchParams.get("complete") === "1";

    // Load profile information
    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            setLoading(false);
            return;
        }

        let active = true;

        async function loadProfile() {
            try {
                const token = await getBackendToken();

                const response = await api.get("/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!active) return;

                const user = response.data.data;

                setProfile({
                    name: user.name || "",
                    email: user.email || "",
                    role: user.role || "customer",
                    image: user.image || "",
                    phone: user.phone || "",
                    area: user.area || "",
                    bio: user.bio || "",
                });
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [isPending, session?.user?.email]);

    // Clean up temporary image preview
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Select avatar
    function handleImage(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }

        setError("");
        setMessage("");

        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    // Remove selected avatar
    function removeImage() {
        setPreviewUrl("");
        setAvatarFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    // Upload avatar to ImgBB
    async function uploadAvatar() {
        if (!avatarFile) return profile.image;

        const formData = new FormData();
        formData.append("image", avatarFile);

        const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
            cache: "no-store",
        });

        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                "Image upload returned an invalid response."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Image upload failed."
            );
        }

        return result.imageUrl;
    }

    // Update form fields
    function handleChange(e) {
        const { name, value } = e.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setMessage("");
    }

    // Save profile information
    async function handleSubmit(e) {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!profile.name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!/^[0-9+\-\s()]{7,20}$/.test(profile.phone.trim())) {
            setError("Please enter a valid phone number.");
            return;
        }

        if (!profile.area.trim()) {
            setError("Please enter your location.");
            return;
        }

        // Bio is mandatory only during social-account completion
        // Bio is mandatory for every FixMate user
if (!profile.bio.trim()) {
    setError("Please write a short bio before continuing.");
    return;
}

        try {
            setSaving(true);

            const token = await getBackendToken();

            // Upload new image if selected
            let imageUrl = profile.image;

            if (avatarFile) {
                imageUrl = await uploadAvatar();
            }

            // Update profile in MongoDB
            const response = await api.patch(
                "/api/users/me",
                {
                    name: profile.name.trim(),
                    phone: profile.phone.trim(),
                    area: profile.area.trim(),
                    bio: profile.bio.trim(),
                    image: imageUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedUser = response.data.data;

            setProfile({
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                role: updatedUser.role || "customer",
                image: updatedUser.image || "",
                phone: updatedUser.phone || "",
                area: updatedUser.area || "",
                bio: updatedUser.bio || "",
            });

            setAvatarFile(null);
            setPreviewUrl("");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Unlock browsing after completing the required fields
            if (completionRequired) {
                router.replace("/dashboard");
                router.refresh();
                return;
            }

            setMessage("Profile updated successfully!");
        } catch (err) {
            console.error("Profile update error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    }

    // Loading
    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2
                    className="animate-spin text-[#D91B7E]"
                    size={30}
                />
            </div>
        );
    }

    // Not logged in
    if (!session?.user) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-bold">
                    Please sign in to view your profile.
                </h2>

                <Link
                    href="/sign-in"
                    className="rounded-lg bg-[#D91B7E] px-6 py-3 text-white"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8">

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Profile
                </h1>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your personal information and account details.
                </p>
            </div>

            {/* Mandatory Profile Completion Message */}
            {completionRequired && (
                <div className="mb-6 rounded-xl border border-pink-200 bg-pink-50 p-5 dark:border-pink-900 dark:bg-pink-950/30">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={24}
                            className="mt-1 shrink-0 text-[#D91B7E]"
                        />

                        <div>
                            <h2 className="text-lg font-bold text-[#D91B7E]">
                                Welcome to FixMate!
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                Before you can browse FixMate, please
                                complete your profile by providing
                                the following information:
                            </p>

                            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} />
                                    Phone number
                                    {profile.phone.trim() && (
                                        <CheckCircle
                                            size={16}
                                            className="text-green-600"
                                        />
                                    )}
                                </li>

                                <li className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    Your location
                                    {profile.area.trim() && (
                                        <CheckCircle
                                            size={16}
                                            className="text-green-600"
                                        />
                                    )}
                                </li>

                                <li className="flex items-center gap-2">
                                    <UserRoundIcon />
                                    A short bio about yourself
                                    {profile.bio.trim() && (
                                        <CheckCircle
                                            size={16}
                                            className="text-green-600"
                                        />
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1c2029]">

                {/* Profile Image Upload Box */}
                <div className="mb-8">
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Profile Picture
                    </label>

                    <div
                        onClick={() => fileInputRef.current?.click()}
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
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                            dragging
                                ? "border-[#D91B7E] bg-pink-50 dark:bg-pink-950/20"
                                : "border-gray-300 bg-gray-50 hover:border-[#D91B7E] hover:bg-pink-50 dark:border-gray-600 dark:bg-[#111318] dark:hover:bg-pink-950/10"
                        }`}
                    >
                        {previewUrl || profile.image ? (
                            <img
                                src={previewUrl || profile.image}
                                alt="Profile preview"
                                className="mb-4 h-28 w-28 rounded-xl border border-gray-200 object-cover shadow-sm dark:border-gray-600"
                            />
                        ) : (
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-pink-100 text-[#D91B7E] dark:bg-pink-950/40">
                                <ImageIcon size={38} />
                            </div>
                        )}

                        <p className="font-semibold text-gray-800 dark:text-white">
                            {previewUrl
                                ? "Image selected"
                                : "Choose a profile image"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop your image here, or{" "}
                            <span className="font-semibold text-[#D91B7E]">
                                browse files
                            </span>
                        </p>

                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm dark:bg-[#1c2029] dark:text-gray-300">
                            <UploadCloud size={17} />
                            Upload Image
                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                            JPG, JPEG, PNG or WEBP · Maximum 5 MB
                        </p>
                    </div>

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

                    {previewUrl && (
                        <button
                            type="button"
                            onClick={removeImage}
                            className="mt-3 flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600"
                        >
                            <X size={15} />
                            Cancel image change
                        </button>
                    )}
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-5 rounded-lg bg-green-100 p-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#D91B7E] dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Mail size={16} />
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={profile.email}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500 dark:border-gray-600 dark:bg-[#111318] dark:text-gray-400"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Email address cannot be changed here.
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Phone size={16} />
                            Phone Number
                            {completionRequired && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#D91B7E] dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <MapPin size={16} />
                            Area / Location
                            {completionRequired && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>

                        <input
                            type="text"
                            name="area"
                            value={profile.area}
                            onChange={handleChange}
                            placeholder="Enter your area"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#D91B7E] dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                        />
                    </div>

                    {/* About Me */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            About Me
                            {completionRequired && (
                                <span className="text-red-500"> *</span>
                            )}
                        </label>

                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Write something about yourself..."
                            required
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#D91B7E] dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                        />
                    </div>

                    {/* Account Role */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <ShieldCheck size={16} />
                            Account Type
                        </label>

                        <input
                            type="text"
                            value={profile.role}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 capitalize text-gray-500 dark:border-gray-600 dark:bg-[#111318] dark:text-gray-400"
                        />
                    </div>

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#D91B7E] px-7 py-3 font-semibold text-white transition hover:bg-[#b91668] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {completionRequired
                                    ? "Complete My Profile"
                                    : "Save Changes"}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Small icon component for the completion checklist
function UserRoundIcon() {
    return <ShieldCheck size={16} />;
}
