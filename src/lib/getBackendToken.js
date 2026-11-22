export async function getBackendToken() {
    const response = await fetch("/api/backend-token", {
        method: "GET",
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to get authentication token");
    }

    return data.token;
}