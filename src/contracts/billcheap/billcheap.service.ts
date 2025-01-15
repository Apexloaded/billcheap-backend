import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import BillCheapAbi from './abi/billcheap.abi';
import { ContractEvents } from '@/enums/contract.enum';
import { ListedTokenDocument } from '@/tokens/schemas/token.schema';
import { erc20Abi, formatEther, zeroAddress, formatUnits } from 'viem';
import AggregatorV3Abi from './abi/aggregatorV3.abi';

export interface BlockchainEvent {
  name: string;
  args: any;
  blockNumber: number;
  transactionHash: string;
}

@Injectable()
export class BillCheapService {
  private readonly logger = new Logger(BillCheapService.name);
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC');
    const contractAddress = this.configService.get<string>('BC_CONTRACT');
    const adminKey = this.configService.get<string>('ADMIN_PRIVATE');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(adminKey, this.provider);
    this.contract = new Contract(contractAddress, BillCheapAbi, this.signer);

    this.logger.log('*********BillCheap Service Initialized*********');
  }

  async signInitTopUp(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>,
  ) {
    const signature = await this.signer.signTypedData(domain, types, value);
    return signature;
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<BlockchainEvent[]> {
    const eventNames = [ContractEvents.BillProcessed];
    const events: BlockchainEvent[] = [];

    for (const eventName of eventNames) {
      const filter = this.contract.filters[eventName]();
      const rawEvents = await this.contract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );
      events.push(
        ...rawEvents.map((event: any) => ({
          name: eventName,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        })),
      );
    }

    return events;
  }

  subscribeToEvents(callback: (event: BlockchainEvent) => void) {
    const eventNames = [ContractEvents.BillProcessed];

    for (const eventName of eventNames) {
      this.contract.on(eventName, (...args) => {
        const event = args[args.length - 1];
        callback({
          name: eventName,
          args: event.args,
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
    }

    this.logger.log('Subscribed to real-time events');
  }

  getAccountBalance(tokens: ListedTokenDocument[], address: `0x${string}`) {
    return Promise.all(
      tokens.map(
        async ({ address: tokenAddress, name, symbol, icon, token }) => {
          let balance: bigint;
          if (tokenAddress === zeroAddress) {
            balance = await this.provider.getBalance(address);
          } else {
            const erc20Contract = new Contract(
              tokenAddress,
              erc20Abi,
              this.provider,
            );
            balance = await erc20Contract.balanceOf(address);
          }
          return {
            name,
            symbol,
            icon,
            token,
            balance: formatEther(balance),
            address: tokenAddress,
          };
        },
      ),
    );
  }
  getPriceFeeds(tokens: ListedTokenDocument[]) {
    return Promise.all(
      tokens.map(async ({ address, aggregator, symbol, name }) => {
        const contract = new Contract(
          aggregator,
          AggregatorV3Abi,
          this.provider,
        );
        const priceFeeds = await contract.latestRoundData();
        const decimal = await contract.decimals();
        const price = formatUnits(priceFeeds[1], Number(decimal));
        return {
          address,
          aggregator,
          symbol,
          name,
          price,
        };
      }),
    );
  }
}
