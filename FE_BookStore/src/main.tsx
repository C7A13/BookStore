import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";


if (window.location.hash && window.location.hash === "#_=_") {
  if (window.history && window.history.pushState) {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
  } else {
    window.location.hash = "";
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);