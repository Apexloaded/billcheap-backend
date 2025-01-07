import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import telegramConfig, { BOT_NAME } from './config/telegram.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './guards/role/roles.guard';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ReloadlyModule } from './reloadly/reloadly.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { BillsModule } from './bills/bills.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AuthGuard } from './guards/auth/auth.guard';
import { TransactionModule } from './transaction/transaction.module';
import { BillCheapModule } from './contracts/billcheap/billcheap.module';
import contractConfig from './config/contract.config';
import { ScheduleModule } from '@nestjs/schedule';
import { TokensModule } from './tokens/tokens.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      isGlobal: true,
      load: [appConfig, telegramConfig, authConfig, contractConfig],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      botName: BOT_NAME,
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN'),
        middlewares: [session()],
        include: [BotModule],
        launchOptions: {
          webhook: {
            domain: configService.get<string>('HOSTNAME'),
            path: '/webhook/bot',
          },
        },
      }),
      inject: [ConfigService],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   // @ts-ignore
    //   useFactory: async (configService: ConfigService) => {
    //     return {
    //       store: async () =>
    //         await redisStore({
    //           socket: {
    //             host: 'localhost',
    //             port: configService.get('REDIS_PORT'),
    //           },
    //           password: configService.get('REDIS_PASSWORD'),
    //           username: configService.get('REDIS_USERNAME'),
    //           url: configService.get('REDIS_URL'),
    //         }),
    //       ttl: 60 * 60 * 1000,
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    BotModule,
    UserModule,
    AuthModule,
    ReloadlyModule,
    BillsModule,
    TransactionModule,
    BillCheapModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    //{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
