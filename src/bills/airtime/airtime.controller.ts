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

      const { data } = await firstValueFrom(
        this.httpService
          .get(url, {
            headers: {
              Accept: 'application/com.reloadly.countries-v1+json',
              Authorization:
                'Bearer eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMDcwNSIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjIwNzA1IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3MzU3MjIyNDksImF6cCI6IjIwNzA1Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3MzU4MDg2NDksImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6ImI2NzE3YTE3LWUyZTEtNDc2My04ZjczLTM1ODFmNDc5OWVjMyIsImlhdCI6MTczNTcyMjI0OSwianRpIjoiYWRiNjRlM2UtMTU4Zi00MzBjLThkZDUtMGRlMWI1YWM4NTBiIn0.OEUxTORYEHWmyx2qB9MPln88d5o7uKBFgRya2ess1eo',
            },
          })
          .pipe(
            map((response: AxiosResponse) => response),
            catchError((error: AxiosError) => {
              console.log('Reloadly Error', error);
              //console.error('Error:', error.response);
              if (error.response?.status === 401) {
                return throwError(
                  () => new UnauthorizedException(error.response.statusText),
                );
              }
              return throwError(() => error); // Rethrow other errors
            }),
          ),
      );
      console.log(data);
      return data;
      // return this.httpService.get(url, {
      //   headers: {
      //     Accept: 'application/com.reloadly.countries-v1+json',
      //     Authorization:
      //       'Bearer eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMDcwNSIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjIwNzA1IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3MzU3MjIyNDksImF6cCI6IjIwNzA1Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3MzU4MDg2NDksImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6ImI2NzE3YTE3LWUyZTEtNDc2My04ZjczLTM1ODFmNDc5OWVjMyIsImlhdCI6MTczNTcyMjI0OSwianRpIjoiYWRiNjRlM2UtMTU4Zi00MzBjLThkZDUtMGRlMWI1YWM4NTBiIn0.OEUxTORYEHWmyx2qB9MPln88d5o7uKBFgRya2ess1eo',
      //   },
      // });
      // console.log(url);
      // return this.reloadly.getApi(url, AudienceType.Airtime, {
      //   headers: { Accept: 'application/com.reloadly.topups-v1+json' },
      // });
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
