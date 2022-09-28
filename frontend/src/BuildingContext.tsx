import { createContext, useState } from "react";

interface IBuilding {
  count: number;
  level: number;
}

//  Angular, Drupal, Jquery, ASP.Net, Symfony, Gatsby, Flask, Laravel, Django, Angular, Rails, Spring, Express, Vue, React, FastAPI, ASP.NETCore, Svelt
export interface IBuildings {
  angular: IBuilding;
  drupal: IBuilding;
  jquery: IBuilding;
}

const buildingDefaults: IBuildings = {
  angular: { count: 0, level: 0 },
  drupal: { count: 0, level: 1 },
  jquery: { count: 0, level: 2 },
};

export const BuildingContext = createContext<{
  buildings: IBuildings;
  setBuildings: React.Dispatch<React.SetStateAction<IBuildings>>;
  countProduction: () => number;
}>({
  buildings: buildingDefaults,
  setBuildings: () => null,
  countProduction: () => {
    console.log("DEFAULT COUNT");
    return 0;
  },
});

export default function BuildingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [buildings, setBuildings] = useState(buildingDefaults);

  const countProduction = () => {
    var acc = 0;
    for (let [building, data] of Object.entries(buildings)) {
      acc += Math.pow(10, data.level) * data.count;
    }
    console.table(buildings);
    console.log("Production: ", acc);
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
