import { useMemo, useState } from "react";

import { useData } from "../hooks/useData";

import { vehicleStats } from "../utils/analytics";

import ExportButtons from "../components/ExportButtons";

function statusPill(status) {
  if (status === "En service") {
    return "ok";
  }

  if (status === "Maintenance requise") {
    return "warn";
  }

  return "bad";
}

export default function Vehicles() {
  const data = useData();

  const [sortKey, setSortKey] =
    useState("avgDelay");

  const stats = vehicleStats(data);

  const flagged = stats.filter(
    (vehicle) =>
      vehicle.status !== "En service"
  );

  const sorted = useMemo(() => {
    const copy = [...stats];

    copy.sort((a, b) => {
      if (
        typeof a[sortKey] === "string"
      ) {
        return a[sortKey].localeCompare(
          b[sortKey]
        );
      }

      return b[sortKey] - a[sortKey];
    });

    return copy;
  }, [stats, sortKey]);

  const exportRows = sorted.map(
    (vehicle) => ({
      vehicule:
        vehicle.vehicleId,

      immatriculation:
        vehicle.plate,

      modele:
        vehicle.model,

      statut:
        vehicle.status,

      kilometrage:
        vehicle.mileageKm,

      trajets:
        vehicle.trips,

      retard:
        `${vehicle.avgDelay.toFixed(1)} min`,

      utilisation:
        `${vehicle.utilization.toFixed(0)}%`,

      incidents:
        vehicle.incidents,
    })
  );

  const exportColumns = [
    {
      key: "vehicule",
      label: "Véhicule",
    },
    {
      key: "immatriculation",
      label: "Immatriculation",
    },
    {
      key: "modele",
      label: "Modèle",
    },
    {
      key: "statut",
      label: "Statut",
    },
    {
      key: "kilometrage",
      label: "Kilométrage",
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
      key: "utilisation",
      label: "Utilisation",
    },
    {
      key: "incidents",
      label: "Incidents",
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="kicker">
            Parc
          </span>

          <h1>Véhicules</h1>

          <p>
            Taux d'utilisation, kilométrage et état
            de maintenance de la flotte.
          </p>
        </div>

        <ExportButtons
          rows={exportRows}
          columns={exportColumns}
          title="Flotte des véhicules - SOTREG Analytics"
          filename="sotreg-vehicules"
        />
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">
            Véhicules actifs
          </span>

          <span className="kpi-value">
            {
              stats.filter(
                (vehicle) =>
                  vehicle.status ===
                  "En service"
              ).length
            }
            /{stats.length}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Nécessitent attention
          </span>

          <span
            className={`kpi-value ${
              flagged.length > 0
                ? "warn"
                : ""
            }`}
          >
            {flagged.length}
          </span>

          <span className="kpi-sub">
            maintenance ou immobilisé
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Utilisation moyenne
          </span>

          <span className="kpi-value">
            {(
              stats.reduce(
                (total, vehicle) =>
                  total + vehicle.utilization,
                0
              ) / stats.length
            ).toFixed(0)}
            %
          </span>

          <span className="kpi-sub">
            taux d'occupation moyen
          </span>
        </div>
      </div>

      {flagged.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 18,
            borderColor:
              "rgba(198,138,46,0.35)",
          }}
        >
          <h3>
            À traiter en priorité
          </h3>

          <p className="card-sub">
            Véhicules signalés en maintenance
            requise ou immobilisés.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {flagged.map(
              (vehicle) => (
                <span
                  key={vehicle.vehicleId}
                  className={`pill ${statusPill(
                    vehicle.status
                  )}`}
                >
                  {vehicle.vehicleId} ·{" "}
                  {vehicle.plate} —{" "}
                  {vehicle.status}
                </span>
              )
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0 }}>
            Flotte complète ({stats.length})
          </h3>

          <select
            value={sortKey}
            onChange={(e) =>
              setSortKey(
                e.target.value
              )
            }
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border:
                "1px solid var(--line-strong)",
              fontSize: 12.5,
            }}
          >
            <option value="avgDelay">
              Trier par retard causé
            </option>

            <option value="utilization">
              Trier par utilisation
            </option>

            <option value="mileageKm">
              Trier par kilométrage
            </option>

            <option value="incidents">
              Trier par incidents
            </option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Modèle</th>
              <th>Statut</th>
              <th>Km</th>
              <th>Trajets</th>
              <th>Retard moyen</th>
              <th>Utilisation</th>
              <th>Incidents</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((vehicle) => (
              <tr key={vehicle.vehicleId}>
                <td>
                  {vehicle.vehicleId}{" "}
                  <span
                    style={{
                      color:
                        "var(--ink-faint)",
                    }}
                  >
                    · {vehicle.plate}
                  </span>
                </td>

                <td>
                  {vehicle.model}
                </td>

                <td>
                  <span
                    className={`pill ${statusPill(
                      vehicle.status
                    )}`}
                  >
                    {vehicle.status}
                  </span>
                </td>

                <td className="mono">
                  {vehicle.mileageKm.toLocaleString(
                    "fr-FR"
                  )}
                </td>

                <td className="mono">
                  {vehicle.trips}
                </td>

                <td className="mono">
                  {vehicle.avgDelay.toFixed(1)} min
                </td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      className="bar-track"
                      style={{
                        width: 70,
                      }}
                    >
                      <div
                        className={`bar-fill ${
                          vehicle.utilization > 100
                            ? "red"
                            : vehicle.utilization > 85
                            ? "amber"
                            : "teal"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            vehicle.utilization
                          )}%`,
                        }}
                      />
                    </div>

                    <span
                      className="mono"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {vehicle.utilization.toFixed(0)}
                      %
                    </span>
                  </div>
                </td>

                <td className="mono">
                  {vehicle.incidents}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}