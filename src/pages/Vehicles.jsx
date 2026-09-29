import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useData } from "../hooks/useData";
import { vehicleStats } from "../utils/analytics";
import ExportButtons from "../components/ExportButtons";

const STORAGE_KEY =
  "sotreg_custom_vehicles";

const EMPTY_FORM = {
  vehicleId: "",
  plate: "",
  model: "",
  status: "En service",
  mileageKm: 0,
  trips: 0,
  avgDelay: 0,
  utilization: 0,
  incidents: 0,
};

function statusPill(status) {
  if (status === "En service") {
    return "ok";
  }

  if (status === "Maintenance requise") {
    return "warn";
  }

  return "bad";
}

function loadStoredVehicles() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return null;
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : null;
  } catch (error) {
    console.error(
      "Erreur lecture véhicules localStorage :",
      error
    );

    return null;
  }
}

export default function Vehicles() {
  const data =
    useData();

  const initialStats =
    useMemo(
      () => vehicleStats(data),
      [data]
    );

  const [
    vehicles,
    setVehicles,
  ] =
    useState(() => {
      const stored =
        loadStoredVehicles();

      return stored ??
        initialStats;
    });

  const [
    sortKey,
    setSortKey,
  ] =
    useState(
      "avgDelay"
    );

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
    editingVehicleId,
    setEditingVehicleId,
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
        vehicles
      )
    );
  }, [vehicles]);

  const flagged =
    vehicles.filter(
      (vehicle) =>
        vehicle.status !==
        "En service"
    );

  const activeCount =
    vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        "En service"
    ).length;

  const averageUtilization =
    vehicles.length > 0
      ? vehicles.reduce(
          (
            total,
            vehicle
          ) =>
            total +
            Number(
              vehicle.utilization ||
                0
            ),
          0
        ) /
        vehicles.length
      : 0;

  const sorted =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const filtered =
        vehicles.filter(
          (vehicle) => {
            if (
              !normalizedSearch
            ) {
              return true;
            }

            return [
              vehicle.vehicleId,
              vehicle.plate,
              vehicle.model,
              vehicle.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                normalizedSearch
              );
          }
        );

      const copy =
        [...filtered];

      copy.sort(
        (a, b) => {
          if (
            typeof a[
              sortKey
            ] ===
            "string"
          ) {
            return String(
              a[
                sortKey
              ]
            ).localeCompare(
              String(
                b[
                  sortKey
                ]
              )
            );
          }

          return (
            Number(
              b[
                sortKey
              ] || 0
            ) -
            Number(
              a[
                sortKey
              ] || 0
            )
          );
        }
      );

      return copy;
    }, [
      vehicles,
      sortKey,
      search,
    ]);

  const exportRows =
    sorted.map(
      (vehicle) => ({
        vehicleId:
          vehicle.vehicleId,
        plate:
          vehicle.plate,
        model:
          vehicle.model,
        status:
          vehicle.status,
        mileageKm:
          vehicle.mileageKm,
        trips:
          vehicle.trips,
        avgDelay:
          vehicle.avgDelay,
        utilization:
          vehicle.utilization,
        incidents:
          vehicle.incidents,
      })
    );

  const exportColumns = [
    {
      header:
        "Véhicule",
      key:
        "vehicleId",
    },
    {
      header:
        "Immatriculation",
      key:
        "plate",
    },
    {
      header:
        "Modèle",
      key:
        "model",
    },
    {
      header:
        "Statut",
      key:
        "status",
    },
    {
      header:
        "Kilométrage",
      key:
        "mileageKm",
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
        "Utilisation",
      key:
        "utilization",
    },
    {
      header:
        "Incidents",
      key:
        "incidents",
    },
  ];

  function openAddModal() {
    setEditingVehicleId(
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
    vehicle
  ) {
    setEditingVehicleId(
      vehicle.vehicleId
    );

    setForm({
      vehicleId:
        vehicle.vehicleId,

      plate:
        vehicle.plate,

      model:
        vehicle.model,

      status:
        vehicle.status,

      mileageKm:
        Math.round(
          Number(
            vehicle.mileageKm ||
              0
          )
        ),

      trips:
        Math.round(
          Number(
            vehicle.trips ||
              0
          )
        ),

      avgDelay:
        Number(
          Number(
            vehicle.avgDelay ||
              0
          ).toFixed(
            1
          )
        ),

      utilization:
        Number(
          Number(
            vehicle.utilization ||
              0
          ).toFixed(
            1
          )
        ),

      incidents:
        Math.round(
          Number(
            vehicle.incidents ||
              0
          )
        ),
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

    setEditingVehicleId(
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

    const vehicleId =
      form.vehicleId
        .trim();

    const plate =
      form.plate
        .trim();

    const model =
      form.model
        .trim();

    if (
      !vehicleId ||
      !plate ||
      !model
    ) {
      setFormError(
        "L'identifiant, l'immatriculation et le modèle sont obligatoires."
      );

      return;
    }

    const duplicateId =
      vehicles.some(
        (
          vehicle
        ) =>
          vehicle.vehicleId ===
            vehicleId &&
          vehicle.vehicleId !==
            editingVehicleId
      );

    if (
      duplicateId
    ) {
      setFormError(
        "Cet identifiant véhicule existe déjà."
      );

      return;
    }

    const duplicatePlate =
      vehicles.some(
        (
          vehicle
        ) =>
          String(
            vehicle.plate
          ).toLowerCase() ===
            plate.toLowerCase() &&
          vehicle.vehicleId !==
            editingVehicleId
      );

    if (
      duplicatePlate
    ) {
      setFormError(
        "Cette immatriculation existe déjà."
      );

      return;
    }

    const normalizedVehicle =
      {
        vehicleId,

        plate,

        model,

        status:
          form.status,

        mileageKm:
          Math.max(
            0,
            Math.round(
              Number(
                form.mileageKm
              ) || 0
            )
          ),

        trips:
          Math.max(
            0,
            Math.round(
              Number(
                form.trips
              ) || 0
            )
          ),

        avgDelay:
          Math.max(
            0,
            Number(
              Number(
                form.avgDelay
              ).toFixed(
                1
              )
            ) || 0
          ),

        utilization:
          Math.max(
            0,
            Number(
              Number(
                form.utilization
              ).toFixed(
                1
              )
            ) || 0
          ),

        incidents:
          Math.max(
            0,
            Math.round(
              Number(
                form.incidents
              ) || 0
            )
          ),
      };

    if (
      editingVehicleId
    ) {
      setVehicles(
        (
          previous
        ) =>
          previous.map(
            (
              vehicle
            ) =>
              vehicle.vehicleId ===
              editingVehicleId
                ? normalizedVehicle
                : vehicle
          )
      );
    } else {
      setVehicles(
        (
          previous
        ) => [
          ...previous,
          normalizedVehicle,
        ]
      );
    }

    closeModal();
  }

  function deleteVehicle(
    vehicle
  ) {
    const confirmed =
      window.confirm(
        `Supprimer le véhicule ${vehicle.vehicleId} · ${vehicle.plate} ?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setVehicles(
      (
        previous
      ) =>
        previous.filter(
          (
            item
          ) =>
            item.vehicleId !==
            vehicle.vehicleId
        )
    );
  }

  function resetVehicles() {
    const confirmed =
      window.confirm(
        "Restaurer tous les véhicules de démonstration d'origine ?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setVehicles(
      initialStats
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div className="page-head">

        <div>

          <span className="kicker">
            Parc
          </span>

          <h1>
            Véhicules
          </h1>

          <p>
            Taux d'utilisation,
            kilométrage et état
            de maintenance de la
            flotte.
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
            filename="vehicules-sotreg"
            title="Parc véhicules SOTREG"
          />

          <button
            type="button"
            className="admin-save-btn"
            onClick={
              openAddModal
            }
          >
            + Ajouter un véhicule
          </button>

        </div>

      </div>


      {/* KPI */}

      <div className="kpi-row">

        <div className="kpi-card">

          <span className="kpi-label">
            Véhicules actifs
          </span>

          <span className="kpi-value">
            {activeCount}/
            {vehicles.length}
          </span>

        </div>


        <div className="kpi-card">

          <span className="kpi-label">
            Nécessitent attention
          </span>

          <span
            className={`kpi-value ${
              flagged.length >
              0
                ? "warn"
                : ""
            }`}
          >
            {
              flagged.length
            }
          </span>

          <span className="kpi-sub">
            maintenance ou
            immobilisé
          </span>

        </div>


        <div className="kpi-card">

          <span className="kpi-label">
            Utilisation moyenne
          </span>

          <span className="kpi-value">
            {averageUtilization.toFixed(
              0
            )}
            %
          </span>

          <span className="kpi-sub">
            taux d'occupation moyen
          </span>

        </div>

      </div>


      {/* VEHICULES FLAGGED */}

      {flagged.length >
        0 && (

        <div
          className="card"
          style={{
            marginBottom:
              18,

            borderColor:
              "rgba(198,138,46,0.35)",
          }}
        >

          <h3>
            À traiter en priorité
          </h3>

          <p className="card-sub">
            Véhicules signalés en
            maintenance requise
            ou immobilisés.
          </p>

          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                10,
            }}
          >

            {flagged.map(
              (
                vehicle
              ) => (

                <span
                  key={
                    vehicle.vehicleId
                  }
                  className={`pill ${statusPill(
                    vehicle.status
                  )}`}
                >
                  {
                    vehicle.vehicleId
                  }{" "}
                  ·{" "}
                  {
                    vehicle.plate
                  }{" "}
                  —{" "}
                  {
                    vehicle.status
                  }
                </span>

              )
            )}

          </div>

        </div>

      )}


      {/* TABLE */}

      <div className="card">

        <div className="crud-table-toolbar">

          <div>

            <h3>
              Flotte complète (
              {
                vehicles.length
              }
              )
            </h3>

            <p className="card-sub">
              Les modifications sont
              sauvegardées localement
              dans ce navigateur.
            </p>

          </div>


          <div className="crud-toolbar-controls">

            <input
              type="search"
              className="crud-search-input"
              placeholder="Rechercher véhicule..."
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

            <select
              value={
                sortKey
              }
              onChange={(
                event
              ) =>
                setSortKey(
                  event
                    .target
                    .value
                )
              }
              className="crud-sort-select"
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

            <button
              type="button"
              className="crud-reset-btn"
              onClick={
                resetVehicles
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

                <th>
                  Véhicule
                </th>

                <th>
                  Modèle
                </th>

                <th>
                  Statut
                </th>

                <th>
                  Km
                </th>

                <th>
                  Trajets
                </th>

                <th>
                  Retard moyen
                </th>

                <th>
                  Utilisation
                </th>

                <th>
                  Incidents
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {sorted.map(
                (
                  vehicle
                ) => (

                  <tr
                    key={
                      vehicle.vehicleId
                    }
                  >

                    <td>

                      {
                        vehicle.vehicleId
                      }{" "}

                      <span
                        style={{
                          color:
                            "var(--ink-faint)",
                        }}
                      >
                        ·{" "}
                        {
                          vehicle.plate
                        }
                      </span>

                    </td>


                    <td>
                      {
                        vehicle.model
                      }
                    </td>


                    <td>

                      <span
                        className={`pill ${statusPill(
                          vehicle.status
                        )}`}
                      >
                        {
                          vehicle.status
                        }
                      </span>

                    </td>


                    <td className="mono">
                      {Number(
                        vehicle.mileageKm ||
                          0
                      ).toLocaleString(
                        "fr-FR"
                      )}
                    </td>


                    <td className="mono">
                      {
                        vehicle.trips
                      }
                    </td>


                    <td className="mono">
                      {Number(
                        vehicle.avgDelay ||
                          0
                      ).toFixed(
                        1
                      )}{" "}
                      min
                    </td>


                    <td>

                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            8,
                        }}
                      >

                        <div
                          className="bar-track"
                          style={{
                            width:
                              70,
                          }}
                        >

                          <div
                            className={`bar-fill ${
                              vehicle.utilization >
                              100
                                ? "red"
                                : vehicle.utilization >
                                    85
                                  ? "amber"
                                  : "teal"
                            }`}
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  Number(
                                    vehicle.utilization ||
                                      0
                                  )
                                )}%`,
                            }}
                          />

                        </div>


                        <span
                          className="mono"
                          style={{
                            fontSize:
                              12,
                          }}
                        >
                          {Number(
                            vehicle.utilization ||
                              0
                          ).toFixed(
                            0
                          )}
                          %
                        </span>

                      </div>

                    </td>


                    <td className="mono">
                      {
                        vehicle.incidents
                      }
                    </td>


                    <td>

                      <div className="crud-row-actions">

                        <button
                          type="button"
                          className="crud-edit-btn"
                          onClick={() =>
                            openEditModal(
                              vehicle
                            )
                          }
                        >
                          Modifier
                        </button>


                        <button
                          type="button"
                          className="crud-delete-btn"
                          onClick={() =>
                            deleteVehicle(
                              vehicle
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


              {sorted.length ===
                0 && (

                <tr>

                  <td
                    colSpan={
                      9
                    }
                    className="crud-empty-row"
                  >
                    Aucun véhicule trouvé.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* MODAL */}

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
                  Gestion flotte
                </span>

                <h2>
                  {editingVehicleId
                    ? "Modifier le véhicule"
                    : "Ajouter un véhicule"}
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

                  Identifiant véhicule

                  <input
                    name="vehicleId"
                    value={
                      form.vehicleId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex: V29"
                    disabled={
                      Boolean(
                        editingVehicleId
                      )
                    }
                  />

                </label>


                <label>

                  Immatriculation

                  <input
                    name="plate"
                    value={
                      form.plate
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex: 12345-A-45"
                  />

                </label>


                <label>

                  Modèle

                  <input
                    name="model"
                    value={
                      form.model
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex: Mercedes Sprinter"
                  />

                </label>


                <label>

                  Statut

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="En service">
                      En service
                    </option>

                    <option value="Maintenance requise">
                      Maintenance requise
                    </option>

                    <option value="Immobilisé">
                      Immobilisé
                    </option>

                  </select>

                </label>


                <label>

                  Kilométrage

                  <input
                    type="number"
                    min="0"
                    name="mileageKm"
                    value={
                      form.mileageKm
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

                  Utilisation (%)

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="utilization"
                    value={
                      form.utilization
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
                  {editingVehicleId
                    ? "Enregistrer"
                    : "Ajouter le véhicule"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}