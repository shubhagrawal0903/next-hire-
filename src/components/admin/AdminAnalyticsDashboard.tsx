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
import { Users, Building2, Briefcase, FileText, Loader2, TrendingUp } from 'lucide-react';
import { getAdminDashboardStats, type AdminDashboardStats } from '@/app/actions/admin-dashboard-actions';

// Theme-consistent Chart Colors
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function AdminAnalyticsDashboard() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getAdminDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin dashboard stats:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 bg-card rounded-xl border border-border">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-destructive/10 p-6 rounded-xl text-destructive border border-destructive/20 text-center">
                {error || 'No data available'}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    bgClass="bg-blue-500/10"
                    colorClass="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Total Companies"
                    value={stats.totalCompanies}
                    icon={<Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    bgClass="bg-purple-500/10"
                    colorClass="text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    title="Active Jobs"
                    value={stats.activeJobs}
                    icon={<Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />}
                    bgClass="bg-green-500/10"
                    colorClass="text-green-600 dark:text-green-400"
                />
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={<FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                    bgClass="bg-orange-500/10"
                    colorClass="text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Jobs per Industry */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text-primary">
                            Jobs by Industry
                        </h3>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.jobsByIndustry} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
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
                                    dataKey="jobs"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Application Status */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-lg font-bold text-text-primary mb-6">
                        Application Status Distribution
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
    bgClass,
    colorClass
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    bgClass: string;
    colorClass: string;
}) {
    return (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
                    <p className="text-3xl font-bold text-text-primary">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${bgClass}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-green-600 dark:text-green-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12% from last month</span>
            </div>
        </div>
    );
}
