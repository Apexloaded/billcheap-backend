import { Controller, Get } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';
import { Public } from '@/decorators/public.decorator';

@Controller('reloadly')
export class ReloadlyController {
  constructor(private readonly reloadlyService: ReloadlyService) {}

  @Public()
  @Get('/account/balance')
  getBalance() {
    return this.reloadlyService.accountBalance();
  }
}
