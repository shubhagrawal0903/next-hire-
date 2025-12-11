"use client";

import { Building2, User, CheckCircle2, ArrowRight } from "lucide-react";
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

    const handleRoleSelection = async (role: "user" | "client") => {
        setSelectedRole(role);
        setIsSubmitting(true);

        try {
            // Store role in localStorage to set after sign up
            localStorage.setItem('selectedRole', role);
            
            // Redirect to sign up
            router.push('/sign-up');
        } catch (error) {
            console.error("Error setting role:", error);
            alert(`Failed to set role: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden bg-background min-h-screen">
            {/* Orb Background */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
                <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={280}
                    forceHoverState={false}
                />
            </div>

            <div className="container relative mx-auto px-4 py-16 md:py-24 max-w-screen-2xl">
                {/* Main Hero */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary">
                            Find your <span className="text-text-primary">dream job</span>
                            <br />
                            with confidence
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            Connect with top companies and uncover opportunities that match your skills and aspirations.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 mt-8">
                        {/* Job Seeker Card */}
                        <button
                            onClick={() => handleRoleSelection("user")}
                            disabled={isSubmitting}
                            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                                selectedRole === "user"
                                    ? "border-primary bg-primary/5 shadow-xl scale-105"
                                    : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {selectedRole === "user" && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-7 h-7 text-primary" />
                                </div>
                                <ArrowRight className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>

                            <h3 className="text-2xl font-bold text-text-primary mb-2">I'm Looking for a Job</h3>
                            <p className="text-text-secondary mb-6">
                                Browse thousands of opportunities and find your perfect match
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Instant job applications</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>AI-powered recommendations</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Track application status</span>
                                </div>
                            </div>
                        </button>

                        {/* Company Card */}
                        <button
                            onClick={() => handleRoleSelection("client")}
                            disabled={isSubmitting}
                            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                                selectedRole === "client"
                                    ? "border-primary bg-primary/5 shadow-xl scale-105"
                                    : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {selectedRole === "client" && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Building2 className="w-7 h-7 text-primary" />
                                </div>
                                <ArrowRight className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>

                            <h3 className="text-2xl font-bold text-text-primary mb-2">I'm Hiring Talent</h3>
                            <p className="text-text-secondary mb-6">
                                Post jobs and connect with qualified candidates instantly
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Unlimited job postings</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Applicant tracking system</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>Company profile page</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {isSubmitting && (
                        <div className="text-center mt-4">
                            <div className="inline-flex items-center gap-3 text-text-secondary">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span>Setting up your account...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
