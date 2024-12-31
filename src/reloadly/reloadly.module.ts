import { Module } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';
import { ReloadlyController } from './reloadly.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import reloadlyConfig from '@/config/reloadly.config';
import redisConfig from '@/config/redis.config';
import { ReloadlyHttpService } from './reloadly.http.service';
import { ReloadlyAuthService } from './auth/reloadly.auth.service';
import { ReloadlyTokenStorageService } from './auth/reloadly.storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReloadlyAuth, ReloadlyAuthSchema } from './schema/reloadly.schema';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      load: [reloadlyConfig, redisConfig],
    }),
    MongooseModule.forFeature([
      { name: ReloadlyAuth.name, schema: ReloadlyAuthSchema },
    ]),
  ],
  controllers: [ReloadlyController],
  providers: [
    ReloadlyService,
    ReloadlyHttpService,
    ReloadlyAuthService,
    ReloadlyTokenStorageService,
  ],
  exports: [ReloadlyService],
})
export class ReloadlyModule {}
