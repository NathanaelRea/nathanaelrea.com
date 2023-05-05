import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  RefObject,
} from "react";
import { currencyFormat2, percentFormat1 } from "./money";
import { ArrowsPointingInIcon } from "@heroicons/react/24/solid";
import { Slice, CoinbaseTransaction } from ".";

type Data = { label: string; value: number };

type TargetPercent = {
  [key: string]: number;
};

export function TimeSeriesChart({
  data,
}: {
  data: CoinbaseTransaction[] | undefined;
}) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const { dimensions } = useBoundingRect(chartRef);
  const margin = 10;

  useEffect(() => {
    if (chartRef.current == null || data == undefined) return;

    const chart = d3.select(chartRef.current);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.timestamp) as [Date, Date])
      .range([0, dimensions.width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([dimensions.height - margin, margin]);

    const line = d3
      .line<CoinbaseTransaction>()
      .x((d) => xScale(d.timestamp))
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
            .domain(d3.extent(data, (d) => d.timestamp) as [Date, Date])
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

      const bisect = d3.bisector((d: CoinbaseTransaction) => d.timestamp).left;
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
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.25,
                left: xScaleasdfasdf
                  ? xScaleasdfasdf(curData.timestamp) - rectWidth / 2
                  : 0,
              }}
              exit={{
                opacity: 0,
                transition: { ease: "easeOut" },
              }}
              transition={{
                duration: 0,
              }}
            />
            <motion.div
              className={`absolute bg-white pointer-events-none rounded-full z-10`}
              style={{ width: circleDiameter, height: circleDiameter }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: xScaleasdfasdf
                  ? xScaleasdfasdf(curData.timestamp) - circleDiameter / 2
                  : 0,
                top: yScaleasdfasdf
                  ? yScaleasdfasdf(curData.value) - circleDiameter / 2
                  : 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0 }}
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
              <p>{curData.timestamp.toLocaleDateString()}</p>
              <p>{currencyFormat2(curData.value)}</p>
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

export function PieChart({ slices }: { slices: Slice[] }) {
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
    function (_: MouseEvent, d: d3.PieArcDatum<Data>) {
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
        ? hslColor.brighter(0.5).toString()
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
            <div>{percentFormat1(curData.value)}</div>
            <div className="flex items-center">
              <ArrowsPointingInIcon className="h-3" />
              <div>{percentFormat1(targetPercent[curData.label])}</div>
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
