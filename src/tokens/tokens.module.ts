import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ListedToken, ListedTokenSchema } from './schemas/token.schema';
import { BillCheapModule } from '@/contracts/billcheap/billcheap.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ListedToken.name, schema: ListedTokenSchema },
    ]),
    BillCheapModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
