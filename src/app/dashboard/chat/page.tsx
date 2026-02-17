'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
    id?: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt?: string;
}

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    _count?: { messages: number };
}

export default function ChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load sessions
    useEffect(() => {
        fetch('/api/chat/sessions')
            .then((r) => r.json())
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoadingSessions(false));
    }, []);

    // Load session messages when selecting a session
    useEffect(() => {
        if (!activeSessionId) return;
        fetch(`/api/chat/sessions/${activeSessionId}`)
            .then((r) => r.json())
            .then((data) => setMessages(data.messages || []))
            .catch(console.error);
    }, [activeSessionId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText]);

    const handleSend = async () => {
        if (!input.trim() || streaming) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'USER', content: userMessage }]);
        setStreaming(true);
        setStreamingText('');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: activeSessionId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setMessages((prev) => [
                    ...prev,
                    { role: 'ASSISTANT', content: data.error || 'Failed to get response' },
                ]);
                setStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.text) {
                                fullText += data.text;
                                setStreamingText(fullText);
                            }

                            if (data.sessionId && !activeSessionId) {
                                setActiveSessionId(data.sessionId);
                                // Refresh sessions list
                                fetch('/api/chat/sessions')
                                    .then((r) => r.json())
                                    .then(setSessions)
                                    .catch(console.error);
                            }

                            if (data.done) {
                                setMessages((prev) => [
                                    ...prev,
                                    { role: 'ASSISTANT', content: fullText },
                                ]);
                                setStreamingText('');
                            }
                        } catch {
                            // Skip malformed chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'ASSISTANT', content: 'Something went wrong. Please try again.' },
            ]);
        } finally {
            setStreaming(false);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await fetch(`/api/chat/sessions?id=${sessionId}`, { method: 'DELETE' });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
        } catch {
            console.error('Delete failed');
        }
    };

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className="w-72 border-r border-white/[0.06] bg-surface-950/50 flex flex-col">
                <div className="p-4 border-b border-white/[0.06]">
                    <button onClick={handleNewChat} className="btn-primary w-full text-sm">
                        + New Conversation
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loadingSessions ? (
                        <div className="flex justify-center py-8">
                            <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-surface-200/30 text-xs py-8">No conversations yet</p>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeSessionId === session.id
                                        ? 'bg-brand-500/10 border border-brand-500/20'
                                        : 'hover:bg-white/[0.04] border border-transparent'
                                    }`}
                                onClick={() => setActiveSessionId(session.id)}
                            >
                                <span className="text-xs">◎</span>
                                <span className="flex-1 text-xs text-surface-200 truncate">{session.title}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-surface-200/30 hover:text-red-400 text-xs transition-all"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {messages.length === 0 && !streamingText ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md animate-fade-in">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/10 flex items-center justify-center text-4xl mx-auto mb-6">
                                ◎
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-3">Talk to Your Future Self</h2>
                            <p className="text-surface-200/50 text-sm leading-relaxed mb-8">
                                Start a conversation with the version of you that exists 5 years from now.
                                They remember your journal entries, understand your patterns, and offer
                                the perspective that comes from growth.
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-left">
                                {[
                                    'How will I feel about this decision in 5 years?',
                                    'What should I focus on right now?',
                                    'Am I making progress toward my goals?',
                                    'What do I wish I knew sooner?',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="p-3 bg-white/[0.03] rounded-xl text-xs text-surface-200/60 hover:bg-white/[0.06] hover:text-surface-200 transition-all text-left leading-relaxed"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[70%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'USER'
                                            ? 'bg-brand-600 text-white rounded-br-md'
                                            : 'glass-card text-surface-200/90 rounded-bl-md'
                                        }`}
                                >
                                    {msg.role === 'ASSISTANT' && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                                            <span className="text-xs text-brand-400">◎ Future You</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {streamingText && (
                            <div className="flex justify-start">
                                <div className="max-w-[70%] px-5 py-3.5 rounded-2xl rounded-bl-md glass-card text-surface-200/90 text-sm leading-relaxed">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                                        <span className="text-xs text-brand-400">◎ Future You</span>
                                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                                    </div>
                                    <div className="whitespace-pre-wrap">{streamingText}</div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="max-w-3xl mx-auto flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Talk to your future self..."
                            className="input-field flex-1"
                            disabled={streaming}
                        />
                        <button
                            onClick={handleSend}
                            disabled={streaming || !input.trim()}
                            className="btn-primary px-6"
                        >
                            {streaming ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
