import bell from "./images/BELL.png";
import eun from "./images/mac_n_eun.png";
import margot from "./images/margot.png";
import sunshine from "./images/ray_of_sun.png";
import muteSmash from "./images/Super_Smash_Bros_Mute.png";
import unwise from "./images/UNWISE.png";

export default function Art() {
  return (
    <div className="flex flex-col w-screen items-center">
      <div className="w-full lg:w-1/2 gap-10 lg:gap-20 flex flex-col">
        <img src={margot.src} alt="margot" />
        <img src={eun.src} alt="eun" />
        <img src={sunshine.src} alt="sunshine" />
        <img src={bell.src} alt="bell" />
        <img src={muteSmash.src} alt="mute bros smash" />
        <img src={unwise.src} alt="unwise" />
      </div>
    </div>
  );
}
