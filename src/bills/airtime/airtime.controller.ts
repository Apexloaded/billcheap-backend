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
import { AirtimeService } from './airtime.service';
import { UpdateAirtimeDto } from './dto/update-airtime.dto';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import { Provider } from '@/types/provider.type';

@Controller('airtime')
export class AirtimeController {
  constructor(
    private readonly airtimeService: AirtimeService,
    private readonly reloadly: ReloadlyService,
  ) {}

  @Get('/countries')
  listCountries() {
    try {
      const url = this.reloadly.getUrl(
        AudienceType.Airtime,
        reloadlyPath.countries,
      );
      console.log(url);
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
  autoDetectProvider(@Param('phone') phone: string, @Param('iso') iso: string) {
    if (!phone || !iso) {
      throw new Error('Phone and ISO are required parameters.');
    }

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
    return this.reloadly.getApi(urlWithISO, AudienceType.Airtime);
  }

  @Get('/providers/:iso')
  async listProvidersByISO(
    @Param('iso') iso: string,
    @Query('suggestedAmountsMap') suggestedAmountsMap: boolean = true,
    @Query('suggestedAmounts') suggestedAmounts: boolean = true,
    @Query('includePin') includePin: boolean = true,
    @Query('dataOnly') dataOnly: boolean = false,
    @Query('includeData') includeData: boolean = false,
  ) {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.countryOperators(iso),
    );

    const options = {
      suggestedAmountsMap,
      suggestedAmounts,
      includePin,
      dataOnly,
      includeData,
      includeBundles: false,
    };

    console.log(options);

    const queryParams = new URLSearchParams(
      options as unknown as Record<string, string>,
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
      options.dataOnly
        ? p.denominationType === 'FIXED'
        : p.denominationType === 'RANGE',
    );

    return operators;
    // if (options.dataOnly) {
    //   const operatorMap = new Map();

    //   operators.forEach((operator) => {
    //     const name = operator.name.split(' ')[0]; // Get the first word of the operator name
    //     if (!operatorMap.has(name)) {
    //       operatorMap.set(name, { ...operator, plans: [] });
    //     }
    //     operatorMap.get(name).plans.push({
    //       id: operator.id,
    //       name: operator.name,
    //       fixedAmounts: operator.fixedAmounts,
    //       fixedAmountsDescriptions: operator.fixedAmountsDescriptions,
    //     });
    //   });

    //   const newArr = Array.from(operatorMap.values());
    //   return newArr;
    // } else {
    //   return operators;
    // }
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
