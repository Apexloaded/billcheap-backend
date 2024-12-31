import { bscTestnet, hardhat, bsc } from 'viem/chains';

export const getProtocol = (url: string) => {
  return `https://${url}`;
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isDebug = process.env.NODE_ENV === 'debugging';

export const getAppChain = isDev ? bscTestnet : bsc;
