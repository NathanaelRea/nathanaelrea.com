import type { Hex } from "react-hexgrid";
import { GridGenerator } from "react-hexgrid";
import { playerColors } from "../../data/colors";
import BaseGrid from "./BaseGrid";

export type Player = {
  id: number;
  color: string;
  hexes: Hex[];
};

class PlayerImpl implements Player {
  id;
  color;
  hexes;
  constructor(id: number) {
    this.id = id;
    this.color = playerColors[id];
    this.hexes = [] as Hex[];
  }
}

export default function () {
  const hexRadius = 8;
  const hexesToRemove = 75;
  const hexes = GridGenerator.hexagon(hexRadius);
  shuffleArray(hexes);
  hexes.splice(0, hexesToRemove);

  const nPlayers = 8;
  const players = [...Array(nPlayers).keys()].map((i) => new PlayerImpl(i));
  hexes.forEach((hex, index) => {
    players[index % nPlayers].hexes.push(hex);
  });

  function shuffleArray(array: Hex[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return <BaseGrid players={players} />;
}
