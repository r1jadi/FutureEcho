'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface DashboardData {
    moodData: Array<{ date: string; mood: number }>;
    entryFrequency: Array<{ date: string; count: number }>;
    goals: Array<{ id: string; title: string; status: string; targetDate: string | null; createdAt: string }>;
    goalStats: { total: number; completed: number; inProgress: number; abandoned: number };
    stats: { totalEntries: number; totalChats: number; avgMood: number; streak: number };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statCards = [
        { label: 'Journal Entries', value: data.stats.totalEntries, icon: '✦', color: 'from-purple-500/20 to-purple-600/20' },
        { label: 'Chat Sessions', value: data.stats.totalChats, icon: '◎', color: 'from-brand-500/20 to-brand-600/20' },
        { label: 'Avg Mood', value: `${data.stats.avgMood}/10`, icon: '☀', color: 'from-amber-500/20 to-amber-600/20' },
        { label: 'Day Streak', value: data.stats.streak, icon: '🔥', color: 'from-orange-500/20 to-orange-600/20' },
    ];

    return (
        <div className="page-container animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-surface-200/50 mt-1">Your growth at a glance</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.label} className="glass-card p-6">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-4`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-surface-200/50 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Mood Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Mood Over Time</h3>
                    {data.moodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.moodData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.2)"
                                    fontSize={12}
                                    tickFormatter={(v) => v.slice(5)}
                                />
                                <YAxis
                                    domain={[1, 10]}
                                    stroke="rgba(255,255,255,0.2)"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(20,21,37,0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="mood"
                                    stroke="#5c7cfa"
                                    strokeWidth={2}
                                    dot={{ fill: '#5c7cfa', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-surface-200/30 text-sm">
                            Start journaling to see your mood trends
                        </div>
                    )}
                </div>

                {/* Entry Frequency */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Entry Frequency</h3>
                    {data.entryFrequency.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.entryFrequency}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.2)"
                                    fontSize={12}
                                    tickFormatter={(v) => v.slice(5)}
                                />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(20,21,37,0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Bar dataKey="count" fill="#4c6ef5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-surface-200/30 text-sm">
                            Start journaling to see your writing frequency
                        </div>
                    )}
                </div>
            </div>

            {/* Goals Section */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Goals</h3>
                    <Link href="/dashboard/goals" className="btn-ghost text-sm">
                        View All →
                    </Link>
                </div>
                {data.goals.length > 0 ? (
                    <div className="space-y-3">
                        {data.goals.slice(0, 5).map((goal) => (
                            <div
                                key={goal.id}
                                className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${goal.status === 'COMPLETED'
                                                ? 'bg-emerald-400'
                                                : goal.status === 'IN_PROGRESS'
                                                    ? 'bg-brand-400'
                                                    : 'bg-surface-200/30'
                                            }`}
                                    />
                                    <span className="text-sm text-white">{goal.title}</span>
                                </div>
                                <span
                                    className={`text-xs font-medium px-2.5 py-1 rounded-lg ${goal.status === 'COMPLETED'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : goal.status === 'IN_PROGRESS'
                                                ? 'bg-brand-500/10 text-brand-400'
                                                : 'bg-surface-200/10 text-surface-200/50'
                                        }`}
                                >
                                    {goal.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-surface-200/30 text-sm">
                        <Link href="/dashboard/goals" className="text-brand-400 hover:text-brand-300 transition-colors">
                            Set your first goal →
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard/journal/new" className="glass-card-hover p-6 block">
                    <div className="text-2xl mb-3">✦</div>
                    <div className="font-medium text-white text-sm">New Journal Entry</div>
                    <div className="text-xs text-surface-200/40 mt-1">Write about your day</div>
                </Link>
                <Link href="/dashboard/chat" className="glass-card-hover p-6 block">
                    <div className="text-2xl mb-3">◎</div>
                    <div className="font-medium text-white text-sm">Chat with Future Self</div>
                    <div className="text-xs text-surface-200/40 mt-1">Get a new perspective</div>
                </Link>
                <Link href="/dashboard/time-locked" className="glass-card-hover p-6 block">
                    <div className="text-2xl mb-3">◆</div>
                    <div className="font-medium text-white text-sm">Create Time Capsule</div>
                    <div className="text-xs text-surface-200/40 mt-1">Message your future self</div>
                </Link>
            </div>
        </div>
    );
}
