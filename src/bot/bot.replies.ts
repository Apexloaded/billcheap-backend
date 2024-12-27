import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class BotReplies {
  private appUrl: string;
  private communityUrl: string;
  private channelUrl: string;
  private bot: string;

  constructor(private readonly config: ConfigService) {
    this.appUrl = this.config.get<string>('MINI_APP_URL');
    this.communityUrl = this.config.get<string>('COMMUNITY_URL');
    this.channelUrl = this.config.get<string>('CHANNEL_URL');
    this.bot = this.config.get<string>('BOT');
  }

  get welcomeKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📱 Airtime', 'service:airtime'),
        Markup.button.callback('📶 Mobile Data', 'service:mobile_data'),
      ],
      [
        Markup.button.callback('📺 Cable Tv', 'service:cable_tv'),
        Markup.button.callback('💡 Electricity', 'service:electricity'),
      ],
      [
        Markup.button.callback('🏐 Betting', 'service:betting'),
        Markup.button.callback('🎁 Gift Card', 'service:gift_cards'),
      ],
      [Markup.button.url('Join Community 👥', this.communityUrl)],
      [Markup.button.url('Subscribe 📌', this.channelUrl)],
    ]);
  }

  getAirtimeButtons() {
    return [
      [
        Markup.button.callback('MTN', 'provider:mtn:airtime'),
        Markup.button.callback('Airtel', 'provider:airtel:airtime'),
      ],
      [
        Markup.button.callback('Glo', 'provider:glo:airtime'),
        Markup.button.callback('9mobile', 'provider:9mobile:airtime'),
      ],
    ];
  }

  getMobileDataButtons() {
    return [
      [
        Markup.button.callback('MTN', 'provider:mtn:data'),
        Markup.button.callback('Airtel', 'provider:airtel:data'),
      ],
      [
        Markup.button.callback('Glo', 'provider:glo:data'),
        Markup.button.callback('9mobile', 'provider:9mobile:data'),
      ],
    ];
  }

  getCableTvButtons() {
    return [
      [Markup.button.callback('DSTV', 'provider:dstv:cable')],
      [Markup.button.callback('GOTV', 'provider:gotv:cable')],
      [Markup.button.callback('StarTimes', 'provider:startimes:cable')],
    ];
  }

  getElectricityButtons() {
    return [
      [Markup.button.callback('IKEDC', 'provider:ikedc:electricity')],
      [Markup.button.callback('EKEDC', 'provider:ekedc:electricity')],
      [Markup.button.callback('AEDC', 'provider:aedc:electricity')],
    ];
  }

  getBettingButtons() {
    return [
      [Markup.button.callback('Bet9ja', 'provider:bet9ja:betting')],
      [Markup.button.callback('NairaBet', 'provider:nairabet:betting')],
      [Markup.button.callback('BetKing', 'provider:betking:betting')],
    ];
  }

  getGiftCardButtons() {
    return [
      [Markup.button.callback('iTunes', 'provider:itunes:giftcard')],
      [Markup.button.callback('Amazon', 'provider:amazon:giftcard')],
      [Markup.button.callback('Google Play', 'provider:googleplay:giftcard')],
    ];
  }

  get taskKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.url('Join Community 👥', this.communityUrl)],
      [Markup.button.url('Subscribe to Channel 📌', this.channelUrl)],
      [Markup.button.callback('Completed ✅', 'complete_community')],
    ]);
  }

  get refreshLeaderboardKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Refresh', 'refresh_leaderboard')],
    ]);
  }

  async generateWelcomeMessage(name: string): Promise<string> {
    const refLink = 'https://t.me/billcheap';
    const text =
      `*Hi, ${name ?? 'there'}! 🎉Welcome to Billaroo 🦘 referral bot!*\n\n` +
      `You can seamlessly opt your referral game by using this bot.\n\n` +
      `📌 Start by: \n` +
      `Sharing your referral link below to your friends.\n\n` +
      `🔗 Referral link:\n` +
      `\`${refLink}\` (Tap to copy)\n`;

    return text;
  }
}
