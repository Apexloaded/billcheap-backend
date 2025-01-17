import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get('list')
  async findAll(
    @Req() req: Request,
    @Query('limit') limit: number = 50,
    @Query('page') page: number = 0,
  ) {
    const authUser = req['user'];
    return await this.transactionService.findAll(
      authUser.id,
      authUser.wallet,
      page,
      limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    //return this.transactionService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
