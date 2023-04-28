import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LoadingDots from "./components/LoadingDots";
const Home = lazy(() => import("./features/Home"));
const Art = lazy(() => import("./features/Art"));
const Slay = lazy(() => import("./features/Slay"));
const C1 = lazy(() => import("./features/C1"));

const queryClient = new QueryClient();

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingDots />}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/art" element={<Art />} />
              <Route path="/c1" element={<C1 />} />
              <Route path="/slay" element={<Slay />} />
            </Route>
          </Routes>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </Suspense>
    </BrowserRouter>
  );
}
