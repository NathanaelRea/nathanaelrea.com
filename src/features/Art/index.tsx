import bell from "../assets/Art/BELL.png";
import eun from "../assets/Art/mac_n_eun.png";
import margot from "../assets/Art/margot.png";
import sunshine from "../assets/Art/ray_of_sun.png";
import muteSmash from "../assets/Art/Super_Smash_Bros_Mute.png";
import unwise from "../assets/Art/UNWISE.png";

export default function Art() {
  return (
    <div className="flex flex-col w-screen items-center">
      <div className="w-full lg:w-1/2 gap-10 lg:gap-20 flex flex-col">
        <img src={margot} alt="margot" />
        <img src={eun} alt="eun" />
        <img src={sunshine} alt="sunshine" />
        <img src={bell} alt="bell" />
        <img src={muteSmash} alt="mute bros smash" />
        <img src={unwise} alt="unwise" />
      </div>
    </div>
  );
}
