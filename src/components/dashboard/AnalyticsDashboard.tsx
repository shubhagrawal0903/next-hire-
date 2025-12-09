'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Briefcase, Users, FileCheck, Loader2, ArrowUpRight } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard-actions';

// Standardized colors for the charts matching the theme (Blue, Purple, Emerald, Amber, Pink)
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

interface AnalyticsDashboardProps {
    companyId: string;
}

export default function AnalyticsDashboard({ companyId }: AnalyticsDashboardProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats(companyId);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchStats();
        }
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-red-500/10 p-4 rounded-lg text-red-600 dark:text-red-400 border border-red-500/20 text-center">
                {error || 'No data available'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Jobs"
                    value={stats.totalJobs}
                    icon={<Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    trend="Active Listings"
                    colorClass="text-blue-600 dark:text-blue-400"
                    bgClass="bg-blue-500/10"
                />
                <StatCard
                    title="Total Applicants"
                    value={stats.totalApps}
                    icon={<Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                    trend="All Time"
                    colorClass="text-purple-600 dark:text-purple-400"
                    bgClass="bg-purple-500/10"
                />
                <StatCard
                    title="ATS Processed"
                    value={stats.atsProcessed}
                    icon={<FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />}
                    trend="Resumes Scanned"
                    colorClass="text-green-600 dark:text-green-400"
                    bgClass="bg-green-500/10"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Applications per Job */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text-primary">
                            Applications per Job
                        </h3>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.appsByJob} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar
                                    dataKey="applications"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Application Status */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-lg font-bold text-text-primary mb-6">
                        Application Status
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.appsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="hsl(var(--card))"
                                    strokeWidth={3}
                                >
                                    {stats.appsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    className,
    trend,
    colorClass,
    bgClass
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    className?: string;
    trend: string;
    colorClass: string;
    bgClass: string;
}) {
    return (
        <div className={`p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgClass} ${colorClass}`}>
                            {trend}
                        </span>
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${bgClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
