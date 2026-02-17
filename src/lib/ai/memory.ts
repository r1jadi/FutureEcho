import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from './embeddings';

interface RetrievedMemory {
    content: string;
    sourceType: string;
    sourceId: string;
    similarity: number;
    createdAt: Date;
}

/**
 * Store an embedding for a piece of content.
 */
export async function storeMemory(
    userId: string,
    content: string,
    sourceType: string,
    sourceId: string
): Promise<void> {
    const vector = await generateEmbedding(content);

    // Upsert: delete old embedding for this source if exists
    await prisma.embedding.deleteMany({
        where: { sourceType, sourceId, userId },
    });

    await prisma.embedding.create({
        data: {
            vector,
            sourceType,
            sourceId,
            content,
            userId,
        },
    });
}

/**
 * Retrieve top-K most relevant memories for a query.
 */
export async function retrieveMemories(
    userId: string,
    query: string,
    topK: number = 5
): Promise<RetrievedMemory[]> {
    const queryVector = await generateEmbedding(query);

    // Fetch all embeddings for this user
    const embeddings = await prisma.embedding.findMany({
        where: { userId },
        select: {
            vector: true,
            content: true,
            sourceType: true,
            sourceId: true,
            createdAt: true,
        },
    });

    // Calculate similarity and rank
    const scored = embeddings.map((emb) => ({
        content: emb.content,
        sourceType: emb.sourceType,
        sourceId: emb.sourceId,
        createdAt: emb.createdAt,
        similarity: cosineSimilarity(queryVector, emb.vector),
    }));

    // Sort by similarity descending, take top K
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK).filter((m) => m.similarity > 0.1);
}

/**
 * Get mood trend summary for the user.
 */
export async function getMoodTrend(userId: string): Promise<string> {
    const entries = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { mood: true, createdAt: true },
    });

    if (entries.length === 0) return 'No mood data yet.';

    const avgMood = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
    const recent = entries.slice(0, 5);
    const recentAvg = recent.reduce((s, e) => s + e.mood, 0) / recent.length;

    let trend = 'stable';
    if (recentAvg > avgMood + 0.5) trend = 'improving';
    if (recentAvg < avgMood - 0.5) trend = 'declining';

    return `Overall average mood: ${avgMood.toFixed(1)}/10. Recent trend: ${trend}. Recent average: ${recentAvg.toFixed(1)}/10.`;
}

/**
 * Get user goals summary.
 */
export async function getGoalsSummary(userId: string): Promise<string> {
    const goals = await prisma.goal.findMany({
        where: { userId },
        select: { title: true, status: true, targetDate: true },
    });

    if (goals.length === 0) return 'No goals set yet.';

    const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS');
    const completed = goals.filter((g) => g.status === 'COMPLETED');

    let summary = `Goals: ${goals.length} total, ${completed.length} completed, ${inProgress.length} in progress.`;
    if (inProgress.length > 0) {
        summary += ` Active goals: ${inProgress.map((g) => g.title).join(', ')}.`;
    }
    return summary;
}
