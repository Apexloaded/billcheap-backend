import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ContractEvent } from '../schemas/contract-event.schema';
import { Model } from 'mongoose';
import { BillCheapService, BlockchainEvent } from './billcheap.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContractEvents } from '@/enums/contract.enum';
import { BillsProcessor } from '@/bills/bills.processor';

@Injectable()
export class BillCheapListener implements OnModuleInit {
  private readonly logger = new Logger(BillCheapListener.name);
  private lastProcessedBlock: number;
  private deployedAtBlock: number;
  private readonly MAX_BLOCK_RANGE = 50000;

  constructor(
    private readonly billCheapService: BillCheapService,
    @InjectModel(ContractEvent.name)
    private readonly model: Model<ContractEvent>,
    private readonly billsProcessor: BillsProcessor,
  ) {
    this.deployedAtBlock = 47409300;
  }

  async onModuleInit() {
    this.subscribeToRealTimeEvents();
    await this.initializeLastProcessedBlock();
  }

  private async initializeLastProcessedBlock() {
    const lastProcessedEvent = await this.model
      .findOne()
      .sort({ blockNumber: -1 })
      .exec();

    this.lastProcessedBlock = lastProcessedEvent
      ? lastProcessedEvent.blockNumber
      : this.deployedAtBlock;

    this.logger.log(
      `Initialized last processed block: ${this.lastProcessedBlock}`,
    );
  }

  private subscribeToRealTimeEvents() {
    // this.billCheapService.subscribeToEvents(async (event: BlockchainEvent) => {
    //   this.logger.log('************Subscribed Events:************', event);
    //   await this.processEvent(event);
    // });
  }

  //@Cron(CronExpression.EVERY_10_SECONDS)
  async findContractEvents() {
    try {
      this.logger.log('Polling for new events...');
      const latestBlock = await this.billCheapService.getLatestBlockNumber();
      if (latestBlock <= this.lastProcessedBlock) {
        return;
      }

      let fromBlock = this.lastProcessedBlock + 1;
      let toBlock = Math.min(fromBlock + this.MAX_BLOCK_RANGE - 1, latestBlock);
      console.log(fromBlock, toBlock);

      while (fromBlock <= latestBlock) {
        this.logger.log(
          `Fetching events from block ${fromBlock} to ${toBlock}`,
        );
        const events = await this.billCheapService.getEvents(
          fromBlock,
          toBlock,
        );

        for (const event of events) {
          this.logger.log('************Polling Event:************', event);
          await this.processEvent(event);
        }

        this.lastProcessedBlock = toBlock;
        this.logger.log(`Processed events up to block ${toBlock}`);

        fromBlock = toBlock + 1;
        toBlock = Math.min(fromBlock + this.MAX_BLOCK_RANGE - 1, latestBlock);
      }
    } catch (error) {
      this.logger.error('Error polling for events', error);
    }
  }

  private async processEvent(event: BlockchainEvent) {
    const existingEvent = await this.model
      .findOne({ transactionHash: event.transactionHash })
      .exec();

    if (existingEvent) {
      this.logger.log(
        `Event with txHash ${event.transactionHash} already processed, skipping`,
      );
      return;
    }

    switch (event.name) {
      case ContractEvents.BillProcessed:
        await this.billsProcessor.processBillEvent(event);
        break;
      case 'OtherEvent1':
        // Process the event here
        console.log(event);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.name}`);
    }

    await this.model.create({
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      eventName: event.name,
      eventData: event.args,
    });
  }
}
