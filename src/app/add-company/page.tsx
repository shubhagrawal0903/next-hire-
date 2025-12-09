'use client';

import AddCompanyForm from '@/components/AddCompanyForm';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AddCompanyPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  // Check if user has existing company
  useEffect(() => {
    async function checkExistingCompany() {
      if (!isSignedIn || !user?.id) {
        setCheckingCompany(false);
        return;
      }

      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const companies = await response.json();
          
          if (companies && companies.length > 0) {
            // User already has a company, redirect to dashboard
            setHasCompany(true);
            router.push('/dashboard');
          } else {
            setHasCompany(false);
          }
        }
      } catch (error) {
        console.error('Error checking existing company:', error);
      } finally {
        setCheckingCompany(false);
      }
    }

    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        checkExistingCompany();
      }
    }
  }, [isLoaded, isSignedIn, user?.id, router]);

  // Show loading state
  if (!isLoaded || checkingCompany) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  // If user has company, don't render form (will redirect)
  if (hasCompany) {
    return null;
  }

  // Render the form for users without a company
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Add a New Company</h1>
      <AddCompanyForm />
    </main>
  );
}