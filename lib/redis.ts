import Redis from "ioredis";

// Create a Redis client that mimics the @upstash/redis API
// but uses the standard TCP connection provided by process.env.REDIS_URL
const client = new Redis(process.env.REDIS_URL!);

export const redis = {
    get: async <T>(key: string): Promise<T | null> => {
        const data = await client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch (e) {
            return data as unknown as T;
        }
    },
    set: async (key: string, value: any) => {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        await client.set(key, stringValue);
        return "OK";
    }
};

// Ensure connection is closed on hot reload if needed (less critical for serverless functions but good practice)
// However, in Next.js lambda context, reusing the client is better.
