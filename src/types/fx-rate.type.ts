export type FxRateResponse = {
  currencyCode: string;
  fxRate: number;
  id: number;
  name: string;
};

export type FxRateRequest = {
  amount: number;
  operatorId: number;
};
