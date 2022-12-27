import { useEffect, useState } from "react";

export function useMaxCount() {
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    setMaxCount(Math.max(maxCount, count));
  }, [count]);

  return { count, setCount, maxCount };
}
