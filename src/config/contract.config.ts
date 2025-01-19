export default () => ({
  BSC_MAINNET: process.env.BSC_RPC_MAINNET,
  RPC: process.env.RPC,
  RPC_WSS: process.env.RPC_WSS,
  BC_CONTRACT: process.env.BC_CONTRACT,
  ADMIN_WALLET: process.env.ADMIN_WALLET,
  ADMIN_PRIVATE: process.env.ADMIN_PRIVATE,
  DEPLOYED_AT_BLOCK: parseInt(process.env.DEPLOYED_AT),
});
