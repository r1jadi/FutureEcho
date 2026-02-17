'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    { href: '/dashboard/journal', label: 'Journal', icon: '✦' },
    { href: '/dashboard/chat', label: 'Future Self', icon: '◎' },
    { href: '/dashboard/time-locked', label: 'Time Capsule', icon: '◆' },
    { href: '/dashboard/goals', label: 'Goals', icon: '▲' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-950/80 backdrop-blur-xl border-r border-white/[0.06] z-40 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/[0.06]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                        FE
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">Future Echo</h1>
                        <p className="text-[10px] text-surface-200/50 uppercase tracking-widest">Journal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                    : 'text-surface-200 hover:bg-white/[0.04] hover:text-white'
                                }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-surface-200/50 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full px-4 py-2 text-sm text-surface-200/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
