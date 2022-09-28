import { useContext, useState } from "react";
import logo from "../assets/Game/vue.svg";
import { BuildingContext, IBuildings } from "../BuildingContext";

export default function BuildingButton(params: any) {
  return (
    <button
      onClick={() =>
        params.setBuildings((buildings: IBuildings) => {
          return {
            ...buildings,
            jquery: {
              ...buildings.jquery,
              count: buildings.jquery.count + 1,
            },
          };
        })
      }
      style={{ background: "transparent" }}
    >
      <img height={"50rem"} src={logo} />
      <br></br>
      {params.buildings.jquery.count}
    </button>
  );
}
