import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@/decorators/public.decorator';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';
import { TelegramAuthDto } from './dto/telegram-auth';
import { validate } from '@telegram-apps/init-data-node';
import { RefreshAuthGuard } from '@/guards/auth/refresh.guard';
import { TelegramUser } from '@/user/schemas/user.schema';
import { CreateTGUserDto } from '@/user/dto/create-user.dto';
import { TelegramAuthGuard } from '@/guards/auth/telegram.guard';

@Controller('auth')
export class AuthController {
  private botToken: string;
  private botId: number;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('BOT_TOKEN');
    this.botId = Number(this.botToken.split(':')[0]);
  }

  @Public()
  @UseGuards(TelegramAuthGuard)
  @Post('login/telegram')
  async authenticate(@Body() body: TelegramAuthDto) {
    try {
      const { initData: telegramInitData, isMocked, referredBy } = body;
      let tg_user: CreateTGUserDto = null;

      if (isMocked) {
        tg_user = this.extractMockedUser(telegramInitData); // initData
      } else {
        validate(telegramInitData, this.botToken);

        const initData = new URLSearchParams(telegramInitData);
        const entry = Object.fromEntries(initData.entries());
        const userString = entry['user'];
        const parsedUser = JSON.parse(userString);
        tg_user = this.extractTelegramUser(parsedUser);
      }

      const user = await this.userService.findOneOrCreate(
        { telegramId: tg_user.telegramId },
        { ...tg_user },
      );

      const payload = {
        id: user._id,
        ...tg_user,
      };

      const { refreshToken, accessToken } =
        await this.authService.login(payload);

      return { accessToken, refreshToken, user: payload };
    } catch (error) {
      return error;
    }
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const user = req['user'];

    const payload = {
      id: user._id,
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const { refreshToken, accessToken } = await this.authService.login(payload);

    return { accessToken, refreshToken, user: payload };
  }

  private extractMockedUser(initData: string) {
    const data = new URLSearchParams(initData);
    const userData = JSON.parse(decodeURIComponent(data.get('user')));
    return this.extractTelegramUser(userData);
  }

  private extractTelegramUser(user: TelegramUser): CreateTGUserDto {
    return {
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  }
}
