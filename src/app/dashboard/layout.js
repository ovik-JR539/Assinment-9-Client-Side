
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }) {
    const requestHeaders = await headers();

    const session = await auth.api.getSession({
        headers: requestHeaders,
    });

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <div className="dashboard-layout min-h-screen bg-slate-50">
            <div className="flex min-h-screen items-stretch">
                <DashboardSidebar />

                <main className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
