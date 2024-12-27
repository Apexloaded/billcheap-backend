import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  initData: string;

  @IsBoolean()
  isMocked: boolean;

  @IsOptional()
  referredBy?: string | null;
}
