import { NavLink } from "react-router-dom";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  route: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19h7a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3h-9a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="11" rx="1.5" /><path d="M15 9h4l3 3v5h-7z" /><circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
      <circle cx="17.5" cy="9" r="2.5" /><path d="M15.5 13.4c2.9.4 5 2.6 5 6.1" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3 3-2-2 3-3z" />
    </svg>
  ),
};

const links = [
  { to: "/", label: "Tableau de bord", icon: "dashboard" },
  { to: "/carte", label: "Carte en direct", icon: "map" },
  { to: "/routes", label: "Trajets & retards", icon: "route" },
  { to: "/vehicules", label: "Véhicules", icon: "truck" },
  { to: "/chauffeurs", label: "Chauffeurs", icon: "users" },
  { to: "/kpis", label: "KPIs & OKR", icon: "target" },
  { to: "/support", label: "Support technique", icon: "wrench" },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div>
        <div className="brand">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#04241E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M12 3v18" />
            </svg>
          </span>
          SOTREG
        </div>
        <div className="brand-sub">Khouribga · Transport</div>
      </div>

      <nav className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
            {icons[l.icon]}
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="live-badge"><span className="live-dot" /> Simulation live</span>
        <br />
        Données de démonstration générées localement — 90 jours d'historique, 28 véhicules.
      </div>
    </div>
  );
}
