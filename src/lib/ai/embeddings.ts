import { genAI } from './gemini';

/**
 * Generate text embedding using Google Gemini text-embedding-004.
 * Returns a 768-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const result = await genAI.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
    });
    const values = result.embeddings?.[0]?.values;
    if (!values) {
        throw new Error('Failed to generate embedding: no values returned');
    }
    return values;
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    return denominator === 0 ? 0 : dot / denominator;
}
