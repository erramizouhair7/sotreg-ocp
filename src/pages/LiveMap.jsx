import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useData } from "../hooks/useData";
import { useTickets } from "../context/TicketsContext";
import { pathMeta, pointAt } from "../utils/geo";
import { CHART_PALETTE } from "../utils/chartTheme";

const STATUS_COLOR = {
  "En route": "#2E86BD",
  "À l'arrêt (station)": "#D9A34D",
  Embarquement: "#A98FD2",
};
const STATUS_LABELS = ["Tous", "En route", "À l'arrêt (station)", "Embarquement"];
const SPEED_OPTIONS = [1, 5, 30, 120];
const DWELL_MS = 3200;

function vehicleIcon(color, bearing, selected) {
  const size = selected ? 30 : 21;
  return L.divIcon({
    className: "",
    html: `
      <div style="width:${size}px; height:${size}px; position:relative;">
        ${selected ? `<div class="veh-ping" style="border-color:${color};"></div>` : ""}
        <div style="width:100%; height:100%; transform:rotate(${bearing}deg); display:flex; align-items:center; justify-content:center;">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="${color}" fill-opacity="0.18"/>
            <path d="M12 2.5 L18.5 19 L12 15 L5.5 19 Z" fill="${color}" stroke="#05070D" stroke-width="1.1"/>
          </svg>
        </div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
function stationIcon(selected) {
  const size = selected ? 15 : 10;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px; height:${size}px; border-radius:4px; transform:rotate(45deg); background:#05070D; border:2.5px solid #C05CFF; box-shadow:0 0 9px rgba(192,92,255,0.8);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitNetwork({ routes }) {
  const map = useMap();
  useEffect(() => {
    const allPoints = routes.flatMap((r) => r.path);
    if (allPoints.length) map.fitBounds(allPoints, { padding: [70, 70] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("fr-FR", { hour12: false });
}

export default function LiveMap() {
  const data = useData();
  const { addTicket } = useTickets();
  const clock = useLiveClock();

  const pathMetas = useMemo(() => {
    const map = {};
    data.routes.forEach((r) => (map[r.id] = pathMeta(r.path)));
    return map;
  }, [data.routes]);
  const routeById = useMemo(() => {
    const map = {};
    data.routes.forEach((r) => (map[r.id] = r));
    return map;
  }, [data.routes]);

  const initialFleet = useMemo(
    () => data.liveFleet.map((v) => ({ ...v, initialPos: pointAt(pathMetas[v.routeId], v.progress) })),
    [data.liveFleet, pathMetas]
  );

  const simRef = useRef(
    Object.fromEntries(
      initialFleet.map((v) => [
        v.vehicleId,
        { progress: v.progress, direction: v.direction, dwellMs: 0, status: v.status, speedKmh: v.speedKmh, occupancy: v.occupancy },
      ])
    )
  );
  const markerRefs = useRef({});
  const lastIconKeyRef = useRef({});
  const rafRef = useRef();
  const lastFrameRef = useRef(performance.now());
  const speedMultRef = useRef(1);
  const mapRef = useRef(null);

  const [speedMult, setSpeedMult] = useState(1);
  const [selected, setSelected] = useState(null);
  const [hiddenRoutes, setHiddenRoutes] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("Panne moteur");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSent, setReportSent] = useState(null);
  const [display, setDisplay] = useState(() => ({ ...simRef.current }));
  const lastDisplayPushRef = useRef(0);

  function changeSpeed(mult) {
    speedMultRef.current = mult;
    setSpeedMult(mult);
  }

  useEffect(() => {
    function frame(now) {
      const dt = now - lastFrameRef.current;
      lastFrameRef.current = now;
      const simDt = dt * speedMultRef.current;

      for (const v of initialFleet) {
        const sim = simRef.current[v.vehicleId];
        const route = routeById[v.routeId];
        if (!sim || !route) continue;

        if (sim.dwellMs > 0) {
          sim.dwellMs = Math.max(0, sim.dwellMs - simDt);
          sim.status = sim.dwellMs > DWELL_MS / 2 ? "À l'arrêt (station)" : "Embarquement";
        } else {
          const kmPerMs = sim.speedKmh / 3600000;
          const frac = route.distanceKm ? (kmPerMs * simDt) / route.distanceKm : 0;
          let progress = sim.progress + frac * sim.direction;
          if (progress >= 1) {
            progress = 1;
            sim.direction = -1;
            sim.dwellMs = DWELL_MS;
            sim.status = "À l'arrêt (station)";
          } else if (progress <= 0) {
            progress = 0;
            sim.direction = 1;
            sim.dwellMs = DWELL_MS;
            sim.status = "À l'arrêt (station)";
          } else {
            sim.status = "En route";
          }
          sim.progress = progress;
        }

        const marker = markerRefs.current[v.vehicleId];
        if (marker) {
          const p = pointAt(pathMetas[v.routeId], sim.progress);
          marker.setLatLng([p.lat, p.lng]);
          const bearing = sim.direction === 1 ? p.bearing : p.bearing + 180;
          const isSel = selected?.type === "vehicle" && selected.id === v.vehicleId;
          const iconKey = `${sim.status}|${Math.round(bearing / 10)}|${isSel}`;
          if (lastIconKeyRef.current[v.vehicleId] !== iconKey) {
            lastIconKeyRef.current[v.vehicleId] = iconKey;
            marker.setIcon(vehicleIcon(STATUS_COLOR[sim.status] || "#93A6BD", bearing, isSel));
          }
        }
      }

      if (now - lastDisplayPushRef.current > 400) {
        lastDisplayPushRef.current = now;
        setDisplay({ ...Object.fromEntries(Object.entries(simRef.current).map(([k, v]) => [k, { ...v }])) });
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFleet, routeById, pathMetas, selected]);

  const visibleRoutes = data.routes.filter((r) => !hiddenRoutes.has(r.id));
  function toggleRoute(id) {
    setHiddenRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedVehicleMeta = selected?.type === "vehicle" ? initialFleet.find((v) => v.vehicleId === selected.id) : null;
  const selectedVehicleSim = selectedVehicleMeta ? display[selectedVehicleMeta.vehicleId] : null;
  const selectedStation =
    selected?.type === "station"
      ? data.routes.flatMap((r) => r.stations.map((s) => ({ ...s, routeId: r.id, routeName: r.name }))).find((s) => s.id === selected.id)
      : null;

  const upcomingForStation = useMemo(() => {
    if (!selectedStation) return [];
    return initialFleet
      .filter((v) => v.routeId === selectedStation.routeId)
      .map((v) => ({ ...v, sim: display[v.vehicleId] }))
      .filter((v) => v.sim && (v.sim.direction === 1 ? v.sim.progress <= selectedStation.progress : v.sim.progress >= selectedStation.progress))
      .map((v) => {
        const route = routeById[v.routeId];
        const distFrac = Math.abs(selectedStation.progress - v.sim.progress);
        const etaMin = Math.max(1, Math.round(((distFrac * route.distanceKm) / v.sim.speedKmh) * 60));
        return { ...v, etaMin };
      })
      .sort((a, b) => a.etaMin - b.etaMin)
      .slice(0, 4);
  }, [selectedStation, display, initialFleet, routeById]);

  function submitReport() {
    if (!selectedVehicleMeta) return;
    const id = addTicket({
      vehicleId: selectedVehicleMeta.vehicleId,
      category: reportCategory,
      priority: "Moyenne",
      description: reportDesc || `Signalement depuis la carte en direct — véhicule ${selectedVehicleMeta.vehicleId}.`,
    });
    setReportSent(id);
    setReportDesc("");
    setReportOpen(false);
  }

  // ---------- Left panel: searchable / filterable live vehicle list ----------
  const enrichedFleet = initialFleet.map((v) => ({ ...v, sim: display[v.vehicleId] })).filter((v) => v.sim);
  const counts = {
    "En route": enrichedFleet.filter((v) => v.sim.status === "En route").length,
    "À l'arrêt (station)": enrichedFleet.filter((v) => v.sim.status === "À l'arrêt (station)").length,
    Embarquement: enrichedFleet.filter((v) => v.sim.status === "Embarquement").length,
  };
  const q = search.trim().toLowerCase();
  const filteredList = enrichedFleet.filter((v) => {
    if (statusFilter !== "Tous" && v.sim.status !== statusFilter) return false;
    if (!q) return true;
    const route = routeById[v.routeId];
    const driver = data.drivers.find((d) => d.id === v.driverId);
    return (
      v.vehicleId.toLowerCase().includes(q) ||
      v.plate.toLowerCase().includes(q) ||
      route?.name.toLowerCase().includes(q) ||
      driver?.name.toLowerCase().includes(q)
    );
  });

  function focusVehicle(v) {
    setSelected({ type: "vehicle", id: v.vehicleId });
    const p = pointAt(pathMetas[v.routeId], v.sim.progress);
    mapRef.current?.flyTo([p.lat, p.lng], 13, { duration: 1.1 });
  }

  const dataLoaded = data.trips.length > 0;

  return (
    <div className="map-page">
      <style>{`
        .veh-ping{position:absolute; inset:-9px; border-radius:50%; border:2px solid; opacity:0.9; animation:mapPing 1.5s ease-out infinite;}
        @keyframes mapPing{0%{transform:scale(0.55); opacity:0.85;} 100%{transform:scale(1.7); opacity:0;}}
      `}</style>

      <div className="map-canvas">
        <MapContainer
          center={[32.865, -6.92]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom
          preferCanvas
          ref={mapRef}
        >
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitNetwork routes={data.routes} />

          {visibleRoutes.map((r, i) => (
            <div key={r.id}>
              <Polyline positions={r.path} pathOptions={{ color: CHART_PALETTE[i % CHART_PALETTE.length], weight: 7, opacity: 0.09 }} />
              <Polyline positions={r.path} pathOptions={{ color: CHART_PALETTE[i % CHART_PALETTE.length], weight: 2.5, opacity: 0.6 }} />
            </div>
          ))}

          {visibleRoutes.flatMap((r) =>
            r.stations.map((s) => (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={stationIcon(selected?.type === "station" && selected.id === s.id)} eventHandlers={{ click: () => setSelected({ type: "station", id: s.id }) }}>
                <Tooltip direction="top" offset={[0, -6]}>{s.name}</Tooltip>
              </Marker>
            ))
          )}

          {initialFleet.map((v) => (
            <Marker
              key={v.vehicleId}
              position={[v.initialPos.lat, v.initialPos.lng]}
              icon={vehicleIcon(STATUS_COLOR[v.status] || "#93A6BD", 0, false)}
              opacity={hiddenRoutes.has(v.routeId) ? 0 : 1}
              eventHandlers={{ click: () => setSelected({ type: "vehicle", id: v.vehicleId }) }}
              ref={(m) => {
                if (m) markerRefs.current[v.vehicleId] = m;
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>{v.vehicleId} · {v.plate}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-topbar">
        <Link to="/" className="map-back-btn">← Tableau de bord</Link>
        <div className="map-title-block">
          <span className="live-badge"><span className="live-dot" /> Live</span>
          <h1>Réseau SOTREG — Khouribga</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="data-loaded-badge">✓ Données chargées</span>
          <span className="map-clock">{clock}</span>
        </div>
      </div>

      <div className="map-side-panel left">
        <span className="map-brand-chip">SOTREG</span>
        <div className="map-panel-heading">
          <h2>Carte en Direct</h2>
          <p>{initialFleet.length} véhicules · {data.routes.length} lignes depuis Khouribga</p>
        </div>

        <div className="speed-row">
          <div className="speed-row-label">Vitesse sim.</div>
          <div className="speed-btns">
            {SPEED_OPTIONS.map((s) => (
              <button key={s} className={`speed-btn ${speedMult === s ? "active" : ""}`} onClick={() => changeSpeed(s)}>×{s}</button>
            ))}
          </div>
        </div>

        <input className="map-search-input" placeholder="Ligne, véhicule, chauffeur..." value={search} onChange={(e) => setSearch(e.target.value)} />

        <div className="filter-chip-row">
          {STATUS_LABELS.map((s) => (
            <button key={s} className={`filter-chip ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s === "À l'arrêt (station)" ? "À l'arrêt" : s}
            </button>
          ))}
        </div>

        <div className="count-grid">
          <div className="count-box"><span className="num" style={{ color: STATUS_COLOR["En route"] }}>{counts["En route"]}</span><span className="lbl">En route</span></div>
          <div className="count-box"><span className="num" style={{ color: STATUS_COLOR["À l'arrêt (station)"] }}>{counts["À l'arrêt (station)"]}</span><span className="lbl">À l'arrêt</span></div>
          <div className="count-box"><span className="num" style={{ color: STATUS_COLOR["Embarquement"] }}>{counts["Embarquement"]}</span><span className="lbl">Embarque.</span></div>
        </div>

        <div className="veh-list">
          {filteredList.length === 0 && <p className="stats-empty">Aucun véhicule ne correspond.</p>}
          {filteredList.map((v) => {
            const route = routeById[v.routeId];
            const isSel = selected?.type === "vehicle" && selected.id === v.vehicleId;
            return (
              <button key={v.vehicleId} className={`veh-list-item ${isSel ? "selected" : ""}`} onClick={() => focusVehicle(v)}>
                <span className="veh-list-dot" style={{ background: STATUS_COLOR[v.sim.status], color: STATUS_COLOR[v.sim.status] }} />
                <div className="veh-list-main">
                  <div className="veh-list-name">{route?.name}</div>
                  <div className="veh-list-sub">{v.vehicleId} · {v.plate}</div>
                </div>
                <span className="veh-list-speed">{v.sim.status === "En route" ? `${v.sim.speedKmh} km/h` : "—"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-side-panel right">
        {!selected && (
          <div>
            <span className="map-brand-chip">SOTREG</span>
            <div className="map-panel-title">Statut</div>
            <div className="legend-row" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <div className="legend-item"><span className="legend-dot" style={{ background: STATUS_COLOR["En route"], color: STATUS_COLOR["En route"] }} /> En route</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: STATUS_COLOR["À l'arrêt (station)"], color: STATUS_COLOR["À l'arrêt (station)"] }} /> À l'arrêt (station)</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: STATUS_COLOR["Embarquement"], color: STATUS_COLOR["Embarquement"] }} /> Embarquement</div>
            </div>

            <div className="map-panel-title" style={{ marginTop: 18 }}>Arrêts</div>
            <div className="legend-item"><span className="legend-diamond" /> Arrêt / station (cliquable)</div>

            <div className="map-panel-title" style={{ marginTop: 18 }}>Lignes affichées ({visibleRoutes.length}/{data.routes.length})</div>
            <div className="route-filter-list">
              {data.routes.map((r, i) => (
                <label key={r.id} className="route-filter-item">
                  <input type="checkbox" checked={!hiddenRoutes.has(r.id)} onChange={() => toggleRoute(r.id)} />
                  <span className="route-filter-dot" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length], color: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  {r.name}
                </label>
              ))}
            </div>

            <p className="hint-note">
              Cliquez sur un véhicule ou un arrêt pour son détail. Utilisez la vitesse de simulation pour
              accélérer le temps (utile pour visualiser une journée complète en quelques minutes).
              {!dataLoaded && " Chargement des données..."}
            </p>
          </div>
        )}

        {selectedVehicleMeta && selectedVehicleSim && (
          <div>
            <div className="map-panel-title">Véhicule</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div className="vehicle-avatar" style={{ background: `${STATUS_COLOR[selectedVehicleSim.status]}22`, color: STATUS_COLOR[selectedVehicleSim.status] }}>
                {selectedVehicleMeta.vehicleId.replace("V", "")}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{selectedVehicleMeta.vehicleId} · {selectedVehicleMeta.plate}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{selectedVehicleMeta.model}</div>
              </div>
            </div>

            <div className="detail-rows">
              <div className="detail-row"><span>Ligne</span><strong>{routeById[selectedVehicleMeta.routeId]?.name}</strong></div>
              <div className="detail-row"><span>Chauffeur</span><strong>{data.drivers.find((d) => d.id === selectedVehicleMeta.driverId)?.name}</strong></div>
              <div className="detail-row"><span>Statut</span><span className={`pill ${selectedVehicleSim.status === "En route" ? "ok" : selectedVehicleSim.status === "Embarquement" ? "neutral" : "warn"}`}>{selectedVehicleSim.status}</span></div>
              <div className="detail-row"><span>Vitesse</span><strong>{selectedVehicleSim.status === "En route" ? selectedVehicleSim.speedKmh : 0} km/h</strong></div>
              <div className="detail-row">
                <span>Occupation</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="bar-track" style={{ width: 60 }}>
                    <div className={`bar-fill ${selectedVehicleSim.occupancy > 1 ? "red" : selectedVehicleSim.occupancy > 0.85 ? "amber" : "teal"}`} style={{ width: `${Math.min(100, selectedVehicleSim.occupancy * 100)}%` }} />
                  </div>
                  <strong>{Math.round(selectedVehicleSim.occupancy * 100)}%</strong>
                </div>
              </div>
            </div>

            {!reportOpen && !reportSent && (
              <button className="admin-reset-btn" style={{ marginTop: 16, width: "100%" }} onClick={() => setReportOpen(true)}>⚠ Signaler un incident</button>
            )}
            {reportSent && <p className="pill ok" style={{ marginTop: 16 }}>Ticket {reportSent} créé — voir Support technique</p>}
            {reportOpen && (
              <div className="report-form">
                <label>
                  Catégorie
                  <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
                    <option>Panne moteur</option><option>GPS hors ligne</option><option>Climatisation</option><option>Freinage</option><option>Autre</option>
                  </select>
                </label>
                <label>
                  Description
                  <textarea rows={3} value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder="Décrivez le problème observé..." />
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="admin-save-btn" onClick={submitReport}>Envoyer</button>
                  <button className="admin-reset-btn" onClick={() => setReportOpen(false)}>Annuler</button>
                </div>
              </div>
            )}
            <button className="admin-reset-btn" style={{ marginTop: 10, width: "100%" }} onClick={() => setSelected(null)}>← Retour à la légende</button>
          </div>
        )}

        {selectedStation && (
          <div>
            <div className="map-panel-title">Arrêt</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedStation.name}</div>
            <p className="card-sub">Ligne {selectedStation.routeName}</p>
            <div className="map-panel-title" style={{ marginTop: 18 }}>Prochains passages</div>
            {upcomingForStation.length === 0 ? (
              <p className="detail-empty" style={{ height: "auto", padding: "10px 0" }}>Aucun véhicule à l'approche pour le moment.</p>
            ) : (
              <div className="detail-rows">
                {upcomingForStation.map((v) => (
                  <div className="detail-row" key={v.vehicleId}><span>{v.vehicleId} · {v.plate}</span><strong>{v.etaMin} min</strong></div>
                ))}
              </div>
            )}
            <button className="admin-reset-btn" style={{ marginTop: 16, width: "100%" }} onClick={() => setSelected(null)}>← Retour à la légende</button>
          </div>
        )}
      </div>
    </div>
  );
}
