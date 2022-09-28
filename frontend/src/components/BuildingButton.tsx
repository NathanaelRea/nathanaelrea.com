import { useContext } from "react";
import logo from "../assets/Game/jQuery.png";
import { BuildingContext, IBuildings } from "../BuildingContext";

export default function BuildingButton(params: any) {
  const { buildings, setBuildings } = useContext(BuildingContext);

  return (
    <button
      onClick={() =>
        setBuildings((buildings: IBuildings) => {
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
      {buildings.jquery.count}
    </button>
  );
}
