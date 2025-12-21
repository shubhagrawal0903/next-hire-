"use client";

import { Building2, User, CheckCircle2, ArrowRight, Target, Briefcase, ShieldCheck, Rocket, Users, LineChart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const Orb = dynamic(() => import("@/components/Orb"), { ssr: false });

export function LandingHeroSection() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedRole, setSelectedRole] = useState<"user" | "client" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            router.push(`/?search=${encodeURIComponent(searchValue.trim())}`);
        } else {
            router.push("/");
        }
    };

    const handleRoleSelection = (role: "user" | "client") => {
        try {
            // Store role in localStorage to set after sign up
            localStorage.setItem('selectedRole', role);
            
            // For users (job seekers), directly go to jobs page with browse param
            // They'll be prompted to sign in when they try to apply
            if (role === 'user') {
                window.location.href = '/?browse=true';
            } else {
                // For clients (companies), show company onboarding choice page
                setSelectedRole(role);
                setIsSubmitting(true);
                router.push('/company-onboarding');
            }
        } catch (error) {
            console.error("Error setting role:", error);
            alert(`Failed to set role: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background">
            {/* Hero Section - Full Screen */}
            <div className="relative overflow-hidden min-h-screen flex items-center py-16 sm:py-20">
                {/* Orb Background */}
                <div className="absolute inset-0 pointer-events-none opacity-60">
                    <Orb
                        hoverIntensity={0.5}
                        rotateOnHover={true}
                        hue={280}
                        forceHoverState={false}
                    />
                </div>

                <div className="container relative mx-auto px-4 sm:px-6 max-w-screen-2xl">
                {/* Main Hero */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-tight px-2">
                            Find your <span className="text-text-primary">dream job</span>
                            <br />
                            with confidence
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed px-4">
                            Connect with top companies and uncover opportunities that match your skills and aspirations.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="w-full max-w-5xl grid md:grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-4">
                        {/* Job Seeker Card */}
                        <button
                            onClick={() => handleRoleSelection("user")}
                            disabled={isSubmitting}
                            className={`group relative p-5 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left ${
                                selectedRole === "user"
                                    ? "border-primary bg-primary/5 shadow-xl scale-105"
                                    : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                {selectedRole === "user" ? (
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">I'm Looking for a Job</h3>
                            <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                                Browse thousands of opportunities and find your perfect match
                            </p>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>Instant job applications</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>AI-powered recommendations</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>Track application status</span>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 pt-3 border-t border-border">
                                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                                    <span>Get Started</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>

                        {/* Company Card */}
                        <button
                            onClick={() => handleRoleSelection("client")}
                            disabled={isSubmitting}
                            className={`group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left ${
                                selectedRole === "client"
                                    ? "border-primary bg-primary/5 shadow-xl scale-105"
                                    : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                {selectedRole === "client" ? (
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">I'm Hiring Talent</h3>
                            <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                                Post jobs and connect with qualified candidates instantly
                            </p>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>Unlimited job postings</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>Applicant tracking system</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span>Company profile page</span>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 pt-3 border-t border-border">
                                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                                    <span>Get Started</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {isSubmitting && (
                        <div className="text-center mt-4">
                            <div className="inline-flex items-center gap-3 text-text-secondary text-sm">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span>Setting up your account...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* About Section Below Hero - Separate Full Width Section */}
            <div className="bg-background py-20 px-4">
                <div className="container mx-auto max-w-screen-2xl">
                    {/* Mission Section */}
                    <div className="max-w-5xl mx-auto mb-20">
                        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="bg-primary/10 p-4 rounded-xl shrink-0">
                                    <Target className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-text-primary">Our Mission</h2>
                                    <p className="text-lg text-text-secondary leading-relaxed">
                                        To create a seamless, transparent, and efficient ecosystem for job seekers and employers.
                                        We believe that finding a job should be exciting, not exhausting, and hiring should be about connection, not just collection.
                                        We aim to empower every individual to find work that matters and every company to build teams that thrive.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What We Do - Bento Grid */}
                    <div className="mb-20">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">What We Do</h2>
                            <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                                A comprehensive platform designed for modern recruitment needs
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {/* Card 1: Job Seekers */}
                            <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors group">
                                <div className="mb-6 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-text-primary">For Job Seekers</h3>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    We provide a clutter-free interface to browse jobs from verified companies.
                                    Our advanced tracking system lets you know exactly where you stand.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-text-secondary text-sm">
                                        <ShieldCheck className="w-4 h-4 text-green-500" /> Verified Listings
                                    </li>
                                    <li className="flex items-center gap-2 text-text-secondary text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-primary" /> Quick Apply
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2: Analytics */}
                            <div className="col-span-1 bg-card border border-border rounded-2xl p-8 flex flex-col justify-center items-center text-center hover:bg-surface transition-colors">
                                <div className="mb-4 bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center relative">
                                    <LineChart className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <div className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-text-primary">Data-Driven</h3>
                                <p className="text-text-secondary text-sm">
                                    Real-time insights for better hiring decisions.
                                </p>
                            </div>

                            {/* Card 3: Admins */}
                            <div className="col-span-1 bg-linear-to-br from-card to-surface border border-border rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="mb-6 bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-text-primary">Admin Integrity</h3>
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                        Our dedicated admin team ensures a safe and verified environment.
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Companies */}
                            <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors group">
                                <div className="mb-6 bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                    <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-text-primary">For Companies</h3>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    Post jobs, manage applicants, and schedule interviews all in one dashboard.
                                    Our tools help you identify top talent faster.
                                </p>
                                <div className="flex gap-3">
                                    <span className="text-xs px-2 py-1 bg-surface rounded-md border border-border text-text-secondary">ATS Integration</span>
                                    <span className="text-xs px-2 py-1 bg-surface rounded-md border border-border text-text-secondary">Instant Posting</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-text-primary mb-12">Our Core Values</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ValueCard
                                icon={<Rocket className="w-6 h-6" />}
                                title="Innovation"
                                desc="Pushing boundaries to solve old problems in new ways."
                            />
                            <ValueCard
                                icon={<Users className="w-6 h-6" />}
                                title="Inclusivity"
                                desc="Creating equitable opportunities for everyone, everywhere."
                            />
                            <ValueCard
                                icon={<ShieldCheck className="w-6 h-6" />}
                                title="Trust"
                                desc="Building a safe platform through transparency and verification."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center p-6 rounded-xl hover:bg-surface/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary leading-relaxed">{desc}</p>
        </div>
    );
}
