'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import MoodSelector from '@/components/MoodSelector';
import TagInput from '@/components/TagInput';

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const moodEmoji: { [key: number]: string } = {
    1: '😢', 2: '😞', 3: '😔', 4: '😕', 5: '😐',
    6: '🙂', 7: '😊', 8: '😄', 9: '🤩', 10: '✨',
};

export default function JournalDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(5);
    const [tags, setTags] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch(`/api/journal/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setEntry(data);
                setTitle(data.title);
                setContent(data.content);
                setMood(data.mood);
                setTags(data.tags || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/journal/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, mood, tags }),
            });

            if (res.ok) {
                const updated = await res.json();
                setEntry(updated);
                setEditing(false);
            }
        } catch {
            console.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        setDeleting(true);

        try {
            await fetch(`/api/journal/${id}`, { method: 'DELETE' });
            router.push('/dashboard/journal');
            router.refresh();
        } catch {
            console.error('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="page-container text-center">
                <p className="text-surface-200/50">Entry not found</p>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in max-w-3xl">
            <button
                onClick={() => router.back()}
                className="btn-ghost text-sm mb-6 -ml-2"
            >
                ← Back
            </button>

            {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div>
                            <label htmlFor="title" className="label-text">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="label-text">Content</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="textarea-field min-h-[250px]"
                                required
                            />
                        </div>
                        <MoodSelector value={mood} onChange={setMood} />
                        <TagInput tags={tags} onChange={setTags} />
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="glass-card p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">{entry.title}</h1>
                                <p className="text-sm text-surface-200/40">
                                    {format(new Date(entry.createdAt), 'MMMM d, yyyy · h:mm a')}
                                </p>
                            </div>
                            <span className="text-3xl">{moodEmoji[entry.mood] || '😐'}</span>
                        </div>

                        <div className="text-surface-200/80 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                        </div>

                        {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/[0.06]">
                                {entry.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-3 py-1 bg-brand-500/10 text-brand-300 rounded-lg"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setEditing(true)} className="btn-secondary">
                            Edit
                        </button>
                        <button onClick={handleDelete} disabled={deleting} className="btn-danger">
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
