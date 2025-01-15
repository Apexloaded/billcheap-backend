import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokensService } from '@/tokens/tokens.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokensService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  userProfile(@Req() req: Request) {
    const authUser = req['user'];
    return this.userService.findOne({ telegramId: authUser.telegramId });
  }

  @Get('balance')
  async userBalance(@Req() req: Request) {
    try {
      const authUser = req['user'];
      const user = await this.userService.findOne({
        telegramId: authUser.telegramId,
      });
      const tokens = await this.tokenService.queryBalance(
        user.wallet as `0x${string}`,
      );
      return tokens.sort((a, b) => Number(b.balance) - Number(a.balance));
    } catch (error) {
      console.log(error);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
