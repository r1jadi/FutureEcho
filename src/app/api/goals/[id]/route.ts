import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { goalSchema } from '@/lib/validations';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const body = await req.json();
        const parsed = goalSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const existing = await prisma.goal.findFirst({
            where: { id: params.id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const goal = await prisma.goal.update({
            where: { id: params.id },
            data: {
                ...parsed.data,
                targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
            },
        });

        return NextResponse.json(goal);
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

        const existing = await prisma.goal.findFirst({
            where: { id: params.id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        await prisma.goal.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
