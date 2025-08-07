//Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);
function redirectToLogin(req: any, services?: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = '/';
  if (services) {
    url.searchParams.set('no-services', 'true');
  }
  return NextResponse.redirect(url);
}
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    return redirectToLogin(req);
  }

  // Check if user has permissions in their session
  const permissionChecks = req.auth.user.permissionChecks as any;

  // If no permissions are defined, allow access (fallback for development)
  if (!permissionChecks) {
    console.warn('No permission checks found for user');
    return NextResponse.next();
  }

  // Define route-permission mappings
  const routePermissions: Record<string, boolean | undefined> = {
    '/pos': permissionChecks?.mainNav?.pos,
    '/dashboard/guest-book': permissionChecks?.mainNav?.guestBook,
    '/dashboard/printer-settings': permissionChecks?.mainNav?.printerSettings,
    '/dashboard/table-layout': permissionChecks?.mainNav?.tableLayout,
    '/dashboard/report': permissionChecks?.mainNav?.report,
    '/dashboard/team': permissionChecks?.mainNav?.team,
    '/quick-sale': permissionChecks?.mainNav?.pos,
    '/dashboard/integrations': permissionChecks?.mainNav?.integrations,
    '/dashboard/inventory': permissionChecks?.mainNav?.inventory
  };

  // Check if the current path requires permission
  for (const [route, hasPermission] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      // If the route requires permission and user doesn't have it, redirect to dashboard
      if (hasPermission !== true) {
        console.log(
          `User lacks permission for ${route}, redirecting to dashboard`
        );
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      break;
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/pin', '/quick-sale/:path*']
};
