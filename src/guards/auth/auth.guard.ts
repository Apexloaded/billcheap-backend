import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { AuthService } from 'src/auth/auth.service';
import { Cookies } from 'src/enums/cookie.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = await this.authService.validateToken(token);
      const isUser = await this.userService.findOne({ _id: payload.id });
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
    const accessToken = (auth ?? cookies[Cookies.ACCESS_TOKEN] ?? '').replace(
      /^Bearer\s/,
      '',
    );
    return accessToken ? accessToken : undefined;
  }
}
