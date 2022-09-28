import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";
import BuildingButton from "./components/BuildingButton";
import { BuildingContext } from "./BuildingContext";

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
              <BuildingButton id="angular" logo={angularLogo} />
              <BuildingButton id="drupal" logo={drupalLogo} />
              <BuildingButton id="jquery" logo={jQueryLogo} />
              <BuildingButton id="aspNet" logo={aspNetLogo} />
              <BuildingButton id="symfony" logo={symfonyLogo} />
              <BuildingButton id="gatsby" logo={gatsbyLogo} />
              <BuildingButton id="flask" logo={flaskLogo} />
              <BuildingButton id="laravel" logo={laravelLogo} />
              <BuildingButton id="django" logo={djangoLogo} />
              <BuildingButton id="rails" logo={railsLogo} />
              <BuildingButton id="spring" logo={springLogo} />
              <BuildingButton id="express" logo={expressLogo} />
              <BuildingButton id="vue" logo={vueLogo} />
              <BuildingButton id="react" logo={reactLogo} />
              <BuildingButton id="fastApi" logo={fastApiLogo} />
              <BuildingButton id="aspNetCore" logo={aspNetCoreLogo} />
              <BuildingButton id="svelte" logo={svelteLogo} />
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
