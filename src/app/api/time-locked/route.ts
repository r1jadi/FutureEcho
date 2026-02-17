import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { timeLockedMessageSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
    try {
        const user = await requireAuth();

        // Auto-unlock messages whose unlock date has passed
        await prisma.timeLockedMessage.updateMany({
            where: {
                userId: user.id,
                isLocked: true,
                unlockDate: { lte: new Date() },
            },
            data: { isLocked: false },
        });

        const messages = await prisma.timeLockedMessage.findMany({
            where: { userId: user.id },
            orderBy: { unlockDate: 'asc' },
        });

        // For locked messages, redact the content
        const processed = messages.map((msg) => ({
            ...msg,
            content: msg.isLocked ? '' : msg.content,
        }));

        return NextResponse.json(processed);
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { success } = rateLimit(`timelocked:${user.id}`);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const parsed = timeLockedMessageSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const unlockDate = new Date(parsed.data.unlockDate);
        if (unlockDate <= new Date()) {
            return NextResponse.json({ error: 'Unlock date must be in the future' }, { status: 400 });
        }

        const message = await prisma.timeLockedMessage.create({
            data: {
                content: parsed.data.content,
                unlockDate,
                userId: user.id,
            },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const existing = await prisma.timeLockedMessage.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        await prisma.timeLockedMessage.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
