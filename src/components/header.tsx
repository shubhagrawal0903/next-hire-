"use client"

import { User, ChevronDown, Settings, LogOut, Menu, X } from 'lucide-react'

import { ModeToggle } from './mode-toggle'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    useUser,
    useClerk,
} from "@clerk/nextjs";

export default function Header() {

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const { user, isSignedIn, isLoaded } = useUser();
    const { signOut } = useClerk();

    // Get user role from public metadata
    const role = user?.publicMetadata?.role as string | undefined;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    return (
        <header className="h-16 px-4 lg:px-6 bg-header border-b border-border flex justify-between items-center relative">
            {/* Logo */}
            <Link href={'/'} className="flex items-center gap-3 shrink-0">
                <img
                    src="/logo.jpg"
                    alt="Next Hire"
                    className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="text-2xl font-bold text-text-primary">Next-Hire</span>
            </Link>
            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
                {/* Show based on role and auth status */}
                {isLoaded && (
                    <>
                        {/* Admin Link - visible only to ADMIN users and prioritized for discoverability */}
                        {isSignedIn && role === 'ADMIN' && (
                            <Link href="/admin" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                Admin Panel
                            </Link>
                        )}

                        {/* Job Seeker Links */}
                        {isSignedIn && role === 'JOB_SEEKER' && (
                            <>
                                <Link href="/" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    Jobs
                                </Link>
                                <Link href="/my-applications" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    My Applications
                                </Link>
                            </>
                        )}

                        {/* User role Links */}
                        {isSignedIn && role === 'user' && (
                            <>
                                <Link href="/" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    Jobs
                                </Link>
                                <Link href="/my-applications" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    My Applications
                                </Link>
                            </>
                        )}

                        {/* Company Rep Links */}
                        {isSignedIn && (role === 'COMPANY_ERP' || role === 'client') && (
                            <>
                                <Link href="/dashboard" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    Dashboard
                                </Link>
                                <Link href="/post-job" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    Post Job
                                </Link>
                                <Link href="/my-jobs" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    My Jobs
                                </Link>
                            </>
                        )}

                        {/* Show for users without role or new users - treat as Job Seeker */}
                        {isSignedIn && !role && (
                            <>
                                <Link href="/" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    Jobs
                                </Link>
                                <Link href="/my-applications" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                                    My Applications
                                </Link>
                            </>
                        )}
                    </>
                )}

            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-4">
                {/* Always show About */}
                <Link href="/about" className="text-nav-link hover:text-nav-link-hover font-medium transition-nh">
                    About
                </Link>

                <SignedOut>
                    <div className="flex items-center gap-2">
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary font-medium transition-nh">
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="nh-button-primary px-4 py-2 text-sm font-medium rounded-lg transition-nh shadow-sm hover:shadow-md">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </div>
                </SignedOut>

                <SignedIn>
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 ${showUserDropdown
                                    ? 'bg-primary/10 border-primary/20 shadow-sm ring-2 ring-primary/10'
                                    : 'bg-surface border-border hover:bg-surface-hover hover:border-border-hover'
                                }`}
                        >
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border border-border"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className="hidden lg:block text-left mr-1">
                                <p className="text-xs font-semibold text-text-primary leading-none">
                                    {user?.firstName || 'User'}
                                </p>
                                <p className="text-[10px] text-text-muted leading-tight truncate max-w-[80px]">
                                    {role === 'ADMIN' ? 'Admin' : role === 'COMPANY_ERP' ? 'Company' : 'User'}
                                </p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${showUserDropdown ? 'rotate-180 text-primary' : ''
                                    }`}
                            />
                        </button>

                        {showUserDropdown && (
                            <div className="absolute top-full right-0 mt-3 w-72 bg-card/95 backdrop-blur-sm border border-border/80 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                {/* Dropdown Header */}
                                <div className="p-5 bg-surface/50 border-b border-border text-center">
                                    {user?.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-card shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-card">
                                            <User className="w-8 h-8 text-primary" />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg text-text-primary">
                                        {user?.fullName || user?.username || 'User'}
                                    </h3>
                                    <p className="text-sm text-text-secondary truncate px-4">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                    <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {role === 'ADMIN' ? 'Administrator' : role === 'COMPANY_ERP' ? 'Company Account' : 'User'}
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            router.push('/profile');
                                            setShowUserDropdown(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-primary/5 hover:text-primary rounded-lg transition-colors group"
                                    >
                                        <div className="p-2 bg-surface rounded-md group-hover:bg-background border border-border group-hover:border-primary/30 transition-colors">
                                            <Settings className="w-4 h-4 text-text-secondary group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm block">Manage Account</span>
                                            <span className="text-xs text-text-muted group-hover:text-primary/70">Personal settings & security</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            signOut();
                                            setShowUserDropdown(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-destructive hover:bg-destructive/5 rounded-lg transition-colors group"
                                    >
                                        <div className="p-2 bg-surface rounded-md group-hover:bg-background border border-border group-hover:border-destructive/30 transition-colors">
                                            <LogOut className="w-4 h-4 text-text-secondary group-hover:text-destructive" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm block">Sign Out</span>
                                            <span className="text-xs text-text-muted group-hover:text-destructive/70">Log out of your account</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </SignedIn>

                <ModeToggle />
            </div>

            {/* Mobile Right Section */}
            <div className="md:hidden flex items-center gap-2">
                <ModeToggle />
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 text-text-secondary hover:text-text-primary transition-nh"
                    aria-label="Toggle mobile menu"
                >
                    {showMobileMenu ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div
                    ref={mobileMenuRef}
                    className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-nh md:hidden z-40"
                >
                    <div className="px-4 py-4 space-y-4">
                        {/* Navigation Links */}
                        <nav className="space-y-2">
                            {/* Show based on role and auth status */}
                            {isLoaded && (
                                <>
                                    {/* Admin Link - visible only to ADMIN users and prioritized */}
                                    {isSignedIn && role === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                    )}

                                    {/* Job Seeker Links */}
                                    {isSignedIn && role === 'JOB_SEEKER' && (
                                        <>
                                            <Link
                                                href="/"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                Jobs
                                            </Link>
                                            <Link
                                                href="/my-applications"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                My Applications
                                            </Link>
                                        </>
                                    )}

                                    {/* User role Links */}
                                    {isSignedIn && role === 'user' && (
                                        <>
                                            <Link
                                                href="/"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                Jobs
                                            </Link>
                                            <Link
                                                href="/my-applications"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                My Applications
                                            </Link>
                                        </>
                                    )}

                                    {/* Company Rep Links */}
                                    {isSignedIn && (role === 'COMPANY_ERP' || role === 'client') && (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/post-job"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                Post Job
                                            </Link>
                                            <Link
                                                href="/my-jobs"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                My Jobs
                                            </Link>
                                        </>
                                    )}

                                    {/* Show for users without role - treat as Job Seeker */}
                                    {isSignedIn && !role && (
                                        <>
                                            <Link
                                                href="/"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                Jobs
                                            </Link>
                                            <Link
                                                href="/my-applications"
                                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                                onClick={() => setShowMobileMenu(false)}
                                            >
                                                My Applications
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* About Section */}
                        <div className="px-3 py-2 border-t border-border">
                            <Link
                                href="/about"
                                className="block px-3 py-2 text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                About
                            </Link>
                        </div>

                        {/* Auth Section */}
                        <div className="px-3 pt-4 border-t border-border">
                            <SignedOut>
                                <div className="space-y-2">
                                    <SignInButton mode="modal">
                                        <button
                                            className="w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-nh text-left"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button
                                            className="w-full nh-button-primary px-4 py-2 text-sm rounded-lg transition-nh shadow-sm hover:shadow-md"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Sign Up
                                        </button>
                                    </SignUpButton>
                                </div>
                            </SignedOut>

                            <SignedIn>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {user?.imageUrl ? (
                                            <img
                                                src={user.imageUrl}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-text-primary text-sm">
                                                {user?.firstName || user?.username || 'User'}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {user?.primaryEmailAddress?.emailAddress}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            router.push('/profile');
                                            setShowMobileMenu(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-left text-text-primary hover:bg-surface/80 rounded-md transition-nh"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm">Manage account</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            signOut();
                                            setShowMobileMenu(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-left text-error hover:bg-error/10 rounded-md transition-nh"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Sign out</span>
                                    </button>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}