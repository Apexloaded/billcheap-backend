import { TokensService } from '@/tokens/tokens.service';
import { UserService } from '@/user/user.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('events') private eventQueue: Queue,
    private readonly tokenService: TokensService,
    private readonly userService: UserService,
  ) {}

  async initTransferEventsPolling(): Promise<void> {
    const tokens = await this.tokenService.findAll();
    const wallets = await this.userService.findAll();

    const batchSize = 1000;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const walletBatch = wallets.slice(i, i + batchSize);
      console.log(walletBatch);
    }
  }
}
