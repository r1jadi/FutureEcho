import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const journalEntrySchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required'),
    mood: z.number().int().min(1).max(10).default(5),
    tags: z.array(z.string().max(50)).max(10).default([]),
});

export const goalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
    targetDate: z.string().datetime().optional().nullable(),
});

export const chatMessageSchema = z.object({
    message: z.string().min(1, 'Message is required').max(5000),
    sessionId: z.string().optional().nullable(),
});

export const timeLockedMessageSchema = z.object({
    content: z.string().min(1, 'Content is required').max(5000),
    unlockDate: z.string().datetime({ message: 'Valid date required' }),
});
