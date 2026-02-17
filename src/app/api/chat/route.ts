import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { chatMessageSchema } from '@/lib/validations';
import { rateLimitAI } from '@/lib/rate-limit';
import { buildFutureEchoPrompt } from '@/lib/ai/prompts';
import { genAI } from '@/lib/ai/gemini';

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { success } = rateLimitAI(user.id);
        if (!success) {
            return NextResponse.json(
                { error: 'Too many AI requests. Please wait a moment.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const parsed = chatMessageSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const { message, sessionId } = parsed.data;

        // Get or create chat session
        let session;
        if (sessionId) {
            session = await prisma.chatSession.findFirst({
                where: { id: sessionId, userId: user.id },
                include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
            });
        }

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                    userId: user.id,
                },
                include: { messages: true },
            });
        }

        // Store user message
        await prisma.message.create({
            data: {
                role: 'USER',
                content: message,
                chatSessionId: session.id,
            },
        });

        // Build context-aware system prompt
        const systemPrompt = await buildFutureEchoPrompt(user.id, message);

        // Build conversation history for Gemini
        const history = (session.messages || []).map((msg) => ({
            role: msg.role === 'USER' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Initialize chat with system instruction
        const chat = genAI.chats.create({
            model: 'gemini-2.0-flash',
            history: history,
            config: {
                systemInstruction: systemPrompt,
            },
        });

        const result = await chat.sendMessageStream({ message });

        // Stream response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullResponse = '';

                    for await (const chunk of result) {
                        const text = chunk.text;
                        if (text) {
                            fullResponse += text;
                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({ text, sessionId: session!.id })}\n\n`
                                )
                            );
                        }
                    }

                    // Store complete assistant response
                    await prisma.message.create({
                        data: {
                            role: 'ASSISTANT',
                            content: fullResponse,
                            chatSessionId: session!.id,
                        },
                    });

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ done: true, sessionId: session!.id })}\n\n`
                        )
                    );
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
