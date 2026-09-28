// Small geo helpers to move a marker smoothly along a route's path (array of [lat,lng]).

export function haversine([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Precompute cumulative distance along a path, for interpolation.
export function pathMeta(path) {
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + haversine(path[i - 1], path[i]));
  }
  return { path, cum, total: cum[cum.length - 1] };
}

// t in [0,1] -> {lat, lng, bearing}
export function pointAt(meta, t) {
  const target = Math.max(0, Math.min(1, t)) * meta.total;
  let i = 1;
  while (i < meta.cum.length && meta.cum[i] < target) i++;
  i = Math.min(i, meta.path.length - 1);
  const segStart = meta.cum[i - 1];
  const segEnd = meta.cum[i];
  const segT = segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0;
  const [lat1, lng1] = meta.path[i - 1];
  const [lat2, lng2] = meta.path[i];
  const lat = lat1 + (lat2 - lat1) * segT;
  const lng = lng1 + (lng2 - lng1) * segT;
  const bearing = (Math.atan2(lng2 - lng1, lat2 - lat1) * 180) / Math.PI;
  return { lat, lng, bearing };
}
