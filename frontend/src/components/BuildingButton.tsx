import React, { useContext } from "react";
import logo from "../assets/Game/jQuery.png";
import { BuildingContext, IBuildings } from "../BuildingContext";

export default function BuildingButton(params: { id: string; logo: string }) {
  const { buildings, setBuildings } = useContext(BuildingContext);

  return (
    <button
      onClick={() =>
        setBuildings((buildings: IBuildings) => {
          return {
            ...buildings,
            [params.id]: {
              ...buildings[params.id],
              count: buildings[params.id].count + 1,
            },
          };
        })
      }
      style={{ background: "transparent" }}
    >
      <img height={"50rem"} src={params.logo} />
      <br></br>
      {buildings[params.id].count}
    </button>
  );
}
