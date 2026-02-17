'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
    const [input, setInput] = useState('');

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
            onChange([...tags, trimmed]);
        }
        setInput('');
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((t) => t !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        }
        if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div>
            <span className="label-text">Tags</span>
            <div className="input-field flex flex-wrap gap-2 min-h-[48px] items-center">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-500/15 text-brand-300 text-xs font-medium rounded-lg border border-brand-500/20"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors ml-0.5"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => input && addTag(input)}
                    placeholder={tags.length === 0 ? 'Add tags (press Enter)' : ''}
                    className="flex-1 min-w-[100px] bg-transparent text-white text-sm focus:outline-none placeholder:text-surface-200/30"
                />
            </div>
        </div>
    );
}
