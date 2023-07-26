import { useEffect } from "react";

export default function Redirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.href = href;
  }, []);

  return (
    <div>
      Redirecting to{" "}
      <a className="text-blue-500" href={href}>
        {href}
      </a>
    </div>
  );
}
