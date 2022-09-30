import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";
import Building from "./components/Building";
import { BuildingContext, IBuildings } from "./BuildingContext";
import { CountContext } from "./CountContext";

// :(
import angularLogo from "./assets/Game/angular.svg";
import drupalLogo from "./assets/Game/drupal.svg";
import jQueryLogo from "./assets/Game/jQuery.png";
import aspNetLogo from "./assets/Game/asp.net.png";
import symfonyLogo from "./assets/Game/symfony.svg";
import gatsbyLogo from "./assets/Game/gatsby.svg";
import flaskLogo from "./assets/Game/flask.svg";
import laravelLogo from "./assets/Game/laravel.svg";
import djangoLogo from "./assets/Game/django.png";
import railsLogo from "./assets/Game/rails.svg";
import springLogo from "./assets/Game/spring.svg";
import expressLogo from "./assets/Game/express.png";
import vueLogo from "./assets/Game/vue.svg";
import reactLogo from "./assets/Game/react.svg";
import fastApiLogo from "./assets/Game/fastapi.png";
import aspNetCoreLogo from "./assets/Game/asp.net.core.svg";
import svelteLogo from "./assets/Game/svelte.svg";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    setMaxCount(Math.max(maxCount, count));
  }, [count]);

  // Hacky workaround to allow re-mounding with [buildings] not reset basic setInterval
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
        <>
          <div>
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
          </div>
        </>
      ) : (
        <ViteDefaultBot />
      )}
    </div>
  );
}

export default App;
