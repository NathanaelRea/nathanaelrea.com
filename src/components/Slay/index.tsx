import type { Hex } from "react-hexgrid";
import { GridGenerator } from "react-hexgrid";
import { playerColors } from "../../data/colors";
import { HEX_DIRECTIONS } from "../../data/constants";
import BaseGrid from "./BaseGrid";

const HEX_GRID_RADIUS = 9;
const HEXES_TO_REMOVE = 75;
const NUM_PLAYERS = 8;

type hexCoords = { q: number; r: number; s: number };

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

type Tree = {
  hex: Hex;
  children: Tree[];
};

class TreeImpl implements Tree {
  hex;
  children;
  constructor(hex: Hex) {
    this.hex = hex;
    this.children = [] as Tree[];
  }
}

export default function Game() {
  const hexes = generateGridWithGaps(HEX_GRID_RADIUS, HEXES_TO_REMOVE);
  const players = distrubuteHexesToPlayers(hexes, NUM_PLAYERS);

  return <BaseGrid players={players} />;
}

// Right now this works as inteded, although currently the code is a bit unreadable
// Requirement: Generate a hex grid of size R and remove N hexes
// Guarantee that for whatever N, we don't create separate 'continents'
// TODO
// Maybe make 'lakes' happen more readily, because they lead to more interesting play
function generateGridWithGaps(hexRadius: number, hexesToRemove: number) {
  const hexes = GridGenerator.hexagon(hexRadius);
  shuffleArray(hexes);

  const hexCoordMap = new Map(
    hexes.map((h) => {
      return [hexCoordsAsStr(h), h];
    })
  );

  // Use center instead of random starting hex
  // Because if we choose a root off to the side, the map can look wonky/lopsided
  const root = new TreeImpl(hexCoordMap.get("0,0,0")!);
  const seen = new Map([[hexCoordsAsStr(root.hex), root]]);
  const frontier = HEX_DIRECTIONS.reduce((acc, d) => {
    const c = { q: root.hex.q + d.q, r: root.hex.r + d.r, s: root.hex.s + d.s };
    const h = hexCoordMap.get(hexCoordsAsStr(c));
    if (h != undefined) acc.push(h);
    return acc;
  }, [] as Hex[]);
  const frontierSet = new Set(frontier.map((h) => hexCoordsAsStr(h)));

  while (frontier.length > 0) {
    const randIndex = Math.floor(Math.random() * frontier.length);
    const tmp = frontier[0];
    frontier[0] = frontier[randIndex];
    frontier[randIndex] = tmp;
    const hex = frontier.shift()!;
    frontierSet.delete(hexCoordsAsStr(hex));
    const node = new TreeImpl(hex);
    seen.set(hexCoordsAsStr(hex), node);
    const nodeNeighbors = HEX_DIRECTIONS.map((d) => {
      return { q: hex.q + d.q, r: hex.r + d.r, s: hex.s + d.s };
    }).filter((c) => hexCoordMap.has(hexCoordsAsStr(c)));
    nodeNeighbors.forEach((c) => {
      if (seen.has(hexCoordsAsStr(c)) || frontierSet.has(hexCoordsAsStr(c)))
        return;
      const h = hexCoordMap.get(hexCoordsAsStr(c));
      if (h == undefined) return;
      frontier.push(h);
      frontierSet.add(hexCoordsAsStr(h));
    });

    const canidateParents = nodeNeighbors.filter((c) =>
      seen.has(hexCoordsAsStr(c))
    );
    const parentCoords = randomChoice(canidateParents);
    const parent = seen.get(hexCoordsAsStr(parentCoords))!;
    parent.children.push(node);
  }

  const hexesOrderedBySpanningTree = [] as Hex[];
  const q = [root];
  while (q.length > 0) {
    const node = q.shift()!;
    hexesOrderedBySpanningTree.push(node.hex);
    node.children.forEach((child) => q.push(child));
  }

  return removeLastN(hexesOrderedBySpanningTree, hexesToRemove);
}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomChoice<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}

function removeLastN<T>(a: T[], n: number) {
  return a.slice(0, -n);
}

function hexCoordsAsStr(hexCoord: hexCoords) {
  return `${hexCoord.q},${hexCoord.r},${hexCoord.s}`;
}

function distrubuteHexesToPlayers(hexes: Hex[], nPlayers: number) {
  const players = [...Array(nPlayers).keys()].map((i) => new PlayerImpl(i));
  hexes.forEach((hex, index) => {
    players[index % nPlayers].hexes.push(hex);
  });
  return players;
}
