'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoodSelector from '@/components/MoodSelector';
import TagInput from '@/components/TagInput';

export default function NewJournalEntryPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(5);
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, mood, tags }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to save entry');
                return;
            }

            router.push('/dashboard/journal');
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container animate-fade-in max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">New Entry</h1>
                <p className="text-surface-200/50 mt-1">What&apos;s on your mind?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="glass-card p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="label-text">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                            placeholder="Give your entry a title..."
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
                            placeholder="Write freely..."
                            required
                        />
                    </div>

                    <MoodSelector value={mood} onChange={setMood} />

                    <TagInput tags={tags} onChange={setTags} />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? 'Saving...' : 'Save Entry'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
