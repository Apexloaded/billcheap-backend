import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';

@QueueEventsListener('events')
export class EventListener extends QueueEventsHost {
  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    console.log(`Processing job ${job.jobId}...`);
  }
}