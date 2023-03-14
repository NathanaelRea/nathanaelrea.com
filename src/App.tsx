import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
const Home = lazy(() => import("./components/Home"));
const Art = lazy(() => import("./components/Art"));
const Slay = lazy(() => import("./components/Slay"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/art" element={<Art />} />
            <Route path="/slay" element={<Slay />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
