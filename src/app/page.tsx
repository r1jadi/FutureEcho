import Link from 'next/link';
import NextImage from 'next/image';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-brand-700/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <NextImage
                            src="/logo.png"
                            alt="Future Echo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Future Echo</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="btn-ghost">
                        Sign in
                    </Link>
                    <Link href="/register" className="btn-primary">
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
                <div className="text-center max-w-3xl mx-auto animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
                        AI-Powered Journaling
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                        Talk to your{' '}
                        <span className="gradient-text">future self</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-surface-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Future Echo is an AI journaling companion that speaks as the wiser version of you —
                        5 years from now. Reflect on your journey, track your growth, and gain perspective
                        from who you&apos;re becoming.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/register" className="btn-primary text-lg px-8 py-4">
                            Start Your Journey
                        </Link>
                        <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 animate-slide-up">
                    <div className="glass-card p-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-2xl mb-5">
                            ✦
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">Reflective Journaling</h3>
                        <p className="text-surface-200/60 text-sm leading-relaxed">
                            Write daily entries with mood tracking and tags. Your journal builds the memory
                            that your future self draws from.
                        </p>
                    </div>
                    <div className="glass-card p-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 flex items-center justify-center text-2xl mb-5">
                            ◎
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">Future Self Chat</h3>
                        <p className="text-surface-200/60 text-sm leading-relaxed">
                            Have real conversations with an AI that speaks as you — 5 years wiser.
                            It references your real memories and emotional patterns.
                        </p>
                    </div>
                    <div className="glass-card p-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-2xl mb-5">
                            ◆
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">Time Capsule</h3>
                        <p className="text-surface-200/60 text-sm leading-relaxed">
                            Write messages to yourself that unlock on a future date.
                            Revisit your hopes, dreams, and intentions when the time comes.
                        </p>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="mt-20 glass-card p-8 flex items-center justify-around">
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">∞</div>
                        <div className="text-sm text-surface-200/50 mt-1">Journal Entries</div>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">5yr</div>
                        <div className="text-sm text-surface-200/50 mt-1">Future Perspective</div>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">AI</div>
                        <div className="text-sm text-surface-200/50 mt-1">Memory System</div>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">🔒</div>
                        <div className="text-sm text-surface-200/50 mt-1">Private & Secure</div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-sm text-surface-200/30">
                © {new Date().getFullYear()} Future Echo By Bleta🐝. Your journey, your perspective.
            </footer>
        </div>
    );
}
