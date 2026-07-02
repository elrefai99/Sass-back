import "../config/dotenv"
import { Worker, Job } from "bullmq";
import { jobProcessor } from './emails/jobs/job.process.emails';

const worker = new Worker("emailQueue", jobProcessor, {
     connection: {
          url: process.env.REDIS_CACHE_BULLMQ,
     },
});

worker.on("completed", (job) => {
     job.updateProgress(100);
});

worker.on("failed", (job: Job | undefined, err: Error, _prev: string) => {
     if (job) {
          console.error(`Failed to send email to ${job.data.email}:`, err);
     } else {
          console.error(`Failed to send email: job is undefined`, err);
     }
});
