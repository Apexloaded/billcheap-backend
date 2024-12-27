import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Cookies } from 'src/enums/cookie.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = await this.authService.validateToken(token);
      const isUser = await this.userService.findOne({
        user_id: payload.user_id,
      });
      if (!isUser) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
      return true;
    } catch (error: any) {
      throw new ForbiddenException(
        error.message || 'session expired! Please sign In',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookies = request.cookies;
    const auth = request.headers.authorization;
    if (!cookies && !auth) {
      throw new UnauthorizedException();
    }
    const refreshToken = (cookies[Cookies.REFRESH_TOKEN] ?? auth ?? '').replace(
      /^Bearer\s/,
      '',
    );
    return refreshToken ? refreshToken : undefined;
  }
}
