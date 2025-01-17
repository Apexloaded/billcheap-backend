import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventGateway } from './event.gateway';
import { TransactionModule } from '@/transaction/transaction.module';
import { TokensModule } from '@/tokens/tokens.module';

@Module({
  imports: [TransactionModule, TokensModule],
  providers: [EventGateway, EventService],
  exports: [EventGateway],
})
export class EventModule {}
