import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useData } from "../hooks/useData";

import {
  delayByRoute,
  monthlyEvolution,
  peakHours,
  complaintBreakdown,
} from "../utils/analytics";

import {
  CHART_COLORS,
  CHART_PALETTE,
  axisTick,
  tooltipStyle,
} from "../utils/chartTheme";

import ExportButtons from "../components/ExportButtons";

function delayPillClass(avgDelay) {
  if (avgDelay <= 4) return "ok";
  if (avgDelay <= 9) return "warn";
  return "bad";
}

export default function RoutesPage() {
  const data = useData();

  const [sortKey, setSortKey] = useState("avgDelay");

  const stats = delayByRoute(data);
  const monthly = monthlyEvolution(data);
  const hours = peakHours(data);
  const complaints = complaintBreakdown(data);

  const sorted = useMemo(() => {
    const copy = [...stats];

    copy.sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      }

      return b[sortKey] - a[sortKey];
    });

    return copy;
  }, [stats, sortKey]);

  const chartData = [...stats]
    .sort((a, b) => b.avgDelay - a.avgDelay)
    .slice(0, 8);

  const exportRows = sorted.map((route) => ({
    ligne: route.name,
    trajets: route.trips,
    retard: `${route.avgDelay.toFixed(1)} min`,
    ponctualite: `${route.onTimeRate.toFixed(0)}%`,
    passagers: route.avgPassengers.toFixed(0),
    cout: `${Math.round(route.totalCost).toLocaleString("fr-FR")} MAD`,
  }));

  const exportColumns = [
    {
      key: "ligne",
      label: "Ligne",
    },
    {
      key: "trajets",
      label: "Trajets",
    },
    {
      key: "retard",
      label: "Retard moyen",
    },
    {
      key: "ponctualite",
      label: "Ponctualité",
    },
    {
      key: "passagers",
      label: "Passagers moyens",
    },
    {
      key: "cout",
      label: "Coût total",
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="kicker">Analyse</span>

          <h1>Trajets & retards par ligne</h1>

          <p>
            Identifiez les lignes les plus problématiques
            et leur charge de passagers.
          </p>
        </div>

        <ExportButtons
          rows={exportRows}
          columns={exportColumns}
          title="Trajets et retards - SOTREG Analytics"
          filename="sotreg-trajets-retards"
        />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>Retard moyen par ligne (top 8)</h3>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 40 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
            />

            <XAxis
              type="number"
              tick={axisTick}
            />

            <YAxis
              type="category"
              dataKey="name"
              tick={axisTick}
              width={180}
            />

            <Tooltip {...tooltipStyle} />

            <Bar
              dataKey="avgDelay"
              name="Retard moyen (min)"
              fill={CHART_COLORS.amber}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0 }}>
            Toutes les lignes ({stats.length})
          </h3>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              fontSize: 12.5,
            }}
          >
            <option value="avgDelay">
              Trier par retard
            </option>

            <option value="trips">
              Trier par nb. trajets
            </option>

            <option value="avgPassengers">
              Trier par passagers
            </option>

            <option value="totalCost">
              Trier par coût
            </option>

            <option value="name">
              Trier par nom
            </option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Ligne</th>
              <th>Trajets</th>
              <th>Retard moyen</th>
              <th>Ponctualité</th>
              <th>Passagers moy.</th>
              <th>Coût total</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((route) => (
              <tr key={route.routeId}>
                <td>{route.name}</td>

                <td className="mono">
                  {route.trips}
                </td>

                <td className="mono">
                  <span
                    className={`pill ${delayPillClass(
                      route.avgDelay
                    )}`}
                  >
                    {route.avgDelay.toFixed(1)} min
                  </span>
                </td>

                <td className="mono">
                  {route.onTimeRate.toFixed(0)}%
                </td>

                <td className="mono">
                  {route.avgPassengers.toFixed(0)}
                </td>

                <td className="mono">
                  {Math.round(
                    route.totalCost
                  ).toLocaleString("fr-FR")}{" "}
                  MAD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Évolution mensuelle</h3>

          <p className="card-sub">
            Nombre de trajets et retard moyen par mois.
          </p>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
              />

              <XAxis
                dataKey="month"
                tick={axisTick}
              />

              <YAxis
                yAxisId="left"
                tick={axisTick}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tick={axisTick}
              />

              <Tooltip {...tooltipStyle} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="trips"
                name="Trajets"
                stroke={CHART_COLORS.teal}
                strokeWidth={2}
                dot={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgDelay"
                name="Retard moyen (min)"
                stroke={CHART_COLORS.amber}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Heures de pointe</h3>

          <p className="card-sub">
            Répartition des départs par heure.
          </p>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hours}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
              />

              <XAxis
                dataKey="hour"
                tick={axisTick}
              />

              <YAxis tick={axisTick} />

              <Tooltip {...tooltipStyle} />

              <Bar
                dataKey="count"
                name="Départs"
                fill={CHART_COLORS.blue}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 18,
          maxWidth: 480,
        }}
      >
        <h3>Répartition des réclamations</h3>

        <p className="card-sub">
          Par catégorie, sur les trajets avec réclamation.
        </p>

        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={complaints}
              dataKey="count"
              nameKey="category"
              innerRadius={42}
              outerRadius={75}
              paddingAngle={2}
            >
              {complaints.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={
                    CHART_PALETTE[
                      index % CHART_PALETTE.length
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            marginTop: 8,
          }}
        >
          {complaints.map((item, index) => (
            <span
              key={item.category}
              style={{
                fontSize: 12,
                color: "var(--ink-soft)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background:
                    CHART_PALETTE[
                      index % CHART_PALETTE.length
                    ],
                  display: "inline-block",
                }}
              />

              {item.category} ({item.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}