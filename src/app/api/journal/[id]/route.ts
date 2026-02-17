import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { journalEntrySchema } from '@/lib/validations';
import { storeMemory } from '@/lib/ai/memory';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const entry = await prisma.journalEntry.findFirst({
            where: { id: params.id, userId: user.id },
        });

        if (!entry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const body = await req.json();
        const parsed = journalEntrySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const existing = await prisma.journalEntry.findFirst({
            where: { id: params.id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        const entry = await prisma.journalEntry.update({
            where: { id: params.id },
            data: parsed.data,
        });

        // Update embedding
        storeMemory(
            user.id,
            `${entry.title}. ${entry.content}. Mood: ${entry.mood}/10. Tags: ${entry.tags.join(', ')}`,
            'journal',
            entry.id
        ).catch((err) => console.error('Embedding update error:', err));

        return NextResponse.json(entry);
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        const existing = await prisma.journalEntry.findFirst({
            where: { id: params.id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        await prisma.$transaction([
            prisma.embedding.deleteMany({
                where: { sourceType: 'journal', sourceId: params.id, userId: user.id },
            }),
            prisma.journalEntry.delete({ where: { id: params.id } }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
