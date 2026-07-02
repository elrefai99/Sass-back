import '../config/dotenv'
import { Job, Worker } from 'bullmq'
import { notificationJobProcessor } from './notifications/jobs/job.process.notifications'

const worker = new Worker('notificationQueue', notificationJobProcessor, {
  connection: {
    url: process.env.REDIS_CACHE_BULLMQ,
  },
})

worker.on('completed', (job) => {
  job.updateProgress(100)
})

worker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.error(`Failed to process notification job ${job.id}:`, err)
  } else {
    console.error('Failed to process notification job: job is undefined', err)
  }
})

export default worker
