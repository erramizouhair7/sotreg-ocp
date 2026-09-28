import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";
import { useData } from "../hooks/useData";
import { kpiSummary, routeEfficiency, monthOverMonth, driverPerformance, vehicleStats } from "../utils/analytics";
import { CHART_COLORS, axisTick, tooltipStyle } from "../utils/chartTheme";

function Trend({ pct, invert }) {
  const good = invert ? pct <= 0 : pct >= 0;
  const arrow = pct >= 0 ? "▲" : "▼";
  return (
    <span style={{ color: good ? "var(--teal)" : "var(--red)", fontSize: 12.5, fontWeight: 700 }}>
      {arrow} {Math.abs(pct).toFixed(1)}% vs mois précédent
    </span>
  );
}

function OKR({ objective, keyResults }) {
  return (
    <div className="okr-block">
      <h4>{objective}</h4>
      {keyResults.map((kr) => (
        <div className="okr-kr" key={kr.label}>
          <div className="okr-kr-head">
            <span>{kr.label}</span>
            <span className="mono">{kr.current} / {kr.target}</span>
          </div>
          <div className="bar-track">
            <div
              className={`bar-fill ${kr.pct >= 100 ? "teal" : kr.pct >= 60 ? "amber" : "red"}`}
              style={{ width: `${Math.min(100, kr.pct)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KPIsOKR() {
  const data = useData();
  const kpi = kpiSummary(data);
  const efficiency = routeEfficiency(data);
  const mom = monthOverMonth(data);
  const drivers = driverPerformance(data);
  const vehicles = vehicleStats(data);

  const costPerPassenger = kpi.totalPassengers ? kpi.totalCost / kpi.totalPassengers : 0;
  const avgUtilization = efficiency.reduce((a, r) => a + r.utilization, 0) / efficiency.length;
  const underused = efficiency.filter((r) => r.utilization < 55);
  const overloaded = efficiency.filter((r) => r.utilization > 100);

  const scatterData = efficiency.map((r) => ({ x: r.utilization, y: r.avgDelay, z: r.trips, name: r.name }));

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="kicker">Pilotage</span>
          <h1>KPIs, OKR & analyse détaillée</h1>
          <p>Objectifs trimestriels du réseau et indicateurs de fond pour la direction transport.</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Ponctualité réseau</span>
          <span className={`kpi-value ${kpi.onTimeRate < 85 ? "warn" : ""}`}>{kpi.onTimeRate.toFixed(1)}%</span>
          {mom && <Trend pct={mom.delayChangePct} invert />}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Coût / passager</span>
          <span className="kpi-value">{costPerPassenger.toFixed(2)} MAD</span>
          {mom && <Trend pct={mom.costChangePct} invert />}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Utilisation moyenne flotte</span>
          <span className={`kpi-value ${avgUtilization < 60 ? "warn" : ""}`}>{avgUtilization.toFixed(0)}%</span>
          <span className="kpi-sub">{underused.length} lignes sous-utilisées · {overloaded.length} en surcharge</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Incidents (mois en cours)</span>
          <span className={`kpi-value ${mom && mom.curr.incidents > mom.prev.incidents ? "bad" : ""}`}>{mom?.curr.incidents ?? kpi.incidents}</span>
          {mom && <Trend pct={mom.incidentsChangePct} invert />}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Objectifs du trimestre (OKR)</h3>
          <p className="card-sub">Exemple de structuration — objectifs et seuils à valider avec la direction SOTREG.</p>

          <OKR
            objective="🎯 Améliorer la ponctualité du réseau"
            keyResults={[
              { label: "Ponctualité globale", current: `${kpi.onTimeRate.toFixed(0)}%`, target: "90%", pct: (kpi.onTimeRate / 90) * 100 },
              { label: "Retard moyen", current: `${kpi.avgDelay.toFixed(1)} min`, target: "≤5 min", pct: (5 / Math.max(kpi.avgDelay, 0.1)) * 100 },
            ]}
          />
          <OKR
            objective="🎯 Réduire les coûts d'exploitation"
            keyResults={[
              { label: "Coût par passager", current: `${costPerPassenger.toFixed(2)} MAD`, target: "≤3.50 MAD", pct: (3.5 / Math.max(costPerPassenger, 0.1)) * 100 },
              { label: "Lignes sous-utilisées (<55%)", current: `${underused.length}`, target: "0", pct: underused.length === 0 ? 100 : (1 - underused.length / efficiency.length) * 100 },
            ]}
          />
          <OKR
            objective="🎯 Renforcer la sécurité et la fiabilité"
            keyResults={[
              { label: "Incidents / mois", current: `${mom?.curr.incidents ?? kpi.incidents}`, target: "≤10", pct: (10 / Math.max(mom?.curr.incidents ?? kpi.incidents, 1)) * 100 },
              { label: "Chauffeurs score ≥ 85", current: `${drivers.filter((d) => d.score >= 85).length}/${drivers.length}`, target: `${drivers.length}/${drivers.length}`, pct: (drivers.filter((d) => d.score >= 85).length / drivers.length) * 100 },
            ]}
          />
        </div>

        <div className="card">
          <h3>Efficacité des lignes</h3>
          <p className="card-sub">Utilisation (%) vs retard moyen (min) — la taille du point = nb. de trajets.</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis type="number" dataKey="x" name="Utilisation" unit="%" tick={axisTick} />
              <YAxis type="number" dataKey="y" name="Retard" unit="min" tick={axisTick} />
              <ZAxis type="number" dataKey="z" range={[40, 220]} />
              <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} formatter={(v, n) => [v.toFixed ? v.toFixed(1) : v, n]} labelFormatter={() => ""} />
              <Scatter data={scatterData} fill={CHART_COLORS.blue} fillOpacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="section-note" style={{ marginTop: 8 }}>
            En bas à droite = idéal (forte utilisation, faible retard). En haut à gauche = à revoir en priorité
            (sous-utilisée et en retard).
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Lignes sous-utilisées</h3>
          <p className="card-sub">Utilisation &lt; 55% de la capacité — candidates à une fréquence réduite.</p>
          <table className="data-table">
            <thead><tr><th>Ligne</th><th>Utilisation</th><th>Coût/passager</th></tr></thead>
            <tbody>
              {underused.slice(0, 6).map((r) => (
                <tr key={r.routeId}>
                  <td>{r.name}</td>
                  <td className="mono">{r.utilization.toFixed(0)}%</td>
                  <td className="mono">{r.costPerPassenger.toFixed(2)} MAD</td>
                </tr>
              ))}
              {underused.length === 0 && <tr><td colSpan={3} style={{ color: "var(--ink-faint)" }}>Aucune ligne sous ce seuil.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Véhicules à surveiller</h3>
          <p className="card-sub">Kilométrage élevé + retard moyen supérieur à la moyenne du parc.</p>
          <table className="data-table">
            <thead><tr><th>Véhicule</th><th>Km</th><th>Retard moyen</th></tr></thead>
            <tbody>
              {vehicles.filter((v) => v.mileageKm > 220000).slice(0, 6).map((v) => (
                <tr key={v.vehicleId}>
                  <td>{v.vehicleId} · {v.plate}</td>
                  <td className="mono">{v.mileageKm.toLocaleString("fr-FR")}</td>
                  <td className="mono">{v.avgDelay.toFixed(1)} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="section-note">
        Cibles OKR données à titre d'exemple pour illustrer la mécanique — à recalibrer avec les objectifs réels
        de la direction transport SOTREG / OCP.
      </p>
    </div>
  );
}
