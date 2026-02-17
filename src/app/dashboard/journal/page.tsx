'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood: number;
    tags: string[];
    createdAt: string;
}

const moodEmoji: { [key: number]: string } = {
    1: '😢', 2: '😞', 3: '😔', 4: '😕', 5: '😐',
    6: '🙂', 7: '😊', 8: '😄', 9: '🤩', 10: '✨',
};

export default function JournalListPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/journal?page=${page}&limit=12`)
            .then((r) => r.json())
            .then((data) => {
                setEntries(data.entries || []);
                setTotal(data.total || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="page-container animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Journal</h1>
                    <p className="text-surface-200/50 mt-1">{total} entries total</p>
                </div>
                <Link href="/dashboard/journal/new" className="btn-primary">
                    + New Entry
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="text-5xl mb-4">✦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
                    <p className="text-surface-200/50 mb-6">Start journaling to build your story</p>
                    <Link href="/dashboard/journal/new" className="btn-primary">
                        Write Your First Entry
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entries.map((entry) => (
                            <Link
                                key={entry.id}
                                href={`/dashboard/journal/${entry.id}`}
                                className="glass-card-hover p-6 block group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-2xl">{moodEmoji[entry.mood] || '😐'}</span>
                                    <span className="text-xs text-surface-200/40">
                                        {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-brand-400 transition-colors line-clamp-1">
                                    {entry.title}
                                </h3>
                                <p className="text-xs text-surface-200/50 line-clamp-3 leading-relaxed">
                                    {entry.content}
                                </p>
                                {entry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {entry.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] px-2 py-0.5 bg-brand-500/10 text-brand-300/70 rounded-md"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {entry.tags.length > 3 && (
                                            <span className="text-[10px] text-surface-200/30">
                                                +{entry.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {total > 12 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-ghost text-sm disabled:opacity-30"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm text-surface-200/50 px-4">
                                Page {page} of {Math.ceil(total / 12)}
                            </span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= Math.ceil(total / 12)}
                                className="btn-ghost text-sm disabled:opacity-30"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
