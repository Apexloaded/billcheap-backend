import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '@/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async login(payload: Partial<UserDocument>) {
    return await this.getTokens(payload);
  }

  async getTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('EXPIRES_IN'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });
    return { accessToken, refreshToken };
  }

  validateToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('SECRET_KEY'),
    });
  }
}
