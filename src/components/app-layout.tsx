'use client'
import Header from './header';
import { useThemeContext } from './context/theme-context';
import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { mounted } = useThemeContext();

  // Prevent hydration issues by showing a loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"></div>
        <div className="animate-pulse">
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}