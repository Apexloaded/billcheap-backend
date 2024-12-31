import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ReloadlyHttpService } from './reloadly.http.service';
import { ConfigService } from '@nestjs/config';
import {
  Audience,
  AudienceType,
  reloadlyPath,
  ReloadlySubPath,
} from '@/enums/reloadly.enum';
import { getProtocol } from '@/utils/helpers';
import { ReloadlyAuthService } from './auth/reloadly.auth.service';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ReloadlyService {
  private apiUrl: string;

  constructor(
    private readonly httpService: ReloadlyHttpService,
    private readonly configService: ConfigService,
    private readonly reloadlyAuthService: ReloadlyAuthService,
  ) {
    this.apiUrl = this.configService.get('RELOADLY_HOST');
  }

  async accountBalance() {
    const url = this.getUrl(AudienceType.Airtime, reloadlyPath.accountBalance);
    return await this.getApi(url, AudienceType.Airtime);
  }

  //   private async postApi(payload: KudaRequest) {
  //     const cachedToken = await this.kudaAuthService.ensureValidToken();
  //     const { data } = await firstValueFrom(
  //       this.httpService.post(this.apiURL, payload, cachedToken).pipe(
  //         map((response: AxiosResponse) => response.data),
  //         catchError((error: AxiosError) => {
  //           if (error.response.status == 401)
  //             return throwError(
  //               () => new UnauthorizedException(error.response.statusText),
  //             );
  //         }),
  //       ),
  //     );
  //     return data;
  //   }
  async getApi<T>(url: string, key: AudienceType, config?: AxiosRequestConfig) {
    const accessToken = await this.reloadlyAuthService.ensureValidToken(key);
    const { data } = await firstValueFrom(
      this.httpService.get(url, accessToken, config).pipe(
        map((response: AxiosResponse<T>) => response),
        catchError((error: AxiosError) => {
          console.error('Error:', error.response);
          if (error.response?.status === 401) {
            return throwError(
              () => new UnauthorizedException(error.response.statusText),
            );
          }
          return throwError(() => error); // Rethrow other errors
        }),
      ),
    );
    return data;
  }
  async postApi<Body, Res>(
    url: string,
    key: AudienceType,
    payload: Body,
    config?: AxiosRequestConfig,
  ) {
    const accessToken = await this.reloadlyAuthService.ensureValidToken(key);
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, accessToken, config).pipe(
        map((response: AxiosResponse<Res>) => response),
        catchError((error: AxiosError) => {
          console.error('Error:', error.response);
          if (error.response?.status === 401) {
            return throwError(
              () => new UnauthorizedException(error.response.statusText),
            );
          }
          return throwError(() => error); // Rethrow other errors
        }),
      ),
    );
    return data;
  }

  getUrl(key: AudienceType, path: string) {
    return getProtocol(`${Audience[key]}.${this.apiUrl}/${path}`);
  }
}
