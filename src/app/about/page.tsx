"use client";

import Link from 'next/link';
import {
  Rocket,
  Target,
  Users,
  ShieldCheck,
  Zap,
  Briefcase,
  Search,
  ArrowRight,
  LineChart
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm font-medium text-text-secondary animate-in fade-in zoom-in duration-500 delay-150">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Revolutionizing Recruitment
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-text-primary to-text-secondary/60 pb-2">
            About Next Hire
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-text-secondary leading-relaxed">
            We're on a mission to simplify the hiring process. By bridging the gap between talent and opportunity, we're building the future of recruitment.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="bg-primary/10 p-4 rounded-xl">
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
      </section>

      {/* What We Do - Bento Grid */}
      <section className="py-16 px-4 bg-surface/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">What We Do</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg">
              A comprehensive platform designed for modern recruitment needs, tackling the challenges of today's job market head-on.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Job Seekers */}
            <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors group">
              <div className="mb-6 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary">For Job Seekers</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                We provide a clutter-free interface to browse jobs from verified companies.
                Our advanced tracking system lets you know exactly where you stand, ending the "black hole" of resume submissions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-text-secondary text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Verified Listings
                </li>
                <li className="flex items-center gap-2 text-text-secondary text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" /> Quick Apply
                </li>
              </ul>
            </div>

            {/* Card 2: Admins */}
            <div className="col-span-1 bg-gradient-to-br from-card to-surface border border-border rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="mb-6 bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-text-primary">Admin Integrity</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Our dedicated admin team works tirelessly to verify every company and listing, ensuring a safe and scam-free environment.
                </p>
              </div>
            </div>

            {/* Card 3: Analytics (Visual Filler) */}
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

            {/* Card 4: Companies */}
            <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors group">
              <div className="mb-6 bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary">For Companies</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Post jobs, manage applicants, and schedule interviews all in one dashboard.
                Our tools are designed to filter noise and help you identify top talent faster than ever before.
              </p>
              <div className="flex gap-3">
                <span className="text-xs px-2 py-1 bg-surface rounded-md border border-border text-text-secondary">ATS Integration</span>
                <span className="text-xs px-2 py-1 bg-surface rounded-md border border-border text-text-secondary">Instant Posting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
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
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 -skew-y-3 z-0 transform origin-left scale-110" />

        <div className="container mx-auto relative z-10 text-center space-y-8">
          <h2 className="text-4xl font-bold text-text-primary">Ready to get started?</h2>
          <p className="text-xl text-text-secondary max-w-xl mx-auto">
            Join thousands of users who have already upgraded their career journey with Next Hire.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/search" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2">
              Find a Job <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/post-job" className="px-8 py-4 bg-surface text-text-primary font-bold rounded-full border border-border hover:bg-surface/80 transition-transform hover:-translate-y-1 shadow-md">
              Post a Job
            </Link>
          </div>
        </div>
      </section>
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
  )
}
