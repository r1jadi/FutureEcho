'use client';

import { useEffect, useState } from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface TimeLockedMessage {
    id: string;
    content: string;
    unlockDate: string;
    isLocked: boolean;
    createdAt: string;
}

export default function TimeLockedPage() {
    const [messages, setMessages] = useState<TimeLockedMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = () => {
        setLoading(true);
        fetch('/api/time-locked')
            .then((r) => r.json())
            .then(setMessages)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/time-locked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    unlockDate: new Date(unlockDate).toISOString(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to create');
                return;
            }

            setContent('');
            setUnlockDate('');
            setShowForm(false);
            fetchMessages();
        } catch {
            setError('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this time capsule?')) return;
        try {
            await fetch(`/api/time-locked?id=${id}`, { method: 'DELETE' });
            setMessages((prev) => prev.filter((m) => m.id !== id));
        } catch {
            console.error('Delete failed');
        }
    };

    const locked = messages.filter((m) => m.isLocked);
    const unlocked = messages.filter((m) => !m.isLocked);

    return (
        <div className="page-container animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Time Capsule</h1>
                    <p className="text-surface-200/50 mt-1">Messages that unlock in the future</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : '+ New Capsule'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 space-y-5 animate-slide-up">
                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="label-text">Message to your future self</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="textarea-field min-h-[150px]"
                            placeholder="Write something meaningful. You won't be able to read this until the unlock date..."
                            required
                        />
                    </div>
                    <div>
                        <label className="label-text">Unlock Date</label>
                        <input
                            type="datetime-local"
                            value={unlockDate}
                            onChange={(e) => setUnlockDate(e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                            className="input-field"
                            required
                        />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Sealing...' : 'Seal Time Capsule ◆'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="text-5xl mb-4">◆</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No time capsules yet</h3>
                    <p className="text-surface-200/50 mb-6">Write a message to your future self</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        Create Your First Capsule
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Locked Messages */}
                    {locked.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-amber-400">🔒</span> Sealed ({locked.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {locked.map((msg) => (
                                    <div key={msg.id} className="glass-card p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl">🔒</span>
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="text-xs text-surface-200/30 hover:text-red-400 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <div className="text-center py-6">
                                                <p className="text-surface-200/40 text-sm italic mb-3">
                                                    This message is sealed
                                                </p>
                                                <p className="text-brand-400 font-medium text-sm">
                                                    Unlocks {formatDistanceToNow(new Date(msg.unlockDate), { addSuffix: true })}
                                                </p>
                                                <p className="text-surface-200/30 text-xs mt-1">
                                                    {format(new Date(msg.unlockDate), 'MMM d, yyyy · h:mm a')}
                                                </p>
                                            </div>
                                            <p className="text-xs text-surface-200/20 text-center">
                                                Created {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unlocked Messages */}
                    {unlocked.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-emerald-400">🔓</span> Unlocked ({unlocked.length})
                            </h2>
                            <div className="space-y-4">
                                {unlocked.map((msg) => (
                                    <div key={msg.id} className="glass-card p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="text-xs text-emerald-400 font-medium">
                                                    Unlocked on {format(new Date(msg.unlockDate), 'MMM d, yyyy')}
                                                </span>
                                                <span className="text-surface-200/20 mx-2">·</span>
                                                <span className="text-xs text-surface-200/30">
                                                    Written {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="text-xs text-surface-200/30 hover:text-red-400 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="text-surface-200/80 leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
