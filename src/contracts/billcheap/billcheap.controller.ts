import { Controller } from '@nestjs/common';
import { BillCheapService } from './billcheap.service';

@Controller('billcheap')
export class BillcheapController {
  constructor(private readonly billcheapService: BillCheapService) {}
}
