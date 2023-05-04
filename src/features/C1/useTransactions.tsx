import { useEffect, useState } from "react";
import { z } from "zod";

const coinbaseTransactionType = z.union([
  z.literal("Buy"),
  z.literal("Sell"),
  z.literal("Send"),
  z.literal("Convert"),
  z.literal("Receive"),
  z.literal("Rewards Income"),
  z.literal("Advanced Trade Buy"),
  z.literal("Advanced Trade Sell"),
]);
const coinbaseSchema = z.object({
  timeStamp: z.coerce.date(),
  transactionType: coinbaseTransactionType,
  asset: z.string(),
  quantityTransacted: z.coerce.number(),
  spotPriceCurrency: z.string(),
  spotPriceAtTransaction: z.coerce.number(),
  subtotal: z.coerce.number(),
  total: z.coerce.number(),
  feesPlusSpread: z.coerce.number(),
  notes: z.string(),
});
type CoinbaseTransactionType = z.infer<typeof coinbaseTransactionType>;

const storageTransactionType = z.union([
  z.literal("Buy"),
  z.literal("Sell"),
  z.literal("Stake"),
  z.literal("Send"),
  z.literal("Receive"),
  z.literal("Other"),
]);
const storageTransaction = z.object({
  timeStamp: z.coerce.date(),
  type: storageTransactionType,
  asset: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
});
type StorageTransactionType = z.infer<typeof storageTransactionType>;
export type StorageTransaction = z.infer<typeof storageTransaction>;

function typeTransform(
  coinbaseType: CoinbaseTransactionType
): StorageTransactionType {
  switch (coinbaseType) {
    case "Buy":
    case "Sell":
    case "Send":
    case "Receive":
      return coinbaseType;
    case "Advanced Trade Buy":
      return "Buy";
    case "Advanced Trade Sell":
      return "Sell";
    case "Rewards Income":
      return "Stake";
    default:
      return "Other";
  }
}

const TRANSACTIONS = "transactions";

export function useTransactions() {
  const j = JSON.parse(localStorage.getItem(TRANSACTIONS) ?? "[]");
  const p = z.array(storageTransaction).safeParse(j);
  const [transactions, setTransactions] = useState<StorageTransaction[]>(
    p.success ? p.data : defaultData
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file == null) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = [] as StorageTransaction[];
      text.split("\n").forEach((row) => {
        const splitRow = row.split(",");
        const coinbaseParsed = coinbaseSchema.safeParse({
          timeStamp: splitRow[0],
          transactionType: splitRow[1],
          asset: splitRow[2],
          quantityTransacted: splitRow[3],
          spotPriceCurrency: splitRow[4],
          spotPriceAtTransaction: splitRow[5],
          subtotal: splitRow[6],
          total: splitRow[7],
          feesPlusSpread: splitRow[8],
          notes: splitRow[9],
        });
        if (coinbaseParsed.success) {
          data.push({
            timeStamp: coinbaseParsed.data.timeStamp,
            type: typeTransform(coinbaseParsed.data.transactionType),
            asset: symbolTransform(coinbaseParsed.data.asset),
            quantity: coinbaseParsed.data.quantityTransacted,
            totalPrice: coinbaseParsed.data.subtotal,
          });
        }
      });
      localStorage.setItem(TRANSACTIONS, JSON.stringify(data));
      setTransactions(data);
    };
    reader.readAsText(file);
  };

  return { transactions, handleImport };
}
function symbolTransform(symbol: string): string {
  // Coinbase is silly
  return symbol === "ETH2" ? "ETH" : symbol;
}

const defaultData: StorageTransaction[] = [
  {
    asset: "BTC",
    type: "Buy",
    quantity: 0.015,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
  {
    asset: "BTC",
    type: "Buy",
    quantity: 0.015,
    totalPrice: -1,
    timeStamp: new Date("2023-01-15"),
  },
  {
    asset: "ETH",
    type: "Buy",
    quantity: 0.5,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
  {
    asset: "DOGE",
    type: "Buy",
    quantity: 5_000,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
  {
    asset: "SOL",
    type: "Buy",
    quantity: 10,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
  {
    asset: "XMR",
    type: "Buy",
    quantity: 3,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
  {
    asset: "LINK",
    type: "Buy",
    quantity: 100,
    totalPrice: -1,
    timeStamp: new Date("2023-01-01"),
  },
];
