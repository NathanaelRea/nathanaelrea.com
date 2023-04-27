import { Purchases } from ".";

export const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format;

export const percentFormat2 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

export const percentFormat0 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format;

export const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

// TODO from local storage
export const defaultData: Purchases[] = [
  {
    symbol: "BTC",
    name: "bitcoin",
    percentTarget: 0.1,
    buyHistory: [
      { value: 0.015, date: new Date("2023-01-01") },
      { value: 0.015, date: new Date("2023-02-01") },
      { value: 0.015, date: new Date("2023-03-01") },
    ],
  },
  {
    symbol: "ETH",
    name: "ethereum",
    percentTarget: 0.5,
    buyHistory: [
      { value: 0.5, date: new Date("2023-01-01") },
      { value: 0.5, date: new Date("2023-01-15") },
      { value: 0.5, date: new Date("2023-02-01") },
      { value: 0.5, date: new Date("2023-02-15") },
      { value: 0.5, date: new Date("2023-03-01") },
      { value: 0.5, date: new Date("2023-03-15") },
      { value: 0.5, date: new Date("2023-04-01") },
    ],
  },
  {
    symbol: "DOGE",
    name: "dogecoin",
    percentTarget: 0.1,
    buyHistory: [{ value: 15_000, date: new Date("2023-01-01") }],
  },
  {
    symbol: "SOL",
    name: "solana",
    percentTarget: 0.1,
    buyHistory: [{ value: 40, date: new Date("2023-01-01") }],
  },
  {
    symbol: "XMR",
    name: "monero",
    percentTarget: 0.1,
    buyHistory: [{ value: 10, date: new Date("2023-01-01") }],
  },
  {
    symbol: "LINK",
    name: "chainlink",
    percentTarget: 0.1,
    buyHistory: [{ value: 250, date: new Date("2023-01-01") }],
  },
];
