import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PitchPage } from "./features/pitch/PitchPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PitchPage />
  </StrictMode>,
);
