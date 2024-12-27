export default () => ({
  BOT: process.env.BOT_TOKEN,
  MINI_APP_URL: process.env.MINI_APP_URL,
  COMMUNITY_URL: process.env.COMMUNITY_URL,
  CHANNEL_URL: process.env.CHANNEL_URL,
  BOT_NAME: process.env.BOT_NAME,
  ADMIN_IDS: process.env.ADMIN_IDS.split(','),
});
