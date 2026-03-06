import { prisma } from './prisma';

export function sanitizeInput(input: string): string {
    if (!input) return input;
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function rateLimit(key: string, limit: number, durationSeconds: number): Promise<{ success: boolean; remaining: number }> {
    const now = new Date();

    try {
        const record = await prisma.rateLimit.findUnique({
            where: { key }
        });

        if (!record) {
            await prisma.rateLimit.create({
                data: {
                    key,
                    hits: 1,
                    expires_at: new Date(now.getTime() + durationSeconds * 1000)
                }
            });
            return { success: true, remaining: limit - 1 };
        }

        if (now > record.expires_at) {
            // Reset if expired
            await prisma.rateLimit.update({
                where: { key },
                data: {
                    hits: 1,
                    expires_at: new Date(now.getTime() + durationSeconds * 1000)
                }
            });
            return { success: true, remaining: limit - 1 };
        }

        if (record.hits >= limit) {
            return { success: false, remaining: 0 };
        }

        const updated = await prisma.rateLimit.update({
            where: { key },
            data: {
                hits: { increment: 1 }
            }
        });

        return { success: true, remaining: limit - updated.hits };
    } catch (error) {
        console.error('Rate limit error:', error);
        return { success: true, remaining: 1 }; // Fail open for safety
    }
}
