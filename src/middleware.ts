import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/about',
  '/search(.*)',
  '/company(.*)',
  '/profile(.*)',
  '/api/companies(.*)',
  '/api/jobs(.*)',
  '/api/jobs/recommendations'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};