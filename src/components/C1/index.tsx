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
import { useEffect, useRef, useState } from "react";

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

type Slice = {
  percentActual: number;
  gain: number;
  return: number;
  symbol: string;
  value: number;
  percentTarget: number;
};

type MarketChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

type TimeSeriesData = {
  date: Date;
  value: number;
};

const queryClient = new QueryClient();

export default function C1() {
  return (
    <QueryClientProvider client={queryClient}>
      <Body />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

const getMarketHistory = async (name: string) => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=max`
  );
  return res.data as MarketChartResponse;
};

export function Body() {
  const [portfolio, setPortfolio] = useState(defaultData);

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
  const eth = timeSeriesMap["ethereum"];

  function generateSlices(coins: Purchases[]) {
    const symbolSum = [];
    const total = 0;
    for (const coin of coins) {
      let s = 0;
      // TODO multiply by price at each date
      for (const amt of coin.buyHistory) s += amt.value;
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
          Eth
          <TimeSeriesChart data={eth} />
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

function TimeSeriesChart({ data }: { data: TimeSeriesData[] | undefined }) {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (chartRef.current == null || data == undefined) return;

    const chart = d3.select(chartRef.current);
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;

    // const xScale = d3
    //   .scaleUtc()
    //   .domain([data[0].date, data[data.length - 1].date])
    //   .range([0, width]);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([height, 0]);

    const line = d3
      .line<TimeSeriesData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // chart
    //   .append("g")
    //   .attr("transform", `translate(0, ${height})`)
    //   .call(
    //     d3
    //       .axisBottom(xScale)
    //       .ticks(d3.timeDay.every(1))
    //       .tickFormat(d3.timeFormat("%b %d"))
    //   );

    chart.append("g").call(d3.axisLeft(yScale));
  }, [data]);

  return <svg ref={chartRef} style={{ width: "100%", height: "400px" }} />;
}
