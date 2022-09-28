import { useState } from "react";
import logo from "../assets/Game/drupal.svg";

export default function Drupal() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((count) => count + 1)}>
      <img height={"50rem"} src={logo} />
      <br></br>
      {count}
    </button>
  );
}
