import { Injectable } from '@nestjs/common';
import { ReloadlyHttpService } from '../reloadly.http.service';
import { ReloadlyTokenStorageService } from './reloadly.storage.service';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { getProtocol } from '@/utils/helpers';
import {
  Audience,
  AudienceType,
  reloadlyPath,
  ReloadlySubPath,
} from '@/enums/reloadly.enum';
import {
  ReloadlyAuthRequest,
  ReloadlyAuthResponse,
} from '../dto/reloadly-auth.dto';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class ReloadlyAuthService {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;
  expirationBufferInSeconds = 3 * 60; // 3 mins buffer

  constructor(
    private readonly httpService: ReloadlyHttpService,
    private readonly tokenStorageService: ReloadlyTokenStorageService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.getEnv('RELOADLY_CLIENT_ID');
    this.clientSecret = this.getEnv('RELOADLY_SECRET');
    this.apiUrl = this.getEnv('RELOADLY_HOST');
  }

  public async authenticate(key: AudienceType): Promise<string> {
    console.log(key);
    const authUrl = getProtocol(
      `${ReloadlySubPath.Auth}.${this.apiUrl}/${reloadlyPath.auth}`,
    );
    console.log(authUrl);
    const credentials = JSON.stringify({
      audience: this.getAudience(key),
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });
    console.log(credentials);
    const { data } = await firstValueFrom(
      this.httpService
        .auth(`${authUrl}`, credentials, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          map((response: AxiosResponse) => {
            console.log(response);
            return response;
          }),
          catchError((error) => {
            console.log(error);
            return throwError(() => new Error(error));
          }),
        ),
    );

    console.log(data);

    const authData = {
      audience: key,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };

    console.log(authData);

    this.tokenStorageService.setAuthToken(authData);
    return authData.accessToken;
  }

  public async ensureValidToken(key: AudienceType): Promise<string> {
    let { token, isExpired } = await this.verifyToken(key);
    console.log('b4 vali', token);
    console.log(isExpired);
    if (!token || isExpired) {
      console.log('Authenticate here');
      // Token not available or expired, authenticate and obtain a new token
      token = await this.authenticate(key);
    }
    console.log('after vali', token);
    return token;
  }

  private async verifyToken(key: AudienceType) {
    const [token, isExpired] = await Promise.all([
      this.tokenStorageService.getAuthToken(key),
      this.isTokenExpired(key),
    ]);
    return {
      token: token?.accessToken ?? undefined,
      isExpired,
    };
  }

  private async isTokenExpired(key: AudienceType): Promise<boolean> {
    const token = await this.tokenStorageService.getAuthToken(key);
    if (!token) return true;

    const decodedToken = jwtDecode(token.accessToken) as { exp: number } | null;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expTime = decodedToken.exp - this.expirationBufferInSeconds;
    const isExpired = expTime < currentTimeInSeconds;
    return isExpired;
  }

  private getEnv(key: string) {
    return this.configService.get<string>(key);
  }

  private getAudience(key: AudienceType) {
    const audience = Audience[key];
    return getProtocol(`${audience}.${this.apiUrl}`);
  }
}
