import { cFmt, defaultData, pFmt1, pFmt2, pFmtWhole } from "./data";
import * as d3 from "d3";
import { motion, useScroll } from "framer-motion";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

type Storage = {
  crypto: Purchases;
  buyValue: number;
  portfolioName: string;
};

export type Purchases = {
  symbol: string;
  name: string;
  buyHistory: Asdf[];
  percentTarget: number;
};

type Asdf = {
  amount: number;
  date: string;
};

type Slice = {
  percentActual: number;
  gain: number;
  return: number;
  symbol: string;
  value: number;
  percentTarget: number;
};

const getMarketHistory = async (name: string) => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=max`
  );
  return res.data;
};

type MarketHistory = [number, number][];

const queryClient = new QueryClient();

export default function C1() {
  return (
    <QueryClientProvider client={queryClient}>
      <Body />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

export function Body() {
  const [portfolio, setPortfolio] = useState(defaultData);
  // const [marketHistory, setMarketHistory] = useState<MarketHistory[]>([]);

  const summaries = generateSlices(portfolio);

  const minDate = portfolio.reduce((prv, cur) =>
    prv.buyHistory[0] < cur.buyHistory[0] ? prv : cur
  );

  const marketHistories = useQueries({
    queries: portfolio.map((item) => ({
      queryKey: ["marketHistory", item.name],
      queryFn: () => getMarketHistory(item.name),
    })),
  });

  function generateSlices(coins: Purchases[]) {
    const symbolSum = [];
    const total = 0;
    for (const coin of coins) {
      let s = 0;
      // TODO multiply by price at each date
      for (const amt of coin.buyHistory) s += amt.amount;
      symbolSum.push({
        symbol: coin.symbol,
        value: s,
        percentTarget: coin.percentTarget,
      });
    }

    const slices = symbolSum.map((e) => {
      return {
        ...e,
        percentActual: e.value / total,
        gain: 10.05,
        return: 0.1,
      };
    });

    return slices;
  }

  return (
    <div className="flex flex-col gap-6 m-4 sm:p-8">
      <div>
        <div className="flex gap-2">
          <h1 className="font-bold text-2xl">Portfolio</h1>
          <button className="bg-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-700">
            Import
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
          <IndicatorLg name="Current Value" value={cFmt.format(20_000.02)} />
          <IndicatorLg name="Gain" value={cFmt.format(20_000.02)} />
          <IndicatorLg name="Return" value={pFmt2.format(0.02)} />
          <IndicatorSm name="Net Cash Flow" value={cFmt.format(0.02)} />
          <IndicatorSm name="Market Gain" value={cFmt.format(0.02)} />
          <IndicatorSm name="Earned Staking" value={cFmt.format(0.02)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
        <div className="bg-gray-700 rounded-md p-2 aspect-square">o</div>
        <div className="bg-gray-800 font-bold text-xl p-2 rounded-md sm:col-span-2">
          Value over time
        </div>
      </div>
      <div>
        <h3 className="font-bold text-xl ">Slices</h3>
        <input className="rounded-sm" placeholder="250" />
        <SliceTableHeader />
        {summaries.map((summary) => (
          <SliceTableRow summary={summary} key={summary.symbol} />
        ))}
      </div>
    </div>
  );
}

function SliceTableHeader() {
  return (
    <div className="grid grid-cols-5 bg-cyan-900 justify-items-center p-2 text-cyan-300 rounded-t-md items-center">
      <div>Name</div>
      <div>Value</div>
      <div>
        <div>Gain</div>
        <div>Return</div>
      </div>
      <div>
        <div>Actual</div>
        <div>Target</div>
      </div>
      <div>Next Buy</div>
    </div>
  );
}

function SliceTableRow({ summary }: { summary: Slice }) {
  return (
    <div className="grid grid-cols-5 bg-cyan-950 text-cyan-100 justify-items-center p-1 items-center">
      <div>{summary.symbol}</div>
      <div>{cFmt.format(summary.value)}</div>
      <div className="flex flex-col items-end">
        <div>{cFmt.format(summary.gain)}</div>
        <div>{pFmt1.format(summary.return)}</div>
      </div>
      <div className="flex flex-col items-end">
        <div>{pFmt1.format(summary.percentActual)}</div>
        <div>{pFmtWhole.format(summary.percentTarget)}</div>
      </div>
      <div>...</div>
    </div>
  );
}

function IndicatorLg({ name, value }: { name: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{name}</div>
      <div className="text-4xl">{value}</div>
    </div>
  );
}

function IndicatorSm({ name, value }: { name: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{name}</div>
      <div className="text-lg">{value}</div>
    </div>
  );
}
