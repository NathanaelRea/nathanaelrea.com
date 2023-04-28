import { defaultData } from "./data";
import { addDays } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Indicator } from "./indicator";
import { SliceTable, TransactionTable } from "./tables";
import { Money, ColorMoney, ColorPercent } from "./money";
import { PieChart, TimeSeriesChart } from "./charts";
import LoadingDots from "../../components/LoadingDots";

export function Gain(value: number, cost: number) {
  return value - cost;
}

export function Return(value: number, cost: number) {
  return (value - cost) / cost;
}

type LocalStorage = {
  crypto: Purchases;
  nextTradeValue: number;
  portfolioName: string;
};

export type Purchases = {
  symbol: string;
  name: string;
  buyHistory: TimeSeriesData[];
  percentTarget: number;
};

type MarketChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

export type TimeSeriesData = {
  date: Date;
  value: number;
};

const getMarketHistory = async (name: string) => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=max`
  );
  return res.data as MarketChartResponse;
};

export type Asset = {
  symbol: string;
  name: string;
  history: TimeSeriesData[];
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
  const [portfolio, setPortfolio] = useState(defaultData);

  const marketHistories = useQueries({
    queries: portfolio.map((item) => ({
      staleTime: 60 * 60 * 1000,
      queryKey: ["marketHistory", item.name],
      queryFn: () => getMarketHistory(item.name),
    })),
  });
  const isLoading = marketHistories.some((r) => r.isLoading);
  const timeSeriesMap = marketHistories.reduce(
    (acc: { [key: string]: TimeSeriesData[] }, val, idx) => {
      const k = portfolio[idx].name;
      const newData = val.data?.prices.map((r) => {
        return { date: new Date(r[0]), value: r[1] };
      });
      if (k == null || newData == null) return acc;
      acc[k] = newData;
      return acc;
    },
    {}
  );

  const assets: Asset[] = portfolio.map((p) => {
    if (!Object.hasOwn(timeSeriesMap, p.name))
      return {
        symbol: p.symbol,
        name: p.name,
        history: [],
        totalValue: 0,
        totalSpent: 0,
        percentTarget: p.percentTarget,
      } as Asset;
    const market = timeSeriesMap[p.name];
    const history = [] as TimeSeriesData[];
    let totalSpent = 0;
    let buyIndex = 0;
    let cummulativeAmmount = 0;
    const firstBuyDate = p.buyHistory[0].date;
    market.forEach((a) => {
      if (a.date < firstBuyDate) return;
      if (
        buyIndex < p.buyHistory.length &&
        p.buyHistory[buyIndex].date <= a.date
      ) {
        totalSpent += p.buyHistory[buyIndex].value * a.value;
        cummulativeAmmount += p.buyHistory[buyIndex].value;
        buyIndex += 1;
      }
      history.push({
        date: a.date,
        value: cummulativeAmmount * a.value,
      });
    });
    return {
      symbol: p.symbol,
      name: p.name,
      history,
      totalValue: history[history.length - 1].value,
      totalSpent,
      percentTarget: p.percentTarget,
    } as Asset;
  });

  const sumTotalValue = assets.reduce((acc, val) => acc + val.totalValue, 0);
  const sumTotalCost = assets.reduce((acc, val) => acc + val.totalSpent, 0);

  const [nextAlloc, setNextAlloc] = useState(250);

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
    const ans = [] as TimeSeriesData[];
    for (const a of assetHistory) {
      for (let i = a.history.length - 1; i >= 0; i--) {
        const idx = a.history.length - i - 1;
        if (idx >= ans.length) ans.push({ date: a.history[i].date, value: 0 });
        ans[idx].value += a.history[i].value;
      }
    }
    if (ans.length > 0)
      ans.push({ date: addDays(ans[ans.length - 1].date, -1), value: 0 });
    ans.reverse();
    return ans;
  }
  const timeSeriesData = calculateTimeSeriesData(assets);

  const flatTransactions = Object.values(portfolio)
    .flatMap((p) =>
      p.buyHistory.map((t) => {
        return {
          date: t.date,
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
            <button className="bg-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-700">
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
