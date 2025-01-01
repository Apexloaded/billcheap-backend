import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ReloadlyAuthRequest } from './dto/reloadly-auth.dto';

@Injectable()
export class ReloadlyHttpService {
  constructor(private readonly httpService: HttpService) {}

  auth(
    url: string,
    data?: ReloadlyAuthRequest,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    return this.httpService.post(url, data, config);
  }

  post<T>(
    url: string,
    data: T,
    accessToken: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthorizationHeader(config, accessToken);
    return this.httpService.post(url, data, config);
  }

  get(
    url: string,
    accessToken: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<any>> {
    config = this.addAuthorizationHeader(config, accessToken);
    return this.httpService.get(url, config);
  }

  private addAuthorizationHeader(
    config?: AxiosRequestConfig,
    accessToken?: string,
  ): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/com.reloadly.topups-v1+json',
      },
    };
  }
}
