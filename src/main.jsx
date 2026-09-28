import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter }
  from "react-router-dom";

import App from "./App.jsx";

import { TicketsProvider }
  from "./context/TicketsContext";

import { AuthProvider }
  from "./context/AuthContext";

import { NotificationsProvider }
  from "./context/NotificationsContext";

import "./styles.css";

ReactDOM
  .createRoot(
    document.getElementById("root")
  )
  .render(
    <React.StrictMode>

      <BrowserRouter>

        <AuthProvider>

          <NotificationsProvider>

            <TicketsProvider>

              <App />

            </TicketsProvider>

          </NotificationsProvider>

        </AuthProvider>

      </BrowserRouter>

    </React.StrictMode>
  );