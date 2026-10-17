import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";

const PitchPage = lazy(() => import("@/features/pitch/PitchPage").then((module) => ({ default: module.PitchPage })));

function Deferred({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="route-loading" aria-live="polite">Loading the pitch…</div>}>{children}</Suspense>;
}

function RedirectToDeck() {
  const location = useLocation();
  return <Navigate replace to={`/deck${location.search}${location.hash}`} />;
}

export const router = createBrowserRouter([
  { path: "/", element: <RedirectToDeck /> },
  { path: "/deck", element: <Deferred><PitchPage /></Deferred> },
  { path: "/pitch", element: <RedirectToDeck /> },
  { path: "*", element: <RedirectToDeck /> },
]);
