import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
import RoutesPage from "./pages/RoutesPage";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import KPIsOKR from "./pages/KPIsOKR";
import TechnicalSupport from "./pages/TechnicalSupport";

import AlertsCenter from "./pages/AlertsCenter";

function ProtectedApplication() {
  const location = useLocation();

  const isFullBleed =
    location.pathname === "/carte";

  if (isFullBleed) {
    return <LiveMap />;
  }

  return (
    <div className="app-shell">

      <Sidebar />

      <div className="main-col">

        <Topbar />

        <main className="main-content">

          <Routes>

  <Route
    path="/"
    element={<Dashboard />}
  />

  <Route
    path="/alertes"
    element={<AlertsCenter />}
  />

  <Route
    path="/routes"
    element={<RoutesPage />}
  />

  <Route
    path="/vehicules"
    element={<Vehicles />}
  />

  <Route
    path="/chauffeurs"
    element={<Drivers />}
  />

  <Route
    path="/kpis"
    element={<KPIsOKR />}
  />

  <Route
    path="/support"
    element={<TechnicalSupport />}
  />

</Routes>

        </main>

      </div>

    </div>
  );
}

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ProtectedApplication />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}