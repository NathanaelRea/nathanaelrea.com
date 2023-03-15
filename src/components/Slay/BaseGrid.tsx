import { HexGrid, Layout, Hexagon } from "react-hexgrid";
import type { Player } from ".";
import { useWindowSize } from "../../hooks/useWindowSize";

export default function BaseGrid({ players }: { players: Player[] }) {
  const { width, height } = useWindowSize();
  const navHeight = 64;

  return (
    <div className="flex justify-center">
      <HexGrid
        width={width}
        height={height - navHeight}
        className="overflow-hidden"
      >
        <Layout size={{ x: 3, y: 3 }}>
          {players.flatMap((player) =>
            player.hexes.map((hex, hexIndex) => (
              <Hexagon
                key={`${player.id}${hexIndex}`}
                q={hex.q}
                r={hex.r}
                s={hex.s}
                cellStyle={{
                  fill: player.color,
                  stroke: "black",
                  strokeWidth: ".01rem",
                  strokeOpacity: 0.5,
                }}
              ></Hexagon>
            ))
          )}
        </Layout>
      </HexGrid>
    </div>
  );
}
