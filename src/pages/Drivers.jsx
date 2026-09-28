import { useData } from "../hooks/useData";

import {
  driverPerformance,
} from "../utils/analytics";

import ExportButtons from "../components/ExportButtons";

function scoreColor(score) {
  if (score >= 85) {
    return "teal";
  }

  if (score >= 65) {
    return "amber";
  }

  return "red";
}

function scoreEmoji(score) {
  if (score >= 85) {
    return "🟢";
  }

  if (score >= 65) {
    return "🟡";
  }

  return "🔴";
}

export default function Drivers() {
  const data = useData();

  const ranked =
    driverPerformance(data);

  const exportRows =
    ranked.map(
      (driver, index) => ({
        classement:
          index + 1,

        chauffeur:
          driver.name,

        experience:
          `${driver.yearsExperience} ans`,

        trajets:
          driver.trips,

        retard:
          `${driver.avgDelay.toFixed(1)} min`,

        incidents:
          driver.incidents,

        reclamations:
          driver.complaints,

        score:
          `${driver.score}/100`,
      })
    );

  const exportColumns = [
    {
      key: "classement",
      label: "#",
    },
    {
      key: "chauffeur",
      label: "Chauffeur",
    },
    {
      key: "experience",
      label: "Expérience",
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
      key: "incidents",
      label: "Incidents",
    },
    {
      key: "reclamations",
      label: "Réclamations",
    },
    {
      key: "score",
      label: "Score",
    },
  ];

  const averageScore =
    ranked.length > 0
      ? (
          ranked.reduce(
            (total, driver) =>
              total + driver.score,
            0
          ) / ranked.length
        ).toFixed(0)
      : 0;

  const riskDrivers =
    ranked.filter(
      (driver) =>
        driver.score < 65
    );

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="kicker">
            Équipe
          </span>

          <h1>
            Performance des chauffeurs
          </h1>

          <p>
            Score composite basé sur le retard moyen,
            les incidents et les réclamations reçues.
          </p>
        </div>

        <ExportButtons
          rows={exportRows}
          columns={exportColumns}
          title="Performance des chauffeurs - SOTREG Analytics"
          filename="sotreg-chauffeurs"
        />
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">
            Score moyen
          </span>

          <span className="kpi-value">
            {averageScore}/100
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Chauffeurs à risque
          </span>

          <span
            className={`kpi-value ${
              riskDrivers.length > 0
                ? "bad"
                : ""
            }`}
          >
            {riskDrivers.length}
          </span>

          <span className="kpi-sub">
            score &lt; 65
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Top performeur
          </span>

          <span
            className="kpi-value"
            style={{
              fontSize: 20,
            }}
          >
            {ranked[0]?.name || "—"}
          </span>

          <span className="kpi-sub">
            {ranked[0]
              ? `${ranked[0].score}/100`
              : "Aucune donnée"}
          </span>
        </div>
      </div>

      <div className="card">
        <h3>
          Classement complet ({ranked.length} chauffeurs)
        </h3>

        <p className="card-sub">
          Score = 100 − (retard moyen × 3)
          − (incidents × 8)
          − (réclamations × 4),
          plafonné entre 0 et 100.
        </p>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Chauffeur</th>
              <th>Expérience</th>
              <th>Trajets</th>
              <th>Retard moyen</th>
              <th>Incidents</th>
              <th>Réclamations</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {ranked.map(
              (driver, index) => (
                <tr key={driver.driverId}>
                  <td className="mono">
                    {index + 1}
                  </td>

                  <td>
                    {driver.name}
                  </td>

                  <td className="mono">
                    {driver.yearsExperience} ans
                  </td>

                  <td className="mono">
                    {driver.trips}
                  </td>

                  <td className="mono">
                    {driver.avgDelay.toFixed(1)} min
                  </td>

                  <td className="mono">
                    {driver.incidents}
                  </td>

                  <td className="mono">
                    {driver.complaints}
                  </td>

                  <td>
                    <div className="score-cell">
                      <div
                        className="bar-track"
                        style={{
                          width: 70,
                        }}
                      >
                        <div
                          className={`bar-fill ${scoreColor(
                            driver.score
                          )}`}
                          style={{
                            width: `${driver.score}%`,
                          }}
                        />
                      </div>

                      <span className="score-num">
                        {scoreEmoji(
                          driver.score
                        )}{" "}
                        {driver.score}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <p className="section-note">
        Note : ce score est un exemple simple à des fins
        de démonstration. Une version réelle nécessiterait
        un accès encadré aux données individuelles et une
        validation avec les RH avant tout usage en évaluation.
      </p>
    </div>
  );
}