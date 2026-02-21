import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
]);

const isAdminRoute = createRouteMatcher([
    '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    if (isAdminRoute(req)) {
        const { sessionClaims } = await auth();
        // The role should be set in the Clerk Dashboard -> User -> Public Metadata
        // e.g. { "role": "admin" }
        // Type assertion needed as Clerk doesn't know our custom metadata shape by default
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (role !== "admin") {
            // If they aren't an admin, redirect them out (e.g. to their dashboard)
            const dashboardUrl = new URL('/dashboard/inventory', req.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
