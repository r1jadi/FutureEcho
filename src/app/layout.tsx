import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'Future Echo — Talk to Your Future Self',
    description: 'An AI-powered journaling app that simulates conversations with your future self. Reflect, grow, and find perspective through the wisdom of who you will become.',
    keywords: ['journaling', 'AI', 'self-reflection', 'personal growth', 'future self'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
