import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
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
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.countries,
    );
    console.log(url);
    return this.reloadly.getApi(url, AudienceType.Airtime);
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
  async listProvidersByISO(@Param('iso') iso: string) {
    const url = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.countryOperators(iso),
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

    const response = await this.reloadly.getApi<Provider[]>(
      urlWithISO,
      AudienceType.Airtime,
      {
        headers: {
          Accept: 'application/com.reloadly.topups-v1+json',
        },
      },
    );

    return response.filter((p) => p.denominationType === 'RANGE');
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
