import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Erc20Service } from './erc20.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class Erc20Job implements OnModuleInit {
  private readonly logger = new Logger(Erc20Job.name);

  private lastProcessedBlock: number;
  private readonly MAX_BLOCK_RANGE = 50000;

  constructor(private readonly erc20Service: Erc20Service) {}
  async onModuleInit() {
    this.lastProcessedBlock = await this.erc20Service.getLatestProcessedBlock();
    this.logger.log(
      `Initialized last processed block: ${this.lastProcessedBlock}`,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async listenForTransferEvents() {
    this.logger.log('Initiating Transfer Polling Events...');
    const latestMinedBlock = await this.erc20Service.getLatestBlockNumber();
    if (latestMinedBlock <= this.lastProcessedBlock) return;

    let fromBlock = this.lastProcessedBlock + 1;
    let toBlock = Math.min(
      fromBlock + this.MAX_BLOCK_RANGE - 1,
      latestMinedBlock,
    );

    while (fromBlock <= latestMinedBlock) {
      this.logger.log('Transfer Polling Event Initiated...');
      await this.erc20Service.pollTransferEvents(fromBlock, toBlock);

      // Update `lastProcessedBlock` to ensure progress
      this.lastProcessedBlock = toBlock;

      fromBlock = toBlock + 1;
      toBlock = Math.min(
        fromBlock + this.MAX_BLOCK_RANGE - 1,
        latestMinedBlock,
      );
    }
  }
}
