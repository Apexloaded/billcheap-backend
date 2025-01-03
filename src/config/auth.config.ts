export default () => ({
  SECRET_KEY: process.env.JWT_CONSTANT,
  EXPIRES_IN: process.env.JWT_EXPIRE_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRE_IN,
  WALLET_SECRET: process.env.WALLET_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
});
