"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const selectedRole = localStorage.getItem('selectedRole');
    
    if (selectedRole) {
      // Clear the role from storage
      localStorage.removeItem('selectedRole');
      
      // Update user metadata with role
      if (user) {
        fetch('/api/user/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedRole })
        }).then(() => {
          // Redirect based on role
          if (selectedRole === 'client') {
            router.push('/add-company');
          } else {
            router.push('/'); // Jobs page
          }
        }).catch((error) => {
          console.error('Failed to update role:', error);
          router.push('/');
        });
      }
    } else {
      // No role selection, just go to home
      router.push('/');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-secondary">Setting up your account...</p>
      </div>
    </div>
  );
}
