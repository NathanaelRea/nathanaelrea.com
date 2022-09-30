import { createContext, useEffect, useState } from "react";

interface IBuilding {
  count: number;
  level: number;
}

export interface IBuildings {
  [key: string]: IBuilding;
}

const buildingDefaults: IBuildings = {
  angular: { count: 0, level: 0 },
  drupal: { count: 0, level: 1 },
  jquery: { count: 0, level: 2 },
  aspNet: { count: 0, level: 3 },
  symfony: { count: 0, level: 4 },
  gatsby: { count: 0, level: 5 },
  flask: { count: 0, level: 6 },
  laravel: { count: 0, level: 7 },
  django: { count: 0, level: 8 },
  rails: { count: 0, level: 9 },
  spring: { count: 0, level: 10 },
  express: { count: 0, level: 11 },
  vue: { count: 0, level: 12 },
  react: { count: 0, level: 13 },
  fastApi: { count: 0, level: 14 },
  aspNetCore: { count: 0, level: 15 },
  svelte: { count: 0, level: 16 },
};

export const BuildingContext = createContext<{
  buildings: IBuildings;
  setBuildings: React.Dispatch<React.SetStateAction<IBuildings>>;
  countProduction: () => number;
}>({
  buildings: buildingDefaults,
  setBuildings: () => null,
  countProduction: () => 0,
});

export default function BuildingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [buildings, setBuildings] = useState(buildingDefaults);

  const countProduction = () => {
    var acc = 0;
    for (let data of Object.values(buildings)) {
      acc += Math.pow(10, data.level) * data.count;
    }
    return acc;
  };

  return (
    <BuildingContext.Provider
      value={{ buildings, setBuildings, countProduction }}
    >
      {children}
    </BuildingContext.Provider>
  );
}
