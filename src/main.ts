import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { getBotToken } from 'nestjs-telegraf';
import { BOT_NAME } from './config/telegram.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  process.on('unhandledRejection', (reason, promise) => {
    console.log(promise);
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Application specific logging, throwing an error, or other logic here
  });
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    // Application specific logging, throwing an error, or other logic here
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const billarooRefBot = app.get(getBotToken(BOT_NAME));

  app.use(billarooRefBot.webhookCallback('/webhook/bot'));
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  await app.listen(3100);
}
bootstrap();
