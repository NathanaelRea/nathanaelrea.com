import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import "./App.css";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";
import Building from "./components/Building";
import { BuildingContext } from "./BuildingContext";
import { CountContext } from "./CountContext";

import {
  angularLogo,
  aspNetCoreLogo,
  aspNetLogo,
  djangoLogo,
  drupalLogo,
  expressLogo,
  fastApiLogo,
  flaskLogo,
  gatsbyLogo,
  jQueryLogo,
  laravelLogo,
  railsLogo,
  reactLogo,
  springLogo,
  svelteLogo,
  symfonyLogo,
  vueLogo,
} from "./assets/Game";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    setMaxCount(Math.max(maxCount, count));
  }, [count]);

  // Hacky workaround to allow re-mounting with [buildings] and not reset basic setInterval
  const { buildings, countProduction } = useContext(BuildingContext);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  useEffect(() => {
    const setCountFromProduction = () => {
      if (Date.now() - lastUpdate <= 1000) return;
      setLastUpdate(Date.now());
      setCount((count) => count + countProduction());
    };
    setCountFromProduction();
    const intervalId = setInterval(() => {
      setCountFromProduction();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [buildings]);

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
        <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }}>
          <Container fluid>
            <CountContext.Provider value={{ count, setCount, maxCount }}>
              <Building id="angular" logo={angularLogo} />
              <Building id="drupal" logo={drupalLogo} />
              <Building id="jquery" logo={jQueryLogo} />
              <Building id="aspNet" logo={aspNetLogo} />
              <Building id="symfony" logo={symfonyLogo} />
              <Building id="gatsby" logo={gatsbyLogo} />
              <Building id="flask" logo={flaskLogo} />
              <Building id="laravel" logo={laravelLogo} />
              <Building id="django" logo={djangoLogo} />
              <Building id="rails" logo={railsLogo} />
              <Building id="spring" logo={springLogo} />
              <Building id="express" logo={expressLogo} />
              <Building id="vue" logo={vueLogo} />
              <Building id="react" logo={reactLogo} />
              <Building id="fastApi" logo={fastApiLogo} />
              <Building id="aspNetCore" logo={aspNetCoreLogo} />
              <Building id="svelte" logo={svelteLogo} />
            </CountContext.Provider>
          </Container>
        </motion.div>
      ) : (
        <ViteDefaultBot />
      )}
    </div>
  );
}

export default App;
