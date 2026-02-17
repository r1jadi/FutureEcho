'use client';

import { useState } from 'react';

interface MoodSelectorProps {
    value: number;
    onChange: (mood: number) => void;
}

const moodLabels: { [key: number]: { emoji: string; label: string; color: string } } = {
    1: { emoji: '😢', label: 'Terrible', color: 'text-red-400' },
    2: { emoji: '😞', label: 'Bad', color: 'text-red-300' },
    3: { emoji: '😔', label: 'Down', color: 'text-orange-400' },
    4: { emoji: '😕', label: 'Meh', color: 'text-orange-300' },
    5: { emoji: '😐', label: 'Okay', color: 'text-yellow-400' },
    6: { emoji: '🙂', label: 'Fine', color: 'text-yellow-300' },
    7: { emoji: '😊', label: 'Good', color: 'text-green-300' },
    8: { emoji: '😄', label: 'Great', color: 'text-green-400' },
    9: { emoji: '🤩', label: 'Amazing', color: 'text-emerald-400' },
    10: { emoji: '✨', label: 'Perfect', color: 'text-emerald-300' },
};

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
    const [hovering, setHovering] = useState<number | null>(null);
    const display = hovering ?? value;
    const mood = moodLabels[display];

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="label-text mb-0">How are you feeling?</span>
                <span className={`text-sm font-medium ${mood.color}`}>
                    {mood.emoji} {mood.label}
                </span>
            </div>
            <div className="flex gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                    <button
                        key={level}
                        type="button"
                        onMouseEnter={() => setHovering(level)}
                        onMouseLeave={() => setHovering(null)}
                        onClick={() => onChange(level)}
                        className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all duration-200 ${level <= display
                                ? 'bg-gradient-to-t from-brand-600 to-brand-400 text-white shadow-sm shadow-brand-500/20'
                                : 'bg-white/[0.04] text-surface-200/30 hover:bg-white/[0.08]'
                            }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
    );
}
