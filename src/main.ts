import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { getBotToken } from 'nestjs-telegraf';
import { BOT_NAME } from './config/telegram.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const billarooRefBot = app.get(getBotToken(BOT_NAME));

  app.use(billarooRefBot.webhookCallback('/webhook/bot'));
  await app.listen(3100);
}
bootstrap();
