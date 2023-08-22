import { useEffect, useState } from "react";

export function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  });

  function onResize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  return { width, height };
}
