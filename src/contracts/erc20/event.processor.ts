import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Erc20Service } from './erc20.service';
import { QueueEvent } from '@/enums/event.enum';

@Processor('erc20-events')
export class Erc20Processor extends WorkerHost {
  constructor(private readonly erc20Service: Erc20Service) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case QueueEvent.Transfer: {
        const { wallets, tokens, fromBlock, toBlock } = job.data as {
          wallets: string[];
          tokens: string[];
          fromBlock: number;
          toBlock: number;
        };
        for (const token of tokens) {
          await this.erc20Service.processTransferEvent(
            token,
            wallets,
            fromBlock,
            toBlock,
          );
        }
      }
    }
  }
}
