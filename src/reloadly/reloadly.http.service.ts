import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ReloadlyAuthRequest } from './dto/reloadly-auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReloadlyHttpService {
  private readonly apiUrl: string;
  private readonly appKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get('RELOADLY_ALT_HOST');
    this.appKey = this.config.get('AppID');
  }

  auth(
    url: string,
    data?: ReloadlyAuthRequest,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    return this.httpService.post(url, data);
  }

  post<T>(
    url: string,
    data: T,
    accessToken: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthHeader(url, accessToken);
    return this.httpService.post(url, data, config);
  }

  get(
    url: string,
    accessToken: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthHeader(url, accessToken);
    return this.httpService.get(url, config);
  }

  private addAuthHeader(
    url?: string,
    accessToken?: string,
  ): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
  }
}
