import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import Angular from "./components/Angular";
import Drupal from "./components/Drupal";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";
import BuildingButton from "./components/BuildingButton";
import { BuildingContext } from "./BuildingContext";

function saveData(data: any) {
  window.localStorage.setItem("state", JSON.stringify(data));
}

function App() {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);

  const { buildings, countProduction } = useContext(BuildingContext);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await setCount((count) => count + countProduction());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [buildings]);

  useEffect(() => {
    setMaxCount(Math.max(maxCount, count));
  }, [count]);

  const [offsetY, setOffsetY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="App">
      <ViteDefaultTop />
      <div className="card">
        <button
          onClick={() => {
            setIsActive(true);
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </button>
      </div>
      {isActive ? (
        <>
          <div style={{ transform: `translateY(${offsetY * 0.5}px)` }}>
            <Container fluid>
              <Angular />
              <Drupal />
              <BuildingButton id="jquery" image="jQuery.eps" />
            </Container>
          </div>
        </>
      ) : (
        <ViteDefaultBot />
      )}
    </div>
  );
}

export default App;
