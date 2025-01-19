import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class EventProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'transfer-events': {
      }
    }
  }
}
