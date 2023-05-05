import logo from "../../src/home.png";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav className="bg-zinc-900 fixed z-50 w-full">
        <div className="flex items-center justify-around p-4">
          <Link to="/">
            <img src={logo} alt="nr-logo" />
          </Link>
          <Link to="/art">Art</Link>
          <Link to="/c1">C1 (wip)</Link>
          <Link to="/slay">Slay (wip)</Link>
        </div>
      </nav>
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}
