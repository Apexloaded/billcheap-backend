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
import { ElectricityService } from './electricity.service';
import { CreateElectricityDto } from './dto/create-electricity.dto';
import { UpdateElectricityDto } from './dto/update-electricity.dto';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';

@Controller('electricity')
export class ElectricityController {
  constructor(
    private readonly electricityService: ElectricityService,
    private readonly reloadly: ReloadlyService,
  ) {}

  @Post()
  create(@Body() createElectricityDto: CreateElectricityDto) {
    return this.electricityService.create(createElectricityDto);
  }

  @Get('billers')
  findAll(@Req() req: Request) {
    const authUser = req['user'];

    const url = this.reloadly.getUrl(
      AudienceType.Utilities,
      reloadlyPath.billers,
    );
    const options = {
      type: 'ELECTRICITY_BILL_PAYMENT',
      countryISOCode: 'NG',
    };

    const queryParams = new URLSearchParams(
      options as unknown as Record<string, string>,
    ).toString();
    const urlWithParams = `${url}?${queryParams}`;

    return this.reloadly.getApi(urlWithParams, AudienceType.Utilities, {
      headers: { Accept: 'application/com.reloadly.topups-v1+json' },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electricityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateElectricityDto: UpdateElectricityDto,
  ) {
    return this.electricityService.update(+id, updateElectricityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electricityService.remove(+id);
  }
}
