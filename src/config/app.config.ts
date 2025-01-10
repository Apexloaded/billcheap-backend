export default () => ({
  AppName: process.env.APP_NAME,
  AppID: process.env.APP_ID,
  jwtKey: process.env.JWT_CONSTANT,
  expiresIn: process.env.JWT_EXPIRE_IN,
  DB_URI: process.env.MONGO_DB_URI,
  HOSTNAME: process.env.HOSTNAME,
  TG_APP_API: process.env.TG_APP_API,
});
