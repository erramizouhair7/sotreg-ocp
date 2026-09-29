import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { useData }
  from "../hooks/useData";

import { useTickets }
  from "../context/TicketsContext";

import { buildAlerts }
  from "../utils/alerts";

const FILTERS = [
  "Toutes",
  "Critiques",
  "Retards",
  "Maintenance",
  "GPS",
  "Tickets",
];

function severityLabel(severity) {
  if (severity === "critical") {
    return "Critique";
  }

  if (severity === "warning") {
    return "Attention";
  }

  return "Information";
}

function alertIcon(type) {
  switch (type) {
    case "RETARD":
      return "⏱";

    case "VEHICULE":
      return "🚌";

    case "GPS":
      return "📡";

    case "TICKET":
      return "🛠";

    default:
      return "!";
  }
}

export default function AlertsCenter() {
  const data = useData();

  const {
    tickets,
  } = useTickets();

  const [filter, setFilter] =
    useState("Toutes");

  const [handledIds, setHandledIds] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "sotreg_handled_alerts"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const allAlerts = useMemo(
    () =>
      buildAlerts(
        data,
        tickets
      ),
    [data, tickets]
  );

  const activeAlerts =
    useMemo(
      () =>
        allAlerts.filter(
          (alert) =>
            !handledIds.includes(
              alert.id
            )
        ),
      [allAlerts, handledIds]
    );

  const filteredAlerts =
    useMemo(() => {
      if (filter === "Toutes") {
        return activeAlerts;
      }

      if (filter === "Critiques") {
        return activeAlerts.filter(
          (alert) =>
            alert.severity ===
            "critical"
        );
      }

      return activeAlerts.filter(
        (alert) =>
          alert.category === filter
      );
    }, [
      activeAlerts,
      filter,
    ]);

  const criticalCount =
    activeAlerts.filter(
      (alert) =>
        alert.severity ===
        "critical"
    ).length;

  const delayCount =
    activeAlerts.filter(
      (alert) =>
        alert.category ===
        "Retards"
    ).length;

  const maintenanceCount =
    activeAlerts.filter(
      (alert) =>
        alert.category ===
        "Maintenance"
    ).length;

  const ticketCount =
    activeAlerts.filter(
      (alert) =>
        alert.category ===
          "Tickets" ||
        alert.category ===
          "GPS"
    ).length;

  function markHandled(id) {
    setHandledIds(
      (current) => {
        if (
          current.includes(id)
        ) {
          return current;
        }

        const next = [
          ...current,
          id,
        ];

        localStorage.setItem(
          "sotreg_handled_alerts",
          JSON.stringify(next)
        );

        return next;
      }
    );
  }

  function restoreAlerts() {
    localStorage.removeItem(
      "sotreg_handled_alerts"
    );

    setHandledIds([]);
  }

  return (
    <div>

      <div className="page-head">

        <div>
          <span className="kicker">
            Supervision
          </span>

          <h1>
            Centre d'alertes
          </h1>

          <p>
            Détection automatique des retards,
            incidents techniques, anomalies GPS
            et véhicules nécessitant une attention.
          </p>
        </div>

        {handledIds.length > 0 && (
          <button
            className="admin-reset-btn"
            onClick={restoreAlerts}
          >
            Restaurer les alertes traitées
          </button>
        )}

      </div>

      <div className="kpi-row alerts-kpi-row">

        <div className="kpi-card">
          <span className="kpi-label">
            Alertes actives
          </span>

          <span
            className={`kpi-value ${
              activeAlerts.length > 0
                ? "warn"
                : "good"
            }`}
          >
            {activeAlerts.length}
          </span>

          <span className="kpi-sub">
            nécessitent une attention
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Critiques
          </span>

          <span
            className={`kpi-value ${
              criticalCount > 0
                ? "bad"
                : "good"
            }`}
          >
            {criticalCount}
          </span>

          <span className="kpi-sub">
            priorité immédiate
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Retards
          </span>

          <span className="kpi-value">
            {delayCount}
          </span>

          <span className="kpi-sub">
            lignes ≥ 10 min
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Maintenance
          </span>

          <span className="kpi-value">
            {maintenanceCount}
          </span>

          <span className="kpi-sub">
            véhicules concernés
          </span>
        </div>

      </div>

      <div className="alerts-toolbar">

        <div className="alerts-filters">

          {FILTERS.map(
            (item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            )
          )}

        </div>

        <span className="alerts-result-count">
          {filteredAlerts.length} alerte
          {filteredAlerts.length > 1
            ? "s"
            : ""}
        </span>

      </div>

      {filteredAlerts.length ===
        0 ? (

        <div className="alerts-empty">

          <div className="alerts-empty-icon">
            ✓
          </div>

          <h3>
            Aucune alerte active
          </h3>

          <p>
            Aucun élément ne correspond
            au filtre sélectionné.
          </p>

        </div>

      ) : (

        <div className="alerts-list">

          {filteredAlerts.map(
            (alert) => (

              <div
                key={alert.id}
                className={`alert-card ${alert.severity}`}
              >

                <div
                  className={`alert-icon ${alert.severity}`}
                >
                  {alertIcon(
                    alert.type
                  )}
                </div>

                <div className="alert-main">

                  <div className="alert-heading">

                    <div>

                      <div className="alert-title-line">

                        <h3>
                          {alert.title}
                        </h3>

                        <span
                          className={`alert-severity ${alert.severity}`}
                        >
                          {severityLabel(
                            alert.severity
                          )}
                        </span>

                      </div>

                      <p>
                        {alert.message}
                      </p>

                    </div>

                  </div>

                  <div className="alert-meta">

                    <span>
                      Source :
                      <strong>
                        {" "}
                        {alert.source}
                      </strong>
                    </span>

                    <span>
                      Type :
                      <strong>
                        {" "}
                        {alert.category}
                      </strong>
                    </span>

                  </div>

                </div>

                <div className="alert-actions">

                  <Link
                    to={alert.link}
                    className="alert-view-btn"
                  >
                    Voir
                  </Link>

                  <button
                    className="alert-handle-btn"
                    onClick={() =>
                      markHandled(
                        alert.id
                      )
                    }
                  >
                    Marquer comme traité
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

      <p className="section-note">
        Les alertes sont générées à partir
        des données de démonstration disponibles
        dans l'application. Elles ne correspondent
        pas à un système d'alerte temps réel connecté
        à une infrastructure externe.
      </p>

    </div>
  );
}