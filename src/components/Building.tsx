import { useContext } from "react";
import { AppContext } from "../AppContext";

type BuildingProps = {
  id: string;
  logo: string;
};

export default function BuildingButton({ id, logo }: BuildingProps) {
  const { count, setCount, maxCount, buildings, setBuildings } =
    useContext(AppContext);

  const price = Math.pow(10, buildings[id].level + 1);
  const canBuy = count >= price;
  const showBuilding = maxCount >= price / 10;

  function incrementThisBuilding() {
    setCount((count) => count - price);
    setBuildings((buildings) => {
      return {
        ...buildings,
        [id]: {
          ...buildings[id],
          count: buildings[id].count + 1,
        },
      };
    });
  }

  return showBuilding ? (
    <button
      className="btn-building"
      onClick={incrementThisBuilding}
      disabled={!canBuy}
    >
      <img height={"50rem"} src={logo} />
      <br />
      {buildings[id].count}
    </button>
  ) : null;
}
