import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import React from "react";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
