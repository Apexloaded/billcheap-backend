import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Public } from '@/decorators/public.decorator';
import { BillCheapService } from '@/contracts/billcheap/billcheap.service';

@Controller('tokens')
export class TokensController {
  private apiHost: string;
  private appKey: string;

  constructor(
    private readonly tokensService: TokensService,
    private http: HttpService,
    private readonly config: ConfigService,
    private readonly billCheapService: BillCheapService,
  ) {
    this.apiHost = this.config.get('TG_APP_API');
    this.appKey = this.config.get('AppID');
  }

  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Public()
  @Get('exchange')
  async getExchangeRate() {
    const tokens = await this.tokensService.findAll();
    const priceFeeds = await this.billCheapService.getPriceFeeds(tokens);

    const feeds = priceFeeds.reduce((acc, feed) => {
      const { price, symbol } = feed;
      acc[symbol] = parseFloat(price);
      return acc;
    }, {});

    return feeds;
  }
  @Get()
  findAll() {
    return this.tokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(+id, updateTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tokensService.remove(+id);
  }
}
