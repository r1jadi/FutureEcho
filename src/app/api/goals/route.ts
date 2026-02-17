import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { goalSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
    try {
        const user = await requireAuth();

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(goals);
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
        const { success } = rateLimit(`goals:${user.id}`);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const parsed = goalSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const goal = await prisma.goal.create({
            data: {
                ...parsed.data,
                targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
                userId: user.id,
            },
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
