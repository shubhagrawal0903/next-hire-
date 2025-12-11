'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Once user data is loaded, check authorization
    if (isLoaded) {
      const role = user?.publicMetadata?.role as string | undefined;
      
      // If user is not a company (COMPANY_ERP or client), redirect to homepage
      if (role !== 'COMPANY_ERP' && role !== 'client') {
        redirect('/');
      }
    }
  }, [isLoaded, user]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  // Check role again before rendering (defense in depth)
  const role = user?.publicMetadata?.role as string | undefined;
  if (role !== 'COMPANY_ERP' && role !== 'client') {
    return null; // Will redirect via useEffect
  }

  // Render children only if user is a COMPANY_ERP
  return <>{children}</>;
}
