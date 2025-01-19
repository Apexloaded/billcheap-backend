import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventGateway } from './event.gateway';
import { TransactionModule } from '@/transaction/transaction.module';
import { TokensModule } from '@/tokens/tokens.module';
import { BullModule } from '@nestjs/bullmq';
import { UserModule } from '@/user/user.module';
import { EventProcessor } from './event.processor';

@Module({
  imports: [
    TransactionModule,
    TokensModule,
    BullModule.registerQueue({
      name: 'events',
    }),
    UserModule,
  ],
  providers: [EventGateway, EventService, EventProcessor],
  exports: [EventGateway],
})
export class EventModule {}
