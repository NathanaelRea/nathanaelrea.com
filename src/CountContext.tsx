import { createContext } from "react";

interface ICounts {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  maxCount: number;
}

export const CountContext = createContext<ICounts>({
  count: 0,
  setCount: () => null,
  maxCount: 0,
});
