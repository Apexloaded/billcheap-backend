import { Injectable, Logger } from '@nestjs/common';
import { AirtimeService } from './airtime.service';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { AudienceType, reloadlyPath } from '@/enums/reloadly.enum';
import {
  AirtimeBodyRequest,
  AirtimeBodyResponse,
  AirtimeStatusResponse,
} from './dto/create-airtime.dto';

@Injectable()
export class AirtimeProcessor {
  private readonly logger = new Logger(AirtimeProcessor.name);

  constructor(
    private readonly airtimeService: AirtimeService,
    private readonly reloadly: ReloadlyService,
  ) {}

  async processAirtime(billId: string) {
    const airtime = await this.airtimeService.findOne({ bill: billId });
    if (!airtime) return;

    const payload = {
      operatorId: airtime.provider.providerId,
      amount: airtime.localAmount.toString(),
      customIdentifier: airtime.reference,
      recipientPhone: {
        countryCode: airtime.recipient.countryCode,
        number: airtime.recipient.number,
      },
    };
    const reqUrl = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.topUp,
    );
    const airtimeRes = await this.reloadly.postApi<
      AirtimeBodyRequest,
      AirtimeBodyResponse
    >(reqUrl, AudienceType.Airtime, payload);
    this.logger.log('Airtime Response', airtimeRes);

    // Query airtime status
    const statusUrl = this.reloadly.getUrl(
      AudienceType.Airtime,
      reloadlyPath.topUpStatus(airtimeRes.transactionId.toString()),
    );
    const statusRes = await this.reloadly.getApi<AirtimeStatusResponse>(
      statusUrl,
      AudienceType.Airtime,
    );
    this.logger.log('Status Response', statusRes);

    return statusRes;
  }
}
