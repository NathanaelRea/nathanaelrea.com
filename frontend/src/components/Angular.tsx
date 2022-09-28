import { useState } from "react";
import logo from "../assets/Game/angular.svg";

export default function Angular() {
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => setCount((count) => count + 1)}
      style={{ background: "transparent" }}
      disabled={false}
    >
      <img height={"50rem"} src={logo} />
      <br></br>
      {count}
    </button>
  );
}
