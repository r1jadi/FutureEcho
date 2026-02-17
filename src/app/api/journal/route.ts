import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { journalEntrySchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { storeMemory } from '@/lib/ai/memory';

export async function GET(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const tag = searchParams.get('tag');

        const where: any = { userId: user.id };
        if (tag) {
            where.tags = { has: tag };
        }

        const [entries, total] = await Promise.all([
            prisma.journalEntry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.journalEntry.count({ where }),
        ]);

        return NextResponse.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Journal GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { success } = rateLimit(`journal:${user.id}`);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const parsed = journalEntrySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const entry = await prisma.journalEntry.create({
            data: { ...parsed.data, userId: user.id },
        });

        // Store embedding asynchronously (don't block response)
        storeMemory(
            user.id,
            `${entry.title}. ${entry.content}. Mood: ${entry.mood}/10. Tags: ${entry.tags.join(', ')}`,
            'journal',
            entry.id
        ).catch((err) => console.error('Embedding storage error:', err));

        return NextResponse.json(entry, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Journal POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
