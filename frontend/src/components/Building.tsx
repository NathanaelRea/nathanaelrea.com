import React, { useContext } from "react";
import { BuildingContext } from "../BuildingContext";
import { CountContext } from "../CountContext";

export default function BuildingButton(params: { id: string; logo: string }) {
  const { buildings, setBuildings } = useContext(BuildingContext);
  const { count, setCount, maxCount } = useContext(CountContext);

  const price = Math.pow(10, buildings[params.id].level + 1);
  const canBuy = count >= price;
  const showBuilding = maxCount >= price / 10;

  const incrementThisBuilding = () => {
    setBuildings((buildings) => {
      setCount((count) => count - price);
      return {
        ...buildings,
        [params.id]: {
          ...buildings[params.id],
          count: buildings[params.id].count + 1,
        },
      };
    });
  };

  return showBuilding ? (
    <button
      onClick={incrementThisBuilding}
      style={{ background: "transparent" }}
      disabled={!canBuy}
    >
      <img height={"50rem"} src={params.logo} />
      <br></br>
      {buildings[params.id].count}
    </button>
  ) : (
    <></>
  );
}
