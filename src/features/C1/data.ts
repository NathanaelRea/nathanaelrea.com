import { Purchases } from ".";

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
      { value: 0.015, date: new Date("2023-04-01") },
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
      { value: 0.5, date: new Date("2023-04-15") },
    ],
  },
  {
    symbol: "DOGE",
    name: "dogecoin",
    percentTarget: 0.1,
    buyHistory: [
      { value: 5_000, date: new Date("2023-01-01") },
      { value: 5_000, date: new Date("2023-02-01") },
      { value: 5_000, date: new Date("2023-03-01") },
      { value: 5_000, date: new Date("2023-04-01") },
    ],
  },
  {
    symbol: "SOL",
    name: "solana",
    percentTarget: 0.1,
    buyHistory: [
      { value: 10, date: new Date("2023-01-01") },
      { value: 10, date: new Date("2023-02-01") },
      { value: 10, date: new Date("2023-03-01") },
      { value: 10, date: new Date("2023-04-01") },
    ],
  },
  {
    symbol: "XMR",
    name: "monero",
    percentTarget: 0.1,
    buyHistory: [
      { value: 3, date: new Date("2023-01-01") },
      { value: 3, date: new Date("2023-02-01") },
      { value: 3, date: new Date("2023-03-01") },
      { value: 3, date: new Date("2023-04-01") },
    ],
  },
  {
    symbol: "LINK",
    name: "chainlink",
    percentTarget: 0.1,
    buyHistory: [
      { value: 100, date: new Date("2023-01-01") },
      { value: 100, date: new Date("2023-02-01") },
      { value: 100, date: new Date("2023-03-01") },
      { value: 100, date: new Date("2023-04-01") },
    ],
  },
];
