import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

import routesConfigArray from "./routes/router";

// Crea el router usando la nueva configuración en formato array
const router = createBrowserRouter(routesConfigArray);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <App>
      {/* RouterProvider renderiza la UI basada en la URL y la configuración */}
      <RouterProvider router={router} />
    </App>
  </StrictMode>
);
