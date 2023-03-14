export default function Home() {
  const links = [
    {
      url: "https://github.com/NathanaelRea",
      name: "Github",
    },
    {
      url: "https://linkedin.com/in/NathanaelRea",
      name: "Linkedin",
    },
  ];

  return (
    <div className="flex flex-col items-center m-12 gap-4">
      Hi!
      {links.map((link) => {
        return (
          <a href={link.url} key={link.name} className="text-cyan-500">
            {link.name}
          </a>
        );
      })}
    </div>
  );
}
