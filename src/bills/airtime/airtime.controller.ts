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
  UnauthorizedException,
} from '@nestjs/common';
import { AirtimeService } from './airtime.service';
import { UpdateAirtimeDto } from './dto/update-airtime.dto';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import { Provider } from '@/types/provider.type';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Controller('airtime')
export class AirtimeController {
  constructor(
    private readonly airtimeService: AirtimeService,
    private readonly reloadly: ReloadlyService,
    private readonly httpService: HttpService,
  ) {}

  @Get('/countries')
  async listCountries() {
    try {
      const url = this.reloadly.getUrl(
        AudienceType.Airtime,
        reloadlyPath.countries,
      );
      return this.reloadly.getApi(url, AudienceType.Airtime, {
        headers: { Accept: 'application/com.reloadly.topups-v1+json' },
      });
    } catch (e) {
      console.error('Error fetching countries:', e);
      throw e;
    }
  }
  @Get('/providers')
  listProviders() {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.operators,
    );
    console.log(url);
    return this.reloadly.getApi(url, AudienceType.Airtime);
  }
  @Get('/provider/auto-detect/:phone/:iso')
  async autoDetectProvider(
    @Param('phone') phone: string,
    @Param('iso') iso: string,
  ) {
    if (!phone || !iso) {
      throw new Error('Phone and ISO are required parameters.');
    }

    console.log(phone, iso);
    
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.autoDetectProvider(phone, iso),
    );
    const options = {
      suggestedAmountsMap: true,
      suggestedAmounts: true,
      includePin: true,
    };

    const queryParams = new URLSearchParams(
      options as unknown as Record<string, string>,
    ).toString();
    const urlWithISO = `${url}?${queryParams}`;
    const operator = await this.reloadly.getApi<Provider>(
      urlWithISO,
      AudienceType.Airtime,
    );

    if (iso == 'NG' && operator.suggestedAmounts.length > 0) {
      const { suggestedAmounts, ...rest } = operator;
      return {
        ...rest,
        suggestedAmounts: this.airtimeService.suggestedAmounts(),
      };
    }

    return operator;
  }

  @Get('/providers/:iso')
  async listProvidersByISO(
    @Param('iso') iso: string,
    @Query('suggestedAmountsMap') suggestedAmountsMap,
    @Query('suggestedAmounts') suggestedAmounts,
    @Query('includePin') includePin,
    @Query('dataOnly') dataOnly,
    @Query('includeData') includeData,
  ) {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.countryOperators(iso),
    );

    let mappedOptions = Object.fromEntries(
      Object.entries({
        suggestedAmountsMap,
        suggestedAmounts,
        includePin,
        dataOnly,
        includeData,
      }).map(([key, value]) => [key, value === 'true']),
    );

    const queryParams = new URLSearchParams(
      mappedOptions as unknown as Record<string, string>,
    ).toString();
    const urlWithISO = `${url}?${queryParams}`;

    const response = await this.reloadly.getApi<Provider[]>(
      urlWithISO,
      AudienceType.Airtime,
      {
        headers: {
          Accept: 'application/com.reloadly.topups-v1+json',
        },
      },
    );

    const operators = response.filter((p) =>
      mappedOptions.dataOnly === true
        ? p.denominationType === 'FIXED'
        : p.denominationType === 'RANGE',
    );

    if (mappedOptions.dataOnly == false && iso == 'NG') {
      return operators.map((op) => {
        const { suggestedAmounts, ...rest } = op;
        return {
          ...rest,
          suggestedAmounts: this.airtimeService.suggestedAmounts(),
        };
      });
    }

    return operators;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //return this.airtimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAirtimeDto: UpdateAirtimeDto) {
    return this.airtimeService.update(+id, updateAirtimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airtimeService.remove(+id);
  }
}
