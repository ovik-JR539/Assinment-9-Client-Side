
import { NextResponse } from "next/server";

export function proxy(request) {
    const { pathname } = request.nextUrl;

    // Pages accessible without login
    const publicPages = [
        "/",
        "/sign-in",
        "/sign-up",
    ];

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-fixmate-pathname", pathname);

    // Allow public pages
    if (publicPages.includes(pathname)) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Check Better Auth session cookie
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    // Redirect logged-out visitors
    if (!sessionCookie) {
        return NextResponse.redirect(
            new URL("/sign-in", request.url)
        );
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
    ],
};
