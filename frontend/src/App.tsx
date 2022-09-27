import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import Angular from "./components/Angular";
import Drupal from "./components/Drupal";

import { ViteDefaultTop, ViteDefaultBot } from "./components/ViteDefault";

// Go through js frameworks as 'buildings'
//  Angular, Drupal, Jquery, ASP.Net, Symfony, Gatsby, Flask, Laravel, Django, Angular, Rails, Spring, Express, Vue, React, FastAPI, ASP.NETCore, Svelt

// paralax scroll down, show links
// Router: Art, not much else lol

function saveData(data: any) {
  window.localStorage.setItem("state", JSON.stringify(data));
}

function initData() {
  const newData = window.localStorage.getItem("state");
  if (true) {
    console.log("no data");
    return {
      isActive: false,
      count: 0,
      data: [0, 0, 0],
    };
  } else {
    console.log("found data");
    console.log(newData);
    return JSON.parse(newData);
  }
}

const loadedData = initData();

function App() {
  const [{ isActive, count, data: data }, setData] = useState(loadedData);

  useEffect(() => {
    const countBuildingProduction = () => {
      setData((prvState: any) => {
        // Use StructuredClone b/c we need to access the property via variable
        // Can't just return {...prvState, [id]: prvState.data[id] + acc} b/c it's nested
        const newState = structuredClone(prvState);
        for (var i = 0; i < newState.data.length; i++) {
          newState.count += Math.pow(10, i) * newState.data[i];
        }
        return newState;
      });
    };

    const intervalId = setInterval(() => {
      countBuildingProduction();
      //saveData({ isActive, count, data });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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
            setData((prvState: any) => {
              const newState = structuredClone(prvState);
              newState.count += 1;
              newState.isActive = true;
              return newState;
            });
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
