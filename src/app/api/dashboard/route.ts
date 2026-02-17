import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        const user = await requireAuth();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Mood data (last 30 days)
        const moodEntries = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: { mood: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        // Entry frequency (last 30 days, grouped by date)
        const allEntries = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        const frequencyMap: { [key: string]: number } = {};
        allEntries.forEach((entry) => {
            const dateKey = entry.createdAt.toISOString().split('T')[0];
            frequencyMap[dateKey] = (frequencyMap[dateKey] || 0) + 1;
        });

        const entryFrequency = Object.entries(frequencyMap).map(([date, count]) => ({
            date,
            count,
        }));

        // Goals summary
        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            select: { id: true, title: true, status: true, targetDate: true, createdAt: true },
        });

        const goalStats = {
            total: goals.length,
            completed: goals.filter((g) => g.status === 'COMPLETED').length,
            inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
            abandoned: goals.filter((g) => g.status === 'ABANDONED').length,
        };

        // Overall stats
        const totalEntries = await prisma.journalEntry.count({
            where: { userId: user.id },
        });

        const totalChats = await prisma.chatSession.count({
            where: { userId: user.id },
        });

        const avgMood = moodEntries.length > 0
            ? moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length
            : 0;

        // Streak calculation
        const sortedDates = [...new Set(
            allEntries.map((e) => e.createdAt.toISOString().split('T')[0])
        )].sort().reverse();

        let streak = 0;
        const today = now.toISOString().split('T')[0];
        let checkDate = today;

        for (const date of sortedDates) {
            if (date === checkDate) {
                streak++;
                const prev = new Date(checkDate);
                prev.setDate(prev.getDate() - 1);
                checkDate = prev.toISOString().split('T')[0];
            } else {
                break;
            }
        }

        return NextResponse.json({
            moodData: moodEntries.map((e) => ({
                date: e.createdAt.toISOString().split('T')[0],
                mood: e.mood,
            })),
            entryFrequency,
            goals,
            goalStats,
            stats: {
                totalEntries,
                totalChats,
                avgMood: Math.round(avgMood * 10) / 10,
                streak,
            },
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
