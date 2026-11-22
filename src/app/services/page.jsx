
import { Suspense } from "react";
import ServicesClient from "./ServicesClient";

async function ServicesContent({ searchParams }) {
    const params = await searchParams;

    let services = [];

    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/api/services`, {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        services = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Services page error:", error.message);
    }

    return (
        <ServicesClient
            services={services}
            initialSearch={params?.search || ""}
            initialArea={params?.area || ""}
            initialCategory={params?.category || ""}
        />
    );
}

function ServicesFallback() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="animate-pulse space-y-4">
                <div className="h-10 w-64 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
}

export default function ServicesPage({ searchParams }) {
    return (
        <Suspense fallback={<ServicesFallback />}>
            <ServicesContent searchParams={searchParams} />
        </Suspense>
    );
}
