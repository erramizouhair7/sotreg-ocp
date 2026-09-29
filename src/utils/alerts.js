import {
  delayByRoute,
  vehicleStats,
} from "./analytics";

export function buildAlerts(data, tickets = []) {
  const alerts = [];

  /*
   * =====================================================
   * RETARDS PAR LIGNE
   * =====================================================
   */

  const routes = delayByRoute(data);

  routes.forEach((route) => {
    if (route.avgDelay < 10) {
      return;
    }

    const critical =
      route.avgDelay >= 15;

    alerts.push({
      id: `ROUTE-${route.routeId}`,

      type: "RETARD",

      severity:
        critical
          ? "critical"
          : "warning",

      title:
        critical
          ? "Retard critique"
          : "Retard important",

      message:
        `${route.name} présente un retard moyen de ` +
        `${route.avgDelay.toFixed(1)} min.`,

      source: route.name,

      value:
        `${route.avgDelay.toFixed(1)} min`,

      link: "/routes",

      category: "Retards",
    });
  });

  /*
   * =====================================================
   * VEHICULES
   * =====================================================
   */

  const vehicles = vehicleStats(data);

  vehicles.forEach((vehicle) => {
    if (vehicle.status === "En service") {
      return;
    }

    const critical =
      vehicle.status === "Immobilisé";

    alerts.push({
      id: `VEHICLE-${vehicle.vehicleId}`,

      type: "VEHICULE",

      severity:
        critical
          ? "critical"
          : "warning",

      title:
        critical
          ? "Véhicule immobilisé"
          : "Maintenance requise",

      message:
        `${vehicle.vehicleId} · ${vehicle.plate} — ` +
        `${vehicle.status}.`,

      source: vehicle.vehicleId,

      value: vehicle.status,

      link: "/vehicules",

      category: "Maintenance",
    });
  });

  /*
   * =====================================================
   * TICKETS TECHNIQUES
   * =====================================================
   */

  tickets.forEach((ticket) => {
    if (ticket.status === "Résolu") {
      return;
    }

    /*
     * Ticket haute priorité
     */

    if (ticket.priority === "Haute") {
      alerts.push({
        id: `TICKET-HIGH-${ticket.id}`,

        type: "TICKET",

        severity: "critical",

        title: "Ticket haute priorité",

        message:
          `${ticket.id} · Véhicule ${ticket.vehicleId} · ` +
          `${ticket.category}.`,

        source: ticket.id,

        value: "Haute",

        link: "/support",

        category: "Tickets",
      });
    }

    /*
     * GPS hors ligne
     */

    if (
      ticket.category ===
      "GPS hors ligne"
    ) {
      alerts.push({
        id: `GPS-${ticket.id}`,

        type: "GPS",

        severity: "warning",

        title: "GPS hors ligne",

        message:
          `Le véhicule ${ticket.vehicleId} ne remonte ` +
          `plus correctement sa position.`,

        source: ticket.vehicleId,

        value: "GPS",

        link: "/support",

        category: "GPS",
      });
    }
  });

  /*
   * Critiques en premier
   */

  const priority = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return alerts.sort(
    (a, b) =>
      priority[a.severity] -
      priority[b.severity]
  );
}