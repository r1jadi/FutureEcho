interface RateLimitStore {
    [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per window

export function rateLimit(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const record = store[identifier];

    if (!record || now > record.resetTime) {
        store[identifier] = { count: 1, resetTime: now + WINDOW_MS };
        return { success: true, remaining: MAX_REQUESTS - 1 };
    }

    if (record.count >= MAX_REQUESTS) {
        return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: MAX_REQUESTS - record.count };
}

export function rateLimitAI(identifier: string): { success: boolean; remaining: number } {
    const aiKey = `ai:${identifier}`;
    const now = Date.now();
    const record = store[aiKey];
    const AI_MAX = 10; // 10 AI requests per minute
    const AI_WINDOW = 60 * 1000;

    if (!record || now > record.resetTime) {
        store[aiKey] = { count: 1, resetTime: now + AI_WINDOW };
        return { success: true, remaining: AI_MAX - 1 };
    }

    if (record.count >= AI_MAX) {
        return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: AI_MAX - record.count };
}
