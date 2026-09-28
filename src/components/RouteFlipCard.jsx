import { useState } from "react";

export default function RouteFlipCard({ route }) {
  const [flipped, setFlipped] = useState(false);
  const onTimeGood = route.onTimeRate >= 85;

  return (
    <div className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
      <div className="flip-card-inner">
        <div className="flip-face flip-front">
          <div>
            <div className="flip-route-name">{route.name}</div>
            <div className="flip-sub">{route.trips} trajets · 90j</div>
          </div>
          <div className="flip-metric">
            <span className="val" style={{ color: onTimeGood ? "var(--teal-deep)" : "var(--amber)" }}>
              {route.onTimeRate.toFixed(0)}%
            </span>
            <span className="unit">ponctualité</span>
          </div>
          <div className="flip-hint">Cliquer pour le détail →</div>
        </div>

        <div className="flip-face flip-back">
          <div className="flip-back-title">{route.name}</div>
          <div className="flip-back-rows">
            <div className="flip-back-row"><span>Retard moyen</span><strong>{route.avgDelay.toFixed(1)} min</strong></div>
            <div className="flip-back-row"><span>Passagers moy.</span><strong>{route.avgPassengers.toFixed(0)}</strong></div>
            <div className="flip-back-row"><span>Coût total</span><strong>{Math.round(route.totalCost).toLocaleString("fr-FR")} MAD</strong></div>
          </div>
          <div className="flip-hint">← Retour</div>
        </div>
      </div>
    </div>
  );
}
