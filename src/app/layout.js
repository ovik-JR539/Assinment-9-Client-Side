
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "./globals.css";

import { auth } from "@/lib/auth";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Website SEO and favicon settings
export const metadata = {
    title: "FixMate | Home Repair Services",
    description:
        "Find trusted technicians and book professional home appliance repair services with FixMate.",

    icons: {
        icon: "/images/tab-logo2_.png",
        shortcut: "/images/tab-logo2_.png",
        apple: "/images/tab-logo2_.png",
    },
};

export default async function RootLayout({ children }) {
    const requestHeaders = await headers();

    const pathname =
        requestHeaders.get("x-fixmate-pathname") || "/";

    // Pages that visitors can access without logging in
    const publicPages = [
        "/",
        "/sign-in",
        "/sign-up",
    ];

    const profilePage = "/dashboard/profile";

    // Get the actual Better Auth session
    const session = await auth.api.getSession({
        headers: requestHeaders,
    });

    // Redirect logged-out users from protected pages
    if (!session?.user && !publicPages.includes(pathname)) {
        redirect("/sign-in");
    }

    // Check profile completion for logged-in users
    if (session?.user) {
        const user = session.user;

        const phone = user.phone?.trim() || "";
        const area = user.area?.trim() || "";
        const bio = user.bio?.trim() || "";

        const profileIncomplete =
            !phone || !area || !bio;

        // Allow incomplete users to access only their profile
        // and authentication pages.
        if (
            profileIncomplete &&
            pathname !== profilePage &&
            !publicPages.includes(pathname)
        ) {
            redirect("/dashboard/profile?complete=1");
        }

        // Also send incomplete users from the homepage
        // to profile completion after they log in.
        if (
            profileIncomplete &&
            pathname === "/"
        ) {
            redirect("/dashboard/profile?complete=1");
        }
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    <Suspense fallback={<div className="h-16" />}>
                        <Navbar />
                    </Suspense>

                    {children}

                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
