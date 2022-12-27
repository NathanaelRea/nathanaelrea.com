import { useContext } from "react";
import "./App.css";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";
import Building from "./components/Building";
import { AppContext } from "./AppContext";

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
  const { count, setCount, maxCount } = useContext(AppContext);

  return (
    <div className="App">
      <ViteDefaultTop />
      <div className="card">
        <button
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </button>
      </div>
      {maxCount > 0 ? (
        <>
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
        </>
      ) : (
        <ViteDefaultBot />
      )}
    </div>
  );
}

export default App;
