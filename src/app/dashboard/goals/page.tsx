'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Goal {
    id: string;
    title: string;
    description: string | null;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    targetDate: string | null;
    createdAt: string;
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = () => {
        setLoading(true);
        fetch('/api/goals')
            .then((r) => r.json())
            .then(setGoals)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                    targetDate: targetDate ? new Date(targetDate).toISOString() : null,
                }),
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                setTargetDate('');
                setShowForm(false);
                fetchGoals();
            }
        } catch {
            console.error('Create failed');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (goalId: string, status: string) => {
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;

        try {
            await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: goal.title,
                    description: goal.description,
                    status,
                    targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
                }),
            });
            fetchGoals();
        } catch {
            console.error('Update failed');
        }
    };

    const handleDelete = async (goalId: string) => {
        if (!confirm('Delete this goal?')) return;
        try {
            await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
        } catch {
            console.error('Delete failed');
        }
    };

    const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS');
    const completed = goals.filter((g) => g.status === 'COMPLETED');
    const abandoned = goals.filter((g) => g.status === 'ABANDONED');

    const statusColors: Record<string, string> = {
        IN_PROGRESS: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
        COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        ABANDONED: 'bg-surface-200/10 text-surface-200/50 border-white/10',
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Goals</h1>
                    <p className="text-surface-200/50 mt-1">
                        {completed.length} of {goals.length} completed
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {/* Progress bar */}
            {goals.length > 0 && (
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Overall Progress</span>
                        <span className="text-sm text-brand-400">
                            {goals.length > 0 ? Math.round((completed.length / goals.length) * 100) : 0}%
                        </span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                            style={{
                                width: `${goals.length > 0 ? (completed.length / goals.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-xs text-surface-200/40">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-400" />
                            {inProgress.length} In Progress
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {completed.length} Completed
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-surface-200/30" />
                            {abandoned.length} Abandoned
                        </span>
                    </div>
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 space-y-5 animate-slide-up">
                    <div>
                        <label className="label-text">Goal Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                            placeholder="What do you want to achieve?"
                            required
                        />
                    </div>
                    <div>
                        <label className="label-text">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="textarea-field min-h-[100px]"
                            placeholder="Add more details..."
                        />
                    </div>
                    <div>
                        <label className="label-text">Target Date (optional)</label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Creating...' : 'Create Goal'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            ) : goals.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="text-5xl mb-4">▲</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No goals yet</h3>
                    <p className="text-surface-200/50 mb-6">Set goals to track your growth</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        Set Your First Goal
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map((goal) => (
                        <div key={goal.id} className="glass-card p-5 flex items-start gap-4 group">
                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        goal.id,
                                        goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                                    )
                                }
                                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${goal.status === 'COMPLETED'
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-white/20 hover:border-brand-400'
                                    }`}
                            >
                                {goal.status === 'COMPLETED' && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-medium text-sm ${goal.status === 'COMPLETED' ? 'text-surface-200/40 line-through' : 'text-white'}`}>
                                    {goal.title}
                                </h3>
                                {goal.description && (
                                    <p className="text-xs text-surface-200/40 mt-1 line-clamp-2">
                                        {goal.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${statusColors[goal.status]}`}>
                                        {goal.status.replace('_', ' ')}
                                    </span>
                                    {goal.targetDate && (
                                        <span className="text-[10px] text-surface-200/30">
                                            Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {goal.status !== 'ABANDONED' && (
                                    <button
                                        onClick={() => handleStatusChange(goal.id, 'ABANDONED')}
                                        className="text-xs text-surface-200/30 hover:text-amber-400 px-2 py-1 rounded transition-colors"
                                    >
                                        Abandon
                                    </button>
                                )}
                                {goal.status === 'ABANDONED' && (
                                    <button
                                        onClick={() => handleStatusChange(goal.id, 'IN_PROGRESS')}
                                        className="text-xs text-surface-200/30 hover:text-brand-400 px-2 py-1 rounded transition-colors"
                                    >
                                        Resume
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    className="text-xs text-surface-200/30 hover:text-red-400 px-2 py-1 rounded transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
