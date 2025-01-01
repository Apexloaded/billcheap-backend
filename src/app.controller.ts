import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Post('/webhook/bot')
  handleUpdate(@Req() req: Request) {
    console.log('Referral');
  }
}
