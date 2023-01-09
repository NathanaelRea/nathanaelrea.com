import { useEffect, useState } from "react";
import type { Hex } from "react-hexgrid";
import { HexGrid, Layout, Hexagon } from "react-hexgrid";

// export default function ({ hexes }: { hexes: Hex[] }) {
export default function ({ hexes }: { hexes: { [key: number]: Hex[] } }) {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  });

  function onResize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  const playerColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "black",
    "white",
  ];

  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <HexGrid width={width} height={height}>
        <Layout size={{ x: 3, y: 3 }}>
          {Object.values(hexes).flatMap((hexList, index) =>
            hexList.map((hex, i) => (
              <Hexagon
                key={i}
                q={hex.q}
                r={hex.r}
                s={hex.s}
                cellStyle={{ fill: playerColors[index] }}
              ></Hexagon>
            ))
          )}
        </Layout>
      </HexGrid>
    </div>
  );
}
