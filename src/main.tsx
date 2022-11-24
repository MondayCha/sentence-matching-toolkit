import React from "react";
import ReactDOM from "react-dom/client";
import RouterView from "./routes/RouterView";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterView />
  </React.StrictMode>
);
