import {
  useMemo,
  useState,
} from "react";

import { useData }
  from "../hooks/useData";

import { useTickets }
  from "../context/TicketsContext";

import { useNotifications }
  from "../context/NotificationsContext";

import { sendEmailNotification }
  from "../services/emailService";

function statusPill(status) {
  if (status === "Résolu")
    return "ok";

  if (status === "En cours")
    return "neutral";

  return "warn";
}

function priorityPill(priority) {
  if (priority === "Haute")
    return "bad";

  if (priority === "Moyenne")
    return "warn";

  return "neutral";
}

export default function TechnicalSupport() {
  const data = useData();

  const {
    tickets,
    addTicket,
    updateStatus,
  } = useTickets();

  const {
    addNotification,
  } = useNotifications();

  const [filter, setFilter] =
    useState("Tous");

  const [formOpen, setFormOpen] =
    useState(false);

  const [emailFeedback, setEmailFeedback] =
    useState("");

  const [form, setForm] =
    useState({
      vehicleId:
        data.vehicles[0]?.id,
      category: "Panne moteur",
      priority: "Moyenne",
      description: "",
    });

  const filtered = useMemo(() => {
    if (filter === "Tous")
      return tickets;

    return tickets.filter(
      (ticket) =>
        ticket.status === filter
    );
  }, [tickets, filter]);

  const counts = {
    Ouvert:
      tickets.filter(
        (ticket) =>
          ticket.status === "Ouvert"
      ).length,

    "En cours":
      tickets.filter(
        (ticket) =>
          ticket.status === "En cours"
      ).length,

    Résolu:
      tickets.filter(
        (ticket) =>
          ticket.status === "Résolu"
      ).length,
  };

  async function submit(e) {
    e.preventDefault();

    const ticketId =
      addTicket({ ...form });

    const notificationTitle =
      form.priority === "Haute"
        ? "Incident prioritaire"
        : "Nouveau ticket technique";

    const notificationMessage =
      `${ticketId} · Véhicule ${form.vehicleId} · ` +
      `${form.category} · Priorité ${form.priority}`;

    addNotification({
      type:
        form.priority === "Haute"
          ? "danger"
          : "warning",

      title: notificationTitle,

      message:
        notificationMessage,

      link: "/support",
    });

    setEmailFeedback(
      "Envoi de l'e-mail..."
    );

    const emailResult =
      await sendEmailNotification({
        subject:
          `[SOTREG] ${notificationTitle} - ${ticketId}`,

        type: form.category,

        message:
          `Un nouveau ticket technique a été créé.\n\n` +
          `Ticket : ${ticketId}\n` +
          `Véhicule : ${form.vehicleId}\n` +
          `Catégorie : ${form.category}\n` +
          `Priorité : ${form.priority}\n` +
          `Description : ${
            form.description ||
            "Non renseignée"
          }`,
      });

    if (emailResult.success) {
      setEmailFeedback(
        "Notification e-mail envoyée."
      );
    } else if (emailResult.skipped) {
      setEmailFeedback(
        "Ticket créé. EmailJS n'est pas encore configuré."
      );
    } else {
      setEmailFeedback(
        "Ticket créé, mais l'e-mail n'a pas pu être envoyé."
      );
    }

    setForm({
      vehicleId:
        data.vehicles[0]?.id,
      category: "Panne moteur",
      priority: "Moyenne",
      description: "",
    });

    setFormOpen(false);
  }

  async function handleStatusChange(
    ticket,
    newStatus
  ) {
    updateStatus(
      ticket.id,
      newStatus
    );

    if (newStatus !== "Résolu") {
      return;
    }

    const message =
      `Le ticket ${ticket.id} concernant ` +
      `le véhicule ${ticket.vehicleId} ` +
      `a été marqué comme résolu.`;

    addNotification({
      type: "success",
      title: "Ticket résolu",
      message,
      link: "/support",
    });

    await sendEmailNotification({
      subject:
        `[SOTREG] Ticket ${ticket.id} résolu`,

      type: "Résolution ticket",

      message,
    });
  }

  return (
    <div>

      <div className="page-head">

        <div>

          <span className="kicker">
            Maintenance
          </span>

          <h1>
            Support technique
          </h1>

          <p>
            Tickets d'incidents véhicules —
            ouverts depuis l'atelier ou signalés
            depuis la carte en direct.
          </p>

        </div>

        <button
          className="admin-save-btn"
          onClick={() =>
            setFormOpen(
              (value) => !value
            )
          }
        >
          {formOpen
            ? "Fermer"
            : "+ Nouveau ticket"}
        </button>

      </div>

      {emailFeedback && (
        <div
          className="card"
          style={{
            marginBottom: 14,
            padding: "12px 16px",
          }}
        >
          {emailFeedback}
        </div>
      )}

      <div className="kpi-row">

        <div className="kpi-card">
          <span className="kpi-label">
            Ouverts
          </span>

          <span className="kpi-value warn">
            {counts.Ouvert}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            En cours
          </span>

          <span className="kpi-value">
            {counts["En cours"]}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            Résolus
          </span>

          <span className="kpi-value">
            {counts.Résolu}
          </span>
        </div>

      </div>

      {formOpen && (
        <form
          className="card report-form"
          style={{
            marginBottom: 18,
            maxWidth: 480,
          }}
          onSubmit={submit}
        >

          <h3 style={{ marginTop: 0 }}>
            Nouveau ticket
          </h3>

          <label>
            Véhicule concerné

            <select
              value={form.vehicleId}
              onChange={(e) =>
                setForm({
                  ...form,
                  vehicleId:
                    e.target.value,
                })
              }
            >
              {data.vehicles.map(
                (vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.id} ·{" "}
                    {vehicle.plate}
                  </option>
                )
              )}
            </select>

          </label>

          <label>
            Catégorie

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              <option>
                Panne moteur
              </option>

              <option>
                GPS hors ligne
              </option>

              <option>
                Climatisation
              </option>

              <option>
                Freinage
              </option>

              <option>
                Carrosserie
              </option>

              <option>
                Autre
              </option>
            </select>

          </label>

          <label>
            Priorité

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority:
                    e.target.value,
                })
              }
            >
              <option>Basse</option>
              <option>Moyenne</option>
              <option>Haute</option>
            </select>

          </label>

          <label>
            Description

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              placeholder="Détails de l'incident..."
            />

          </label>

          <button
            className="admin-save-btn"
            type="submit"
          >
            Créer le ticket
          </button>

        </form>
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
            Tickets ({filtered.length})
          </h3>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(
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
            <option>Tous</option>
            <option>Ouvert</option>
            <option>En cours</option>
            <option>Résolu</option>
          </select>

        </div>

        <table className="data-table">

          <thead>
            <tr>
              <th>Ticket</th>
              <th>Véhicule</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Description</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {filtered.map(
              (ticket) => (
                <tr key={ticket.id}>

                  <td className="mono">
                    {ticket.id}
                  </td>

                  <td>
                    {ticket.vehicleId}
                  </td>

                  <td>
                    {ticket.category}
                  </td>

                  <td>
                    <span
                      className={`pill ${priorityPill(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td
                    style={{
                      maxWidth: 280,
                    }}
                  >
                    {ticket.description}
                  </td>

                  <td>
                    <span
                      className={`pill ${statusPill(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  <td>

                    {ticket.status !==
                      "Résolu" && (
                      <select
                        value={
                          ticket.status
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            ticket,
                            e.target.value
                          )
                        }
                        style={{
                          fontSize: 12,
                          padding:
                            "5px 8px",
                          borderRadius: 8,
                          border:
                            "1px solid var(--line-strong)",
                        }}
                      >
                        <option>
                          Ouvert
                        </option>

                        <option>
                          En cours
                        </option>

                        <option>
                          Résolu
                        </option>
                      </select>
                    )}

                  </td>

                </tr>
              )
            )}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    color:
                      "var(--ink-faint)",
                  }}
                >
                  Aucun ticket dans cette
                  catégorie.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}