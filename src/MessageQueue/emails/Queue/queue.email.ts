import { Queue, Job } from "bullmq";

export const queue = new Queue("emailQueue", {
     connection: {
          url: process.env.REDIS_CACHE_BULLMQ,
     },
});

// Without a listener, an unreachable Redis emits an unhandled 'error' and takes
// the process (or serverless invocation) down.
queue.on('error', (err) => console.error('emailQueue error:', err.message));

const REMOVE_CONFIG = {
     removeOnComplete: {
          age: 60 * 60,
     },
     removeOnFail: {
          age: 24 * 60 * 60,
     },
};

export async function addJobToQueue<T>(name: string, data: T): Promise<Job<T>> {
     return await queue.add(name, data, REMOVE_CONFIG);
}
