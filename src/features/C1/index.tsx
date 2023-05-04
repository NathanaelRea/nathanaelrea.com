import { addDays } from "date-fns";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useRef, useState } from "react";
import { Indicator } from "./indicator";
import { SliceTable, TransactionTable } from "./tables";
import { Money, ColorMoney, ColorPercent } from "./money";
import { PieChart, TimeSeriesChart } from "./charts";
import LoadingDots from "../../components/LoadingDots";
import { useTransactions } from "./useTransactions";

export function Gain(value: number, cost: number) {
  return value - cost;
}

export function Return(value: number, cost: number) {
  return cost == 0 ? 0 : (value - cost) / cost;
}

type LocalStorage = {
  crypto: PortfolioItem;
  nextTradeValue: number;
  portfolioName: string;
};

export type TimeSeriesData = {
  date: Date;
  value: number;
};

export type PortfolioItem = {
  symbol: string;
  name: string;
  coinbaseTransactions: CoinbaseTransaction[];
  percentTarget: number;
  staking?: number;
};

export type CoinbaseTransaction = {
  timestamp: Date;
  value: number;
};

type MarketChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

type CoinListReponse = {
  id: string;
  symbol: string;
  name: string;
}[];

const getMarketHistory = async (name: string) => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=max`
  );
  return res.data as MarketChartResponse;
};

const getCoinList = async () => {
  const res = await axios.get("https://api.coingecko.com/api/v3/coins/list");
  return res.data as CoinListReponse;
};

export type Asset = {
  symbol: string;
  name: string;
  history: CoinbaseTransaction[];
  totalSpent: number;
  totalValue: number;
  percentTarget: number;
};

export type Slice = {
  symbol: string;
  totalValue: number;
  gain: number;
  return: number;
  targetPercent: number;
  actualPercent: number;
  nextBuy: number;
};

export type Transaction = { date: Date; value: number; symbol: string };

export default function C1() {
  const [nextAlloc, setNextAlloc] = useState(250);
  const { transactions, handleImport } = useTransactions();

  const coinList = useQuery({
    staleTime: Infinity,
    queryKey: ["coinList"],
    queryFn: () => getCoinList(),
  });
  const coinNameLookup: Map<string, string> = useMemo(() => {
    // This is so dumb. I need Map<string, string[]> and prompt user for correct id
    if (coinList.data == undefined) return new Map();
    // reverse because usually better coins are on top?
    const asdf = coinList.data.reduce((acc, val) => {
      // This is so dumb. Why does coingeko allow coins with the same symbol?
      if (
        !(
          val.id.endsWith("wormhole") ||
          val.id.startsWith("binance-peg") ||
          val.id.startsWith("wrapped")
        )
      )
        acc.set(val.symbol, val.id);
      return acc;
    }, new Map());
    // Hacks for now - of the incorrect I've seen
    asdf.set("snx", "havven");
    asdf.set("poly", "polymath");
    return asdf;
  }, [coinList]);

  const portfolio = useMemo(() => {
    if (!transactions) return [];

    const unique = transactions.reduce((acc, val) => {
      if (coinNameLookup.get(val.asset.toLowerCase())) acc.add(val.asset);
      return acc;
    }, new Set<string>());
    const percentTarget = unique.size == 0 ? 1 : 1 / unique.size;
    const items = new Map<string, PortfolioItem>();
    transactions.forEach((t) => {
      const p = items.get(t.asset);
      if (p) {
        p.coinbaseTransactions.push({
          timestamp: t.timeStamp,
          value: t.quantity,
        });
      } else {
        const name = coinNameLookup.get(t.asset.toLowerCase());
        if (name) {
          items.set(t.asset, {
            symbol: t.asset,
            name,
            coinbaseTransactions: [
              {
                timestamp: t.timeStamp,
                value: t.quantity,
              },
            ],
            percentTarget,
          });
        }
      }
    });
    return Array.from(items.values());
  }, [transactions, coinNameLookup]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const marketHistories = useQueries({
    queries: portfolio.map((item) => ({
      staleTime: 60 * 60 * 1000,
      queryKey: ["marketHistory", item.name],
      queryFn: () => getMarketHistory(item.name),
    })),
  });
  const isLoading = marketHistories.some((r) => r.isLoading);
  const timeSeriesMap = marketHistories.reduce((acc, val, idx) => {
    const k = portfolio[idx].name;
    const newData = val.data?.prices.map((r) => {
      return {
        timestamp: new Date(r[0]),
        value: r[1],
      } as CoinbaseTransaction;
    });
    if (k == null || newData == null) return acc;
    acc.set(k, newData);
    return acc;
  }, new Map<string, CoinbaseTransaction[]>());

  const assets: Asset[] = portfolio.map((p) => {
    const market = timeSeriesMap.get(p.name);
    if (!market)
      return {
        symbol: p.symbol,
        name: p.name,
        history: [],
        totalValue: 0,
        totalSpent: 0,
        percentTarget: p.percentTarget,
      } as Asset;
    const history = [] as CoinbaseTransaction[];
    let totalSpent = 0;
    let buyIndex = 0;
    let cummulativeAmmount = 0;
    const firstBuyDate = p.coinbaseTransactions[0].timestamp;
    market.forEach((a) => {
      if (a.timestamp < firstBuyDate) return;
      if (
        buyIndex < p.coinbaseTransactions.length &&
        p.coinbaseTransactions[buyIndex].timestamp <= a.timestamp
      ) {
        totalSpent += p.coinbaseTransactions[buyIndex].value * a.value;
        cummulativeAmmount += p.coinbaseTransactions[buyIndex].value;
        buyIndex += 1;
      }
      history.push({
        timestamp: a.timestamp,
        value: cummulativeAmmount * a.value,
      });
    });
    const totalValue =
      history.length == 0 ? 0 : history[history.length - 1].value;
    return {
      symbol: p.symbol,
      name: p.name,
      history,
      totalValue,
      totalSpent,
      percentTarget: p.percentTarget,
    } as Asset;
  });

  const sumTotalValue = assets.reduce((acc, val) => acc + val.totalValue, 0);
  const sumTotalCost = assets.reduce((acc, val) => acc + val.totalSpent, 0);

  const handleUpdateNextAlloc = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNextAlloc(
      isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
    );
  const sumAllocation = assets.reduce(
    (acc, val) =>
      acc +
      Math.max(
        0,
        (sumTotalValue + nextAlloc) * val.percentTarget - val.totalValue
      ),
    0
  );

  const slices: Slice[] = assets
    .map((a) => {
      const allocation = Math.max(
        0,
        (sumTotalValue + nextAlloc) * a.percentTarget - a.totalValue
      );
      return {
        symbol: a.symbol,
        totalValue: a.totalValue,
        gain: Gain(a.totalValue, a.totalSpent),
        return: Return(a.totalValue, a.totalSpent),
        targetPercent: a.percentTarget,
        actualPercent: a.totalValue / sumTotalValue,
        nextBuy: (nextAlloc * allocation) / sumAllocation,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  function calculateTimeSeriesData(assetHistory: Asset[]) {
    const ans = [] as CoinbaseTransaction[];
    for (const a of assetHistory) {
      for (let i = a.history.length - 1; i >= 0; i--) {
        const idx = a.history.length - i - 1;
        if (idx >= ans.length)
          ans.push({ timestamp: a.history[i].timestamp, value: 0 });
        ans[idx].value += a.history[i].value;
      }
    }
    if (ans.length > 0)
      ans.push({
        timestamp: addDays(ans[ans.length - 1].timestamp, -1),
        value: 0,
      });
    ans.reverse();
    return ans;
  }
  const timeSeriesData = calculateTimeSeriesData(assets);

  // TODO just use data from useTransactions?
  const flatTransactions = Object.values(portfolio)
    .flatMap((p) =>
      p.coinbaseTransactions.map((t) => {
        return {
          date: t.timestamp,
          value: t.value,
          symbol: p.symbol,
        } as Transaction;
      })
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex justify-center w-full">
      <div className="gap-6 m-4 sm:p-8 grid grid-cols-2 sm:grid-cols-3 flex-grow max-w-screen-xl">
        <div className="col-span-2 sm:col-span-3">
          <div className="flex gap-2">
            <h1 className="font-bold text-2xl">Portfolio</h1>

            <input
              type="file"
              onChange={handleImport}
              ref={fileInputRef}
              hidden
            />
            <button
              className="bg-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-700"
              onClick={handleUploadButtonClick}
            >
              Import
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:col-span-3">
          <Indicator
            name="Current Value"
            size="large"
            value={<Money value={sumTotalValue} />}
          />
          <Indicator
            name="Gain"
            size="large"
            value={<ColorMoney value={Gain(sumTotalValue, sumTotalCost)} />}
          />
          <Indicator
            name="Return"
            size="large"
            value={<ColorPercent value={Return(sumTotalValue, sumTotalCost)} />}
          />
          <Indicator
            name="Net Cash Flow"
            size="small"
            value={<Money value={sumTotalCost} />}
          />
          <Indicator
            name="Market Gain"
            size="small"
            value={<ColorMoney value={Gain(sumTotalValue, sumTotalCost)} />}
          />
          <Indicator
            name="Earned Staking"
            size="small"
            value={<ColorMoney value={0} />}
          />
        </div>
        <div className="bg-gray-700 rounded-md p-2 aspect-square self-center">
          {isLoading ? <LoadingDots /> : <PieChart slices={slices} />}
        </div>
        <div className="bg-gray-800 font-bold text-xl p-2 rounded-md col-span-2">
          {isLoading ? (
            <LoadingDots />
          ) : (
            <TimeSeriesChart data={timeSeriesData} />
          )}
        </div>
        <div className="col-span-2 sm:col-span-3">
          <h3 className="font-bold text-xl ">Slices</h3>
          {isLoading ? (
            <LoadingDots />
          ) : (
            <SliceTable
              nextAlloc={nextAlloc}
              handleUpdate={handleUpdateNextAlloc}
              slices={slices}
            />
          )}
        </div>
        <div className="col-span-2 sm:col-span-3">
          <h3 className="font-bold text-xl ">Transactions</h3>
          <TransactionTable values={flatTransactions} />
        </div>
      </div>
    </div>
  );
}
