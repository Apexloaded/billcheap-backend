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
import { generateId } from '@/utils/generate-id';
import * as crypto from 'crypto';
import { toHex } from 'viem';
import { encodeString } from '@/utils/encrypt';
import { Mnemonic, Wallet } from 'ethers';

@Controller('auth')
export class AuthController {
  private botToken: string;
  private botId: number;
  private encryptionKey: string;
  private secretKey: string;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('BOT_TOKEN');
    this.botId = Number(this.botToken.split(':')[0]);
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    this.secretKey = this.configService.get<string>('WALLET_SECRET');
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

      const { wallet, encryptedWallet } = await this.extractWalletAddress(
        tg_user.telegramId,
      );
      const user = await this.userService.findOneOrCreate(
        { telegramId: tg_user.telegramId },
        {
          ...tg_user,
          referralCode: crypto.randomBytes(4).toString('hex'),
          billId: generateId({ dictionary: 'number', length: 6 }),
          wallet: wallet.address,
        },
      );

      const payload = {
        id: user._id,
        wallet: user.wallet,
        ...tg_user,
      };

      const { refreshToken, accessToken } =
        await this.authService.login(payload);

      return { accessToken, refreshToken, user: payload, encryptedWallet };
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
      id: user.id,
      telgramId: user.telegramId,
      username: user.username,
      wallet: user.wallet,
      first_name: user.firstName,
      last_name: user.lastName,
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

  private async extractWalletAddress(userId: number) {
    const salt = toHex(
      crypto.createHash('sha256').update(`${userId}`).digest('hex'),
    );
    const keyToEncode = JSON.stringify({
      id: userId,
      salt,
      secret: this.secretKey,
    });
    const key = encodeString(keyToEncode, true, this.encryptionKey);
    const cryptoData = JSON.stringify({ id: userId, key, salt });

    const seed = crypto.createHash('sha256').update(cryptoData).digest();
    const phrase = Mnemonic.entropyToPhrase(Uint8Array.from(seed));
    const wallet = Wallet.fromPhrase(phrase);
    const encryptedWallet = await wallet.encrypt(seed.toString('hex'));
    return { wallet, encryptedWallet };
  }
}
