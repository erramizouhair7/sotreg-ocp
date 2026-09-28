import { Link } from "react-router-dom";
import { useData } from "../hooks/useData";
import { kpiSummary, delayByRoute } from "../utils/analytics";
import RouteFlipCard from "../components/RouteFlipCard";

export default function Dashboard() {
  const data = useData();
  const kpi = kpiSummary(data);
  const routeStats = delayByRoute(data).sort((a, b) => b.trips - a.trips).slice(0, 8);

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="kicker">Vue d'ensemble</span>
          <h1>Tableau de bord transport</h1>
          <p>Performance globale du réseau SOTREG sur les 90 derniers jours.</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Ponctualité</span>
          <span className={`kpi-value ${kpi.onTimeRate < 75 ? "warn" : "good"}`}>{kpi.onTimeRate.toFixed(1)}%</span>
          <span className="kpi-sub">trajets avec ≤5 min de retard</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Trajets effectués</span>
          <span className="kpi-value">{kpi.totalTrips.toLocaleString("fr-FR")}</span>
          <span className="kpi-sub">sur 90 jours</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Employés transportés</span>
          <span className="kpi-value">{kpi.totalPassengers.toLocaleString("fr-FR")}</span>
          <span className="kpi-sub">cumulé</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Incidents</span>
          <span className={`kpi-value ${kpi.incidents > 15 ? "bad" : ""}`}>{kpi.incidents}</span>
          <span className="kpi-sub">sur la période</span>
        </div>
      </div>

      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <span className="kicker">Lignes principales</span>
          <h1 style={{ fontSize: 20 }}>Aperçu par ligne</h1>
          <p>Cliquez une carte pour voir retard, passagers et coût.</p>
        </div>
        <Link to="/routes" className="admin-reset-btn">Voir toutes les lignes →</Link>
      </div>

      <div className="flip-grid">
        {routeStats.map((r) => (
          <RouteFlipCard key={r.routeId} route={r} />
        ))}
      </div>

      <p className="section-note">
        Données de démonstration générées localement. Le détail complet (évolution mensuelle, heures de pointe,
        réclamations, coûts) est disponible dans <Link to="/routes" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>Trajets & retards</Link> et{" "}
        <Link to="/kpis" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>KPIs & OKR</Link>.
      </p>
    </div>
  );
}
