import i1 from "./images/2023-08-16.1.jpg";
import i2 from "./images/2024-01-06.1.jpg";
import i3 from "./images/2024-01-19.1.jpg";
import i4 from "./images/2024-01-19.2.jpg";
import i5 from "./images/2024-01-20.1.jpg";
import i6 from "./images/2024-01-20.2.jpg";

export default function Photos() {
  const images = [i1, i2, i3, i4, i5, i6];
  return (
    <div className="flex flex-col w-screen items-center">
      <div className="w-full lg:w-1/2 gap-10 lg:gap-20 flex flex-col">
        {images.reverse().map((i) => (
          <img key={i.src} src={i.src} />
        ))}
      </div>
    </div>
  );
}
