import { Queue, Job } from "bullmq";

export const queue = new Queue("emailQueue", {
     connection: {
          url: process.env.REDIS_CACHE_BULLMQ,
     },
});

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
