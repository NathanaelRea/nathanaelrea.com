import { createContext, useEffect, useState } from "react";
import { useMaxCount } from "./hooks/useMaxCount";

type Building = {
  count: number;
  level: number;
};

type Buildings = {
  [key: string]: Building;
};

// Done like this b/c not sure if I want to update ranking & have local storage
const INITIAL_BUILDINGS: Buildings = {
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

type AppContextProps = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  maxCount: number;
  buildings: Buildings;
  setBuildings: React.Dispatch<React.SetStateAction<Buildings>>;
};

export const AppContext = createContext<AppContextProps>({
  count: 0,
  setCount: () => null,
  maxCount: 0,
  buildings: INITIAL_BUILDINGS,
  setBuildings: () => null,
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { count, setCount, maxCount } = useMaxCount();
  const [buildings, setBuildings] = useState(INITIAL_BUILDINGS);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    function calcProduction() {
      return Object.values(buildings).reduce(
        (acc, building) => acc + Math.pow(10, building.level) * building.count,
        0
      );
    }
    setCount((count) => count + calcProduction());
  }, [seconds]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((i) => i + 1), 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        count,
        setCount,
        maxCount,
        buildings,
        setBuildings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
