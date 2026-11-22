
import { SignJWT } from "jose";
import { auth } from "@/lib/auth";
import { connection } from "next/server";

export async function GET(request) {
    // Force this handler to run at request time
    await connection();

    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return Response.json(
                { success: false, message: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const user = session.user;
        const userRole = user.role;

        if (!userRole) {
            return Response.json(
                { success: false, message: "User role is missing." },
                { status: 403 }
            );
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is missing");
        }

        const secretKey = new TextEncoder().encode(secret);

        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            role: userRole,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(secretKey);

        return Response.json(
            { success: true, token },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Backend token error:", error);

        return Response.json(
            {
                success: false,
                message: error.message || "Failed to generate authentication token",
            },
            { status: 500 }
        );
    }
}