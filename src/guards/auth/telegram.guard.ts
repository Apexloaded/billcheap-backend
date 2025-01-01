import { TelegramAuthDto } from '@/auth/dto/telegram-auth';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValid3rd } from '@telegram-apps/init-data-node';
import { Request } from 'express';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  private botToken: string;
  private botId: number;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('BOT_TOKEN');
    this.botId = Number(this.botToken.split(':')[0]);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const body = this.extractBodyFromRequest(request);
      if (!body) {
        throw new UnauthorizedException();
      }

      const { initData, isMocked } = body;
      if (isMocked) {
        return true;
      }

      console.log('initData', initData);
      console.log('Bot Token', this.botId);
      const isvalid = await isValid3rd(initData, this.botId);
      console.log('isValid', isvalid);
      if (!isvalid) {
        throw new UnauthorizedException();
      }

      return true;
    } catch (error: any) {
      throw new ForbiddenException(
        error.message || 'invalid init data supplied',
      );
    }
  }

  private extractBodyFromRequest(request: Request): TelegramAuthDto {
    const body = request.body;
    if (!body) {
      throw new UnauthorizedException();
    }
    return body;
  }
}
