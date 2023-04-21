import { Purchases } from ".";

export const pFmt1 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const pFmt2 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const pFmtWhole = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const cFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// TODO from local storage
export const defaultData: Purchases[] = [
  {
    symbol: "BTC",
    name: "bitcoin",
    percentTarget: 0.5,
    buyHistory: [
      { amount: 0.1, date: "2023-01-01" },
      { amount: 0.1, date: "2023-02-01" },
      { amount: 0.1, date: "2023-03-01" },
    ],
  },
  {
    symbol: "ETH",
    name: "ethereum",
    percentTarget: 0.5,
    buyHistory: [
      { amount: 0.5, date: "2023-01-01" },
      { amount: 0.5, date: "2023-01-15" },
      { amount: 0.5, date: "2023-02-01" },
      { amount: 0.5, date: "2023-02-15" },
      { amount: 0.5, date: "2023-03-01" },
    ],
  },
];
