import { Outlet, Link } from "react-router-dom";
import logo from "../../src/home.png";

export default function Layout() {
  return (
    <>
      <nav className="bg-zinc-900 w-full fixed z-50">
        <div className="flex justify-around items-center p-4">
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
