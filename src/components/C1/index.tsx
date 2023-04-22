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
import { svg } from "d3";

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

type ValueHistory = {
  name: string;
  history: TimeSeriesData[];
  totalSpent: number;
  totalValue: number;
};

export function Body() {
  const [portfolio, setPortfolio] = useState(defaultData);

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

  const valueHistory: ValueHistory[] = portfolio.map((p) => {
    if (!Object.hasOwn(timeSeriesMap, p.name))
      return {
        name: p.name,
        history: [],
        totalValue: 0,
        totalSpent: 0,
      } as ValueHistory;
    const market = timeSeriesMap[p.name];
    const history = [] as TimeSeriesData[];
    let totalSpent = 0;
    let buyIndex = 0;
    let cummulativeAmmount = 0;
    const firstBuyDate = p.buyHistory[0].date;
    market.forEach((a) => {
      if (a.date < firstBuyDate) return;
      if (
        buyIndex < p.buyHistory.length - 1 &&
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
      name: p.name,
      history,
      totalValue: history[history.length - 1].value,
      totalSpent,
    } as ValueHistory;
  });
  const valueHistoryLookup = valueHistory.reduce(
    (acc: { [key: string]: ValueHistory }, val) => {
      acc[val.name] = val;
      return acc;
    },
    {}
  );

  const totals = portfolio.map((r) => {
    return {
      symbol: r.symbol,
      total: valueHistoryLookup[r.name],
    };
  });
  const sumTotalValue = totals.reduce(
    (acc, val) => acc + val.total.totalValue,
    0
  );

  const pieChartData = totals.map((p) => {
    return {
      label: p.symbol,
      value: p.total.totalValue / sumTotalValue,
    };
  });

  return (
    <div className="gap-6 m-4 md:p-8 grid grid-cols-1 md:grid-cols-3">
      <div className="col-span-1 md:col-span-3">
        <div className="flex gap-2">
          <h1 className="font-bold text-2xl">Portfolio</h1>
          <button className="bg-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-700">
            Import
          </button>
        </div>
      </div>
      <IndicatorLg name="Current Value" value={cFmt.format(20_000.02)} />
      <IndicatorLg name="Gain" value={cFmt.format(20_000.02)} />
      <IndicatorLg name="Return" value={pFmt2.format(0.02)} />
      <IndicatorSm name="Net Cash Flow" value={cFmt.format(0.02)} />
      <IndicatorSm name="Market Gain" value={cFmt.format(0.02)} />
      <IndicatorSm name="Earned Staking" value={cFmt.format(0.02)} />
      <div className="bg-gray-700 rounded-md p-2 md:col-span-3 col-span-1 lg:col-span-1 aspect-square">
        <PieChart data={pieChartData} />
      </div>
      <div className="bg-gray-800 font-bold text-xl p-2 rounded-md col-span-1 md:col-span-3 lg:col-span-2">
        {/* <TimeSeriesChart data={eth} /> */}
      </div>
      <div className="col-span-1 md:col-span-3">
        <h3 className="font-bold text-xl ">Slices</h3>
        <input className="rounded-sm" placeholder="250" />
        <SliceTableHeader />
        {valueHistory.map((summary) => (
          <SliceTableRow summary={summary} key={summary.name} />
        ))}
      </div>
    </div>
  );
}

function SliceTableHeader() {
  return (
    <div className="grid grid-cols-5 bg-cyan-900 p-2 text-cyan-300 rounded-t-md items-center justify-items-center">
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

function SliceTableRow({ summary }: { summary: ValueHistory }) {
  return (
    <div className="grid grid-cols-5 bg-cyan-950 text-cyan-100 justify-items-center p-1 items-center">
      <div>{summary.name}</div>
      <div>{cFmt.format(summary.totalValue)}</div>
      <div className="flex flex-col items-end">
        <div>{cFmt.format(summary.totalValue - summary.totalSpent)}</div>
        <div>
          {pFmt1.format(
            (summary.totalValue - summary.totalSpent) / summary.totalSpent
          )}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div>Actual</div>
        <div>Target</div>
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const chart = d3.select(chartRef.current);
    const handleResize = () => {
      setDimensions({
        width: chart.node()?.getBoundingClientRect().width ?? 0,
        height: chart.node()?.getBoundingClientRect().height ?? 0,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (chartRef.current == null || data == undefined) return;

    const chart = d3.select(chartRef.current);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, dimensions.width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([dimensions.height, 0]);

    const line = d3
      .line<TimeSeriesData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("d", line);

    chart.append("g").call(d3.axisLeft(yScale));
  }, [data]);

  return <svg ref={chartRef} className="w-full h-full" />;
}

type Data = { label: string; value: number };

function PieChart({ data }: { data: Data[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const chart = d3.select(ref.current);
    const handleResize = () => {
      setDimensions({
        width: chart.node()?.getBoundingClientRect().width ?? 0,
        height: chart.node()?.getBoundingClientRect().height ?? 0,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(ref.current);
    const pie = d3
      .pie<Data>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<Data>>()
      .innerRadius(Math.min(dimensions.height, dimensions.width) / 5)
      .outerRadius(Math.min(dimensions.height, dimensions.width) / 2.5);

    console.log("dims", dimensions);
    console.log("outer:", Math.min(dimensions.width, dimensions.height) / 4);

    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10);

    const arcs = pie(data);

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.width / 2}, ${dimensions.height / 2})`
      );

    g.selectAll("path")
      .data(arcs)
      .join("path")
      .attr("fill", (d) => color(d.data.label))
      .attr("d", arc)
      .append("title")
      .text((d) => `${d.data.label}: ${d.data.value}`);
  }, [data]);

  return <svg ref={ref} className="w-full h-full" />;
}
