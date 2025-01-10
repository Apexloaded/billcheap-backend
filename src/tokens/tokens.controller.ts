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

@Controller('tokens')
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private http: HttpService,
  ) {}

  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Get('exchange')
  async getExchangeRate() {
    const tokens = await this.tokensService.findAll();
    const symbols = tokens
      ?.filter((b) => b.symbol !== 'USDT')
      .map((b) => `${b.symbol}USDT`);

    const url = 'https://api.binance.com/api/v3/ticker/price';

    const promises = symbols.map(async (symbol) => {
      try {
        const response = await firstValueFrom(
          this.http
            .get(url, {
              params: { symbol },
            })
            .pipe(
              map((response: AxiosResponse) => response.data), // Extract data from response
              catchError((error: AxiosError) => {
                console.error('Binance API Error:', error.message);
                throw new Error(`Failed to fetch exchange rate for ${symbol}`);
              }),
            ),
        );
        return response;
      } catch (error) {
        console.error(error.message);
        return null; // Handle individual symbol fetch failures gracefully
      }
    });

    // Await all promises
    const results = await Promise.all(promises);

    // Filter out failed responses (nulls) if needed
    const validResults = results.filter((result) => result !== null);
    const reducedResults = validResults.reduce((acc: any, res) => {
      const { symbol, price } = res;
      acc[symbol] = parseFloat(price);
      return acc;
    }, {});

    return {
      ...reducedResults,
      USDTUSDT: 1,
    };
  }
  @Get()
  findAll() {
    return this.tokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tokensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(+id, updateTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tokensService.remove(+id);
  }
}
