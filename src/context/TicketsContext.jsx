import { createContext, useContext, useState } from "react";

const TicketsContext = createContext(null);

const SEED_TICKETS = [
  {
    id: "TCK-101",
    vehicleId: "V14",
    category: "Panne moteur",
    priority: "Haute",
    status: "En cours",
    description: "Surchauffe moteur signalée par le chauffeur sur la ligne Oued Zem → Site Daoui.",
    createdAt: "2026-09-07T08:12:00.000Z",
  },
  {
    id: "TCK-102",
    vehicleId: "V22",
    category: "GPS hors ligne",
    priority: "Moyenne",
    status: "Ouvert",
    description: "Le boîtier GPS ne remonte plus de position depuis ce matin.",
    createdAt: "2026-09-08T14:40:00.000Z",
  },
  {
    id: "TCK-103",
    vehicleId: "V05",
    category: "Climatisation",
    priority: "Basse",
    status: "Résolu",
    description: "Climatisation faible côté arrière du véhicule — intervention atelier effectuée.",
    createdAt: "2026-09-05T10:05:00.000Z",
  },
];

export function TicketsProvider({ children }) {
  const [tickets, setTickets] = useState(SEED_TICKETS);

  function addTicket(ticket) {
    const id = `TCK-${100 + tickets.length + 1}`;
    setTickets((prev) => [
      { id, status: "Ouvert", createdAt: new Date().toISOString(), ...ticket },
      ...prev,
    ]);
    return id;
  }

  function updateStatus(id, status) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <TicketsContext.Provider value={{ tickets, addTicket, updateStatus }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
