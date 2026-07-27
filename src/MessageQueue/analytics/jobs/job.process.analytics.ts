import type { Job } from 'bullmq'
import { AnalyticsEventModel } from '../../../schema'
import type { AnalyticsEventInput } from '../../../module/analytics/@types'

export const analyticsJobProcessor = async (job: Job<AnalyticsEventInput>): Promise<void> => {
  switch (job.name) {
    case 'logEvent': {
      await AnalyticsEventModel.create(job.data)
      return
    }
    default:
      throw new Error(`Unknown analytics job: ${job.name}`)
  }
}
