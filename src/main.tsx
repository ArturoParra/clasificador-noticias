  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/index.css";
import { NewsProvider } from "./context/NewsContext.tsx";

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <NewsProvider>
        <App />
      </NewsProvider>
    </React.StrictMode>
  );
  