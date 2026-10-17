import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { DataDeletionPage } from "@/pages/DataDeletionPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const ScoutPage = lazy(() => import("@/features/scout/ScoutPage").then((module) => ({ default: module.ScoutPage })));
const PitchPage = lazy(() => import("@/features/pitch/PitchPage").then((module) => ({ default: module.PitchPage })));

function Deferred({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="route-loading" aria-live="polite">Loading the atlas…</div>}>{children}</Suspense>;
}

function Frame({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function LegacyDeckRedirect() {
  const location = useLocation();
  return <Navigate replace to={`/pitch${location.search}${location.hash}`} />;
}

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/scout", element: <Frame><Deferred><ScoutPage /></Deferred></Frame> },
  { path: "/pitch", element: <Frame><Deferred><PitchPage /></Deferred></Frame> },
  { path: "/deck", element: <LegacyDeckRedirect /> },
  { path: "/privacy", element: <Frame><PrivacyPage /></Frame> },
  { path: "/data-deletion", element: <Frame><DataDeletionPage /></Frame> },
  { path: "*", element: <Frame><NotFoundPage /></Frame> },
]);
