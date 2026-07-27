import '../config/dotenv'
import { Job, Worker } from 'bullmq'
import { analyticsJobProcessor } from './analytics/jobs/job.process.analytics'

const worker = new Worker('analyticsQueue', analyticsJobProcessor, {
  connection: {
    url: process.env.REDIS_CACHE_BULLMQ,
  },
})

worker.on('completed', (job) => {
  job.updateProgress(100)
})

worker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.error(`Failed to process analytics job ${job.id}:`, err)
  } else {
    console.error('Failed to process analytics job: job is undefined', err)
  }
})

export default worker
