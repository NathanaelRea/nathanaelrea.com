import type { Hex } from "react-hexgrid";
import { GridGenerator } from "react-hexgrid";
import Asdf from "./Game";

export default function () {
  const hexes = GridGenerator.hexagon(8);
  shuffleArray(hexes);
  hexes.splice(0, 50);

  const nPlayers = 8;
  const players = {} as { [key: number]: Hex[] };
  hexes.forEach((hex, index) => {
    if (!(index % nPlayers in players)) players[index % nPlayers] = [];
    players[index % nPlayers].push(hex);
  });

  function shuffleArray(array: Hex[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  return <Asdf hexes={players} />;
}
