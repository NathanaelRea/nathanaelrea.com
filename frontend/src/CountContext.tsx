import { createContext } from "react";

interface ICounts {
  count: number;
  maxCount: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

export const CountContext = createContext<ICounts>({
  count: 0,
  maxCount: 0,
  setCount: () => null,
});
