import { currencyFormat, defaultData, percentFormat } from "./data";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { addDays } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowsPointingInIcon } from "@heroicons/react/24/solid";

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

type TimeSeriesData = {
  date: Date;
  value: number;
};

const getMarketHistory = async (name: string) => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=max`
  );
  return res.data as MarketChartResponse;
};

type Asset = {
  symbol: string;
  name: string;
  history: TimeSeriesData[];
  totalSpent: number;
  totalValue: number;
  percentTarget: number;
};

type Slice = {
  symbol: string;
  totalValue: number;
  gain: number;
  return: number;
  targetPercent: number;
  actualPercent: number;
};

type TargetPercent = {
  [key: string]: number;
};

type FlatTransactions = { date: Date; value: number; name: string };

function Gain(value: number, cost: number) {
  return value - cost;
}
function Return(value: number, cost: number) {
  return (value - cost) / cost;
}

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

  const slices: Slice[] = assets.map((a) => {
    return {
      symbol: a.symbol,
      totalValue: a.totalValue,
      gain: Gain(a.totalValue, a.totalSpent),
      return: Return(a.totalValue, a.totalSpent),
      targetPercent: a.percentTarget,
      actualPercent: a.totalValue / sumTotalValue,
    };
  });

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
          name: p.name,
        } as FlatTransactions;
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
          <IndicatorLg name="Current Value">
            <Money value={sumTotalValue} />
          </IndicatorLg>
          <IndicatorLg name="Gain">
            <ColorMoney value={Gain(sumTotalValue, sumTotalCost)} />
          </IndicatorLg>
          <IndicatorLg name="Return">
            <ColorPercent value={Return(sumTotalValue, sumTotalCost)} />
          </IndicatorLg>
          <IndicatorSm name="Net Cash Flow">
            <Money value={sumTotalCost} />
          </IndicatorSm>
          <IndicatorSm name="Market Gain">
            <ColorMoney value={Gain(sumTotalValue, sumTotalCost)} />
          </IndicatorSm>
          <IndicatorSm name="Earned Staking">
            <ColorMoney value={0} />
          </IndicatorSm>
        </div>
        <div className="bg-gray-700 rounded-md p-2 aspect-square self-center">
          {isLoading ? <Loading /> : <PieChart slices={slices} />}
        </div>
        <div className="bg-gray-800 font-bold text-xl p-2 rounded-md col-span-2">
          {isLoading ? <Loading /> : <TimeSeriesChart data={timeSeriesData} />}
        </div>
        <div className="col-span-2 sm:col-span-3">
          <h3 className="font-bold text-xl ">Slices</h3>
          <input className="rounded-sm" placeholder="250" />
          <SliceTableHeader />
          {isLoading ? (
            <Loading />
          ) : (
            slices.map((slice) => (
              <SliceTableRow slice={slice} key={slice.symbol} />
            ))
          )}
        </div>
        <div className="col-span-2 sm:col-span-3">
          <h3 className="font-bold text-xl ">Transactions</h3>
          <TransactionTableHeader />
          {flatTransactions.map((t) => (
            <div
              key={`${t.name}-${t.date}-${t.value}`}
              className="grid grid-cols-3 bg-cyan-950 text-cyan-100 justify-items-center p-1 items-center"
            >
              <div>{t.name}</div>
              <div>{t.date.toDateString()}</div>
              <div>{t.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionTableHeader() {
  return (
    <div className="grid grid-cols-3 bg-cyan-900 p-2 text-cyan-300 rounded-t-md items-center justify-items-center">
      <div>Name</div>
      <div>Date</div>
      <div>Value</div>
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

function SliceTableRow({ slice }: { slice: Slice }) {
  return (
    <div className="grid grid-cols-5 bg-cyan-950 text-cyan-100 justify-items-center p-1 items-center">
      <div>{slice.symbol}</div>
      <ColorMoney value={slice.totalValue} />
      <div className="flex flex-col items-end">
        <ColorMoney value={slice.gain} />
        <ColorPercent value={slice.return} />
      </div>
      <div className="flex flex-col items-end">
        <ColorPercent value={slice.actualPercent} />
        <ColorPercent value={slice.targetPercent} />
      </div>
      <div>...</div>
    </div>
  );
}

function Money({ value }: { value: number }) {
  return <div className="text-white">{currencyFormat(value)}</div>;
}
function ColorMoney({ value }: { value: number }) {
  if (value > 0)
    return <div className="text-green-500">{currencyFormat(value)}</div>;
  else if (value < 0)
    return <div className="text-red-500">{currencyFormat(value)}</div>;
  else return <div className="text-white">{currencyFormat(value)}</div>;
}
function ColorPercent({ value }: { value: number }) {
  if (value > 0)
    return <div className="text-green-500">{percentFormat(value)}</div>;
  else if (value < 0)
    return <div className="text-red-500">{percentFormat(value)}</div>;
  else return <div className="text-white">{percentFormat(value)}</div>;
}

function IndicatorLg({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-gray-400">{name}</div>
      <div className="text-4xl">{children}</div>
    </div>
  );
}

function IndicatorSm({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-gray-400">{name}</div>
      <div className="text-lg">{children}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-shrink">
      <div
        className="animate-bounce transform -translate-y-1/4"
        style={{
          animationDelay: "250ms",
        }}
      >
        .
      </div>
      <div
        className="animate-bounce transform -translate-y-1/4"
        style={{
          animationDelay: "500ms",
        }}
      >
        .
      </div>
      <div
        className="animate-bounce transform -translate-y-1/4"
        style={{
          animationDelay: "750ms",
        }}
      >
        .
      </div>
    </div>
  );
}

function TimeSeriesChart({ data }: { data: TimeSeriesData[] | undefined }) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const { dimensions } = useBoundingRect(chartRef);
  const margin = 10;

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
      .range([dimensions.height - margin, margin]);

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

    return () => {
      chart.selectAll("*").remove();
    };
  }, [data, dimensions]);

  const [mousePosition, setMousePosition] = useState<[number, number] | null>([
    0, 0,
  ]);

  // TODO fix
  const xScaleasdfasdf = useMemo(
    () =>
      data == null
        ? null
        : d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.date) as [Date, Date])
            .range([0, dimensions.width]),
    [data, dimensions]
  );
  const yScaleasdfasdf = useMemo(
    () =>
      data == null
        ? null
        : d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value) || 0])
            .range([dimensions.height - margin, margin]),
    [data, dimensions]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (data == null || xScaleasdfasdf == null) {
        setHighlighted(null);
        setMousePosition(null);
        return;
      }

      const bisect = d3.bisector((d: TimeSeriesData) => d.date).left;
      const { offsetX: mouseX, offsetY: mouseY } = event.nativeEvent;
      const xValue = xScaleasdfasdf.invert(mouseX);
      const index = bisect(data, xValue, 0);

      setHighlighted(index);
      setMousePosition([mouseX, mouseY]);
    },
    [setHighlighted, data, dimensions, setMousePosition]
  );

  const handleMouseLeave = () => {
    setHighlighted(null);
    setMousePosition(null);
  };
  const circleDiameter = 10;
  const rectWidth = 24;

  const curData =
    data == null || highlighted == null ? null : data[highlighted];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg ref={chartRef} className="w-full h-full" />
      <AnimatePresence>
        {data != null && mousePosition != null && curData != null && (
          <>
            <motion.div
              className={`absolute bg-white pointer-events-none h-full top-0`}
              style={{ width: rectWidth }}
              initial={{ opacity: 0, left: 0 }}
              animate={{
                opacity: 0.25,
                left: mousePosition[0] - rectWidth / 2,
                transition: { duration: 0 },
              }}
              exit={{
                opacity: 0,
                left: dimensions.width - rectWidth / 2,
                transition: { duration: 0.25, ease: "easeIn" },
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.div
              className={`absolute bg-white pointer-events-none rounded-full z-10`}
              style={{ width: circleDiameter, height: circleDiameter }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: xScaleasdfasdf
                  ? xScaleasdfasdf(curData.date) - circleDiameter / 2
                  : 0,
                top: yScaleasdfasdf
                  ? yScaleasdfasdf(curData.value) - circleDiameter / 2
                  : 0,
                transition: { duration: 0 },
              }}
              exit={{
                opacity: 0,
              }}
            />
            <motion.div
              className="absolute top-0 left-0 pointer-events-none"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: "-100%",
                transition: { ease: "easeIn" },
              }}
              transition={{ ease: "easeOut" }}
            >
              <p>{curData.date.toLocaleDateString()}</p>
              <p>{currencyFormat(curData.value)}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div
        className="absolute top-0 left-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

type Data = { label: string; value: number };

function PieChart({ slices }: { slices: Slice[] }) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const { dimensions } = useBoundingRect(chartRef);

  const maxDiameter = Math.min(dimensions.height, dimensions.width);
  const innerRadius = maxDiameter / 3.5;
  const minRadius = maxDiameter / 3;
  const maxRadius = maxDiameter / 2.25;
  const radiusDelta = maxRadius - minRadius;

  const data = slices.map((s) => {
    return {
      label: s.symbol,
      value: s.actualPercent,
    };
  });
  const targetPercent = slices.reduce((acc: TargetPercent, val) => {
    acc[val.symbol] = val.targetPercent;
    return acc;
  }, {});

  const handleMouseOver = useCallback(
    function (e: MouseEvent, d: d3.PieArcDatum<Data>) {
      setHighlighted(d.index);
    },
    [setHighlighted]
  );

  const handleMouseOut = useCallback(
    function () {
      setHighlighted(null);
    },
    [setHighlighted]
  );

  function calculateWeight(target: number, actual: number) {
    if (actual == 0) return 0;
    const weight = (actual - target) / actual;
    return (Math.min(Math.max(weight, -1), 1) + 1) / 2;
  }

  useEffect(() => {
    if (chartRef.current == null || data == undefined) return;

    const svg = d3.select(chartRef.current);

    const pie = d3
      .pie<Data>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<Data>>()
      .innerRadius(innerRadius)
      .outerRadius(
        (d) =>
          minRadius +
          radiusDelta *
            calculateWeight(targetPercent[d.data.label], d.data.value)
      );

    const color = d3.scaleOrdinal<string, string>(d3.schemeDark2);
    const getHighlightedColor = (d: d3.PieArcDatum<Data>, index: number) => {
      const hslColor = d3.hsl(color(d.data.label));
      return highlighted === index
        ? hslColor.brighter(0.25).toString()
        : hslColor.toString();
    };

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.width / 2}, ${dimensions.height / 2})`
      );

    const paths = chart
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path");

    paths
      .attr("d", arc)
      .attr("fill", (d, i) => getHighlightedColor(d, i))
      .on("mouseenter", handleMouseOver)
      .on("mouseleave", handleMouseOut);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, highlighted, dimensions, handleMouseOut, handleMouseOver]);

  const curData = highlighted == null ? null : data[highlighted];

  return (
    <div className="relative w-full h-full">
      <svg ref={chartRef} className="w-full h-full" />
      {curData != null && (
        <div
          className={`absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none`}
        >
          <div className="text-center">
            <div>{curData.label}</div>
            <div>{percentFormat(curData.value)}</div>
            <div className="flex items-center">
              <ArrowsPointingInIcon className="h-3" />
              <div>{percentFormat(targetPercent[curData.label])}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useBoundingRect(chartRef: RefObject<SVGSVGElement>) {
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

  return { dimensions };
}
