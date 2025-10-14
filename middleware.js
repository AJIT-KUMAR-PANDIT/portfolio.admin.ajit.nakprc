import { NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@/utils/env';

export async function middleware(request) {
  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  const account = new Account(client);

  const adminPath = '/admin';
  const loginPath = '/';

  // Check if the request is for an admin path
  if (request.nextUrl.pathname.startsWith(adminPath)) {
    try {
      // Attempt to get the current session
      await account.get();
      // If successful, user is authenticated, proceed to the admin page
      return NextResponse.next();
    } catch (error) {
      // If there's an error (no session), redirect to the login page
      console.log('Authentication failed:', error.message);
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      return NextResponse.redirect(url);
    }
  }

  // If not an admin path, or if it's the login page, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/'], // Apply middleware to /admin and / paths
};