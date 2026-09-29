import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useData } from "../hooks/useData";
import { driverPerformance } from "../utils/analytics";
import ExportButtons from "../components/ExportButtons";

const STORAGE_KEY =
  "sotreg_custom_drivers";

const EMPTY_FORM = {
  driverId: "",
  name: "",
  yearsExperience: 0,
  trips: 0,
  avgDelay: 0,
  incidents: 0,
  complaints: 0,
};

function calculateScore(
  driver
) {
  const score =
    100 -
    Number(
      driver.avgDelay ||
        0
    ) *
      3 -
    Number(
      driver.incidents ||
        0
    ) *
      8 -
    Number(
      driver.complaints ||
        0
    ) *
      4;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        score
      )
    )
  );
}

function scoreColor(
  score
) {
  if (
    score >=
    85
  ) {
    return "teal";
  }

  if (
    score >=
    65
  ) {
    return "amber";
  }

  return "red";
}

function scoreEmoji(
  score
) {
  if (
    score >=
    85
  ) {
    return "🟢";
  }

  if (
    score >=
    65
  ) {
    return "🟡";
  }

  return "🔴";
}

function loadStoredDrivers() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return null;
    }

    const parsed =
      JSON.parse(
        stored
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : null;
  } catch (error) {
    console.error(
      "Erreur lecture chauffeurs localStorage :",
      error
    );

    return null;
  }
}

export default function Drivers() {
  const data =
    useData();

  const initialRanked =
    useMemo(
      () =>
        driverPerformance(
          data
        ),
      [data]
    );

  const [
    drivers,
    setDrivers,
  ] =
    useState(() => {
      const stored =
        loadStoredDrivers();

      return (
        stored ??
        initialRanked
      );
    });

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    showModal,
    setShowModal,
  ] =
    useState(false);

  const [
    editingDriverId,
    setEditingDriverId,
  ] =
    useState(null);

  const [
    form,
    setForm,
  ] =
    useState(
      EMPTY_FORM
    );

  const [
    formError,
    setFormError,
  ] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        drivers
      )
    );
  }, [drivers]);

  const ranked =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return drivers
        .map(
          (
            driver
          ) => ({
            ...driver,
            score:
              calculateScore(
                driver
              ),
          })
        )
        .filter(
          (
            driver
          ) => {
            if (
              !normalizedSearch
            ) {
              return true;
            }

            return [
              driver.driverId,
              driver.name,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                normalizedSearch
              );
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            b.score -
            a.score
        );
    }, [
      drivers,
      search,
    ]);

  const allRanked =
    useMemo(
      () =>
        drivers
          .map(
            (
              driver
            ) => ({
              ...driver,
              score:
                calculateScore(
                  driver
                ),
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.score -
              a.score
          ),
      [drivers]
    );

  const averageScore =
    allRanked.length >
    0
      ? allRanked.reduce(
          (
            total,
            driver
          ) =>
            total +
            driver.score,
          0
        ) /
        allRanked.length
      : 0;

  const riskCount =
    allRanked.filter(
      (
        driver
      ) =>
        driver.score <
        65
    ).length;

  const topDriver =
    allRanked[0];

  const exportRows =
    ranked.map(
      (
        driver
      ) => ({
        driverId:
          driver.driverId,
        name:
          driver.name,
        yearsExperience:
          driver.yearsExperience,
        trips:
          driver.trips,
        avgDelay:
          driver.avgDelay,
        incidents:
          driver.incidents,
        complaints:
          driver.complaints,
        score:
          driver.score,
      })
    );

  const exportColumns = [
    {
      header:
        "Identifiant",
      key:
        "driverId",
    },
    {
      header:
        "Chauffeur",
      key:
        "name",
    },
    {
      header:
        "Expérience",
      key:
        "yearsExperience",
    },
    {
      header:
        "Trajets",
      key:
        "trips",
    },
    {
      header:
        "Retard moyen",
      key:
        "avgDelay",
    },
    {
      header:
        "Incidents",
      key:
        "incidents",
    },
    {
      header:
        "Réclamations",
      key:
        "complaints",
    },
    {
      header:
        "Score",
      key:
        "score",
    },
  ];

  function openAddModal() {
    setEditingDriverId(
      null
    );

    setForm({
      ...EMPTY_FORM,
    });

    setFormError(
      ""
    );

    setShowModal(
      true
    );
  }

  function openEditModal(
    driver
  ) {
    setEditingDriverId(
      driver.driverId
    );

    setForm({
      driverId:
        driver.driverId,
      name:
        driver.name,
      yearsExperience:
        driver.yearsExperience,
      trips:
        driver.trips,
      avgDelay:
        driver.avgDelay,
      incidents:
        driver.incidents,
      complaints:
        driver.complaints,
    });

    setFormError(
      ""
    );

    setShowModal(
      true
    );
  }

  function closeModal() {
    setShowModal(
      false
    );

    setEditingDriverId(
      null
    );

    setFormError(
      ""
    );
  }

  function handleChange(
    event
  ) {
    const {
      name,
      value,
      type,
    } =
      event.target;

    setForm(
      (
        previous
      ) => ({
        ...previous,
        [name]:
          type ===
          "number"
            ? Number(
                value
              )
            : value,
      })
    );
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    const driverId =
      form.driverId
        .trim();

    const name =
      form.name
        .trim();

    if (
      !driverId ||
      !name
    ) {
      setFormError(
        "L'identifiant et le nom du chauffeur sont obligatoires."
      );

      return;
    }

    const duplicate =
      drivers.some(
        (
          driver
        ) =>
          driver.driverId ===
            driverId &&
          driver.driverId !==
            editingDriverId
      );

    if (
      duplicate
    ) {
      setFormError(
        "Cet identifiant chauffeur existe déjà."
      );

      return;
    }

    const normalizedDriver =
      {
        driverId,
        name,
        yearsExperience:
          Math.max(
            0,
            Number(
              form.yearsExperience
            ) || 0
          ),
        trips:
          Math.max(
            0,
            Number(
              form.trips
            ) || 0
          ),
        avgDelay:
          Math.max(
            0,
            Number(
              form.avgDelay
            ) || 0
          ),
        incidents:
          Math.max(
            0,
            Number(
              form.incidents
            ) || 0
          ),
        complaints:
          Math.max(
            0,
            Number(
              form.complaints
            ) || 0
          ),
      };

    if (
      editingDriverId
    ) {
      setDrivers(
        (
          previous
        ) =>
          previous.map(
            (
              driver
            ) =>
              driver.driverId ===
              editingDriverId
                ? normalizedDriver
                : driver
          )
      );
    } else {
      setDrivers(
        (
          previous
        ) => [
          ...previous,
          normalizedDriver,
        ]
      );
    }

    closeModal();
  }

  function deleteDriver(
    driver
  ) {
    const confirmed =
      window.confirm(
        `Supprimer le chauffeur ${driver.name} ?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDrivers(
      (
        previous
      ) =>
        previous.filter(
          (
            item
          ) =>
            item.driverId !==
            driver.driverId
        )
    );
  }

  function resetDrivers() {
    const confirmed =
      window.confirm(
        "Restaurer tous les chauffeurs de démonstration d'origine ?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDrivers(
      initialRanked
    );
  }

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
            Score composite basé sur le
            retard moyen, les incidents
            et les réclamations reçues.
          </p>

        </div>

        <div className="crud-page-actions">

          <ExportButtons
            rows={
              exportRows
            }
            columns={
              exportColumns
            }
            filename="chauffeurs-sotreg"
            title="Performance chauffeurs SOTREG"
          />

          <button
            type="button"
            className="admin-save-btn"
            onClick={
              openAddModal
            }
          >
            + Ajouter un chauffeur
          </button>

        </div>

      </div>


      <div className="kpi-row">

        <div className="kpi-card">

          <span className="kpi-label">
            Score moyen
          </span>

          <span className="kpi-value">
            {averageScore.toFixed(
              0
            )}
            /100
          </span>

        </div>


        <div className="kpi-card">

          <span className="kpi-label">
            Chauffeurs à risque
          </span>

          <span
            className={`kpi-value ${
              riskCount >
              0
                ? "bad"
                : ""
            }`}
          >
            {
              riskCount
            }
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
              fontSize:
                20,
            }}
          >
            {topDriver?.name ||
              "—"}
          </span>

          <span className="kpi-sub">
            {topDriver
              ? `${topDriver.score}/100`
              : "Aucun chauffeur"}
          </span>

        </div>

      </div>


      <div className="card">

        <div className="crud-table-toolbar">

          <div>

            <h3>
              Classement complet (
              {
                drivers.length
              }{" "}
              chauffeurs)
            </h3>

            <p className="card-sub">
              Score = 100 −
              (retard moyen × 3) −
              (incidents × 8) −
              (réclamations × 4),
              plafonné entre 0 et 100.
            </p>

          </div>

          <div className="crud-toolbar-controls">

            <input
              type="search"
              className="crud-search-input"
              placeholder="Rechercher chauffeur..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
            />

            <button
              type="button"
              className="crud-reset-btn"
              onClick={
                resetDrivers
              }
            >
              Restaurer
            </button>

          </div>

        </div>


        <div className="crud-table-scroll">

          <table className="data-table">

            <thead>

              <tr>
                <th>#</th>
                <th>
                  Chauffeur
                </th>
                <th>
                  Expérience
                </th>
                <th>
                  Trajets
                </th>
                <th>
                  Retard moyen
                </th>
                <th>
                  Incidents
                </th>
                <th>
                  Réclamations
                </th>
                <th>
                  Score
                </th>
                <th>
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {ranked.map(
                (
                  driver,
                  index
                ) => (

                  <tr
                    key={
                      driver.driverId
                    }
                  >

                    <td className="mono">
                      {index +
                        1}
                    </td>

                    <td>

                      <div className="driver-name-cell">

                        <span className="driver-mini-avatar">
                          {driver.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase()}
                        </span>

                        <div>

                          <strong>
                            {
                              driver.name
                            }
                          </strong>

                          <small>
                            {
                              driver.driverId
                            }
                          </small>

                        </div>

                      </div>

                    </td>

                    <td className="mono">
                      {
                        driver.yearsExperience
                      }{" "}
                      ans
                    </td>

                    <td className="mono">
                      {
                        driver.trips
                      }
                    </td>

                    <td className="mono">
                      {Number(
                        driver.avgDelay ||
                          0
                      ).toFixed(
                        1
                      )}{" "}
                      min
                    </td>

                    <td className="mono">
                      {
                        driver.incidents
                      }
                    </td>

                    <td className="mono">
                      {
                        driver.complaints
                      }
                    </td>

                    <td>

                      <div className="score-cell">

                        <div
                          className="bar-track"
                          style={{
                            width:
                              70,
                          }}
                        >

                          <div
                            className={`bar-fill ${scoreColor(
                              driver.score
                            )}`}
                            style={{
                              width:
                                `${driver.score}%`,
                            }}
                          />

                        </div>

                        <span className="score-num">
                          {scoreEmoji(
                            driver.score
                          )}{" "}
                          {
                            driver.score
                          }
                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="crud-row-actions">

                        <button
                          type="button"
                          className="crud-edit-btn"
                          onClick={() =>
                            openEditModal(
                              driver
                            )
                          }
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          className="crud-delete-btn"
                          onClick={() =>
                            deleteDriver(
                              driver
                            )
                          }
                        >
                          Supprimer
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

              {ranked.length ===
                0 && (
                <tr>

                  <td
                    colSpan={
                      9
                    }
                    className="crud-empty-row"
                  >
                    Aucun chauffeur trouvé.
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>


      <p className="section-note">
        Note : ce score est un exemple simple
        à des fins de démonstration.
        Une version réelle nécessiterait
        un accès encadré aux données
        individuelles et une validation
        avec les RH avant tout usage
        en évaluation.
      </p>


      {showModal && (

        <div
          className="crud-modal-backdrop"
          onMouseDown={
            closeModal
          }
        >

          <div
            className="crud-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="crud-modal-header">

              <div>

                <span className="kicker">
                  Gestion équipe
                </span>

                <h2>
                  {editingDriverId
                    ? "Modifier le chauffeur"
                    : "Ajouter un chauffeur"}
                </h2>

              </div>

              <button
                type="button"
                className="crud-modal-close"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="crud-form"
            >

              <div className="crud-form-grid">

                <label>
                  Identifiant chauffeur

                  <input
                    name="driverId"
                    value={
                      form.driverId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex: D23"
                    disabled={
                      Boolean(
                        editingDriverId
                      )
                    }
                  />
                </label>


                <label>
                  Nom complet

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nom et prénom"
                  />
                </label>


                <label>
                  Expérience (années)

                  <input
                    type="number"
                    min="0"
                    name="yearsExperience"
                    value={
                      form.yearsExperience
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>


                <label>
                  Nombre de trajets

                  <input
                    type="number"
                    min="0"
                    name="trips"
                    value={
                      form.trips
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>


                <label>
                  Retard moyen (min)

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="avgDelay"
                    value={
                      form.avgDelay
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>


                <label>
                  Incidents

                  <input
                    type="number"
                    min="0"
                    name="incidents"
                    value={
                      form.incidents
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>


                <label>
                  Réclamations

                  <input
                    type="number"
                    min="0"
                    name="complaints"
                    value={
                      form.complaints
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>

              </div>


              <div className="crud-score-preview">

                Score calculé

                <strong>
                  {calculateScore(
                    form
                  )}
                  /100
                </strong>

              </div>


              {formError && (
                <div className="crud-form-error">
                  {
                    formError
                  }
                </div>
              )}


              <div className="crud-modal-footer">

                <button
                  type="button"
                  className="admin-reset-btn"
                  onClick={
                    closeModal
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="admin-save-btn"
                >
                  {editingDriverId
                    ? "Enregistrer"
                    : "Ajouter le chauffeur"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}