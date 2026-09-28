// Pure functions that turn the raw trip log into the aggregates each page needs.
// Nothing here talks to a server — it all runs client-side over the demo dataset.

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function kpiSummary(data) {
  const { trips } = data;
  const onTime = trips.filter((t) => t.delayMin <= 5).length;
  const totalPassengers = trips.reduce((a, t) => a + t.passengers, 0);
  const incidents = trips.filter((t) => t.incident).length;
  const totalCost = trips.reduce((a, t) => a + t.cost, 0);
  return {
    totalTrips: trips.length,
    totalPassengers,
    onTimeRate: trips.length ? (onTime / trips.length) * 100 : 0,
    avgDelay: avg(trips.map((t) => t.delayMin)),
    incidents,
    totalCost,
  };
}

export function delayByRoute(data) {
  const { routes, trips } = data;
  return routes
    .map((r) => {
      const rTrips = trips.filter((t) => t.routeId === r.id);
      const onTime = rTrips.filter((t) => t.delayMin <= 5).length;
      return {
        routeId: r.id,
        name: r.name,
        avgDelay: avg(rTrips.map((t) => t.delayMin)),
        onTimeRate: rTrips.length ? (onTime / rTrips.length) * 100 : 0,
        trips: rTrips.length,
        avgPassengers: avg(rTrips.map((t) => t.passengers)),
        totalCost: rTrips.reduce((a, t) => a + t.cost, 0),
      };
    })
    .sort((a, b) => b.avgDelay - a.avgDelay);
}

export function vehicleStats(data) {
  const { vehicles, trips } = data;
  return vehicles
    .map((v) => {
      const vTrips = trips.filter((t) => t.vehicleId === v.id);
      const incidents = vTrips.filter((t) => t.incident).length;
      const utilization = avg(vTrips.map((t) => t.passengers / t.capacity)) * 100;
      return {
        vehicleId: v.id,
        plate: v.plate,
        model: v.model,
        status: v.status,
        mileageKm: v.mileageKm,
        yearsInService: v.yearsInService,
        trips: vTrips.length,
        avgDelay: avg(vTrips.map((t) => t.delayMin)),
        incidents,
        utilization,
      };
    })
    .sort((a, b) => b.avgDelay - a.avgDelay);
}

export function peakHours(data) {
  const buckets = {};
  data.trips.forEach((t) => {
    buckets[t.hour] = (buckets[t.hour] || 0) + 1;
  });
  return Object.entries(buckets)
    .map(([hour, count]) => ({ hour: `${hour}h`, hourNum: Number(hour), count }))
    .sort((a, b) => a.hourNum - b.hourNum);
}

export function driverPerformance(data) {
  const { drivers, trips } = data;
  return drivers
    .map((d) => {
      const dTrips = trips.filter((t) => t.driverId === d.id);
      const incidents = dTrips.filter((t) => t.incident).length;
      const complaints = dTrips.filter((t) => t.complaint).length;
      const avgDelay = avg(dTrips.map((t) => t.delayMin));
      // Simple weighted score out of 100 — punishes delay, incidents, complaints.
      let score = 100 - avgDelay * 3 - incidents * 8 - complaints * 4;
      score = Math.max(0, Math.min(100, Math.round(score)));
      return {
        driverId: d.id,
        name: d.name,
        yearsExperience: d.yearsExperience,
        trips: dTrips.length,
        avgDelay,
        incidents,
        complaints,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function monthlyEvolution(data) {
  const buckets = {};
  data.trips.forEach((t) => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!buckets[month]) buckets[month] = { trips: 0, delaySum: 0, incidents: 0, cost: 0 };
    buckets[month].trips += 1;
    buckets[month].delaySum += t.delayMin;
    buckets[month].incidents += t.incident ? 1 : 0;
    buckets[month].cost += t.cost;
  });
  return Object.entries(buckets)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([month, v]) => ({
      month,
      trips: v.trips,
      avgDelay: v.trips ? v.delaySum / v.trips : 0,
      incidents: v.incidents,
      cost: Math.round(v.cost),
    }));
}

export function complaintBreakdown(data) {
  const counts = {};
  data.complaintCategories.forEach((c) => (counts[c] = 0));
  data.trips.forEach((t) => {
    if (t.complaint) counts[t.complaint] = (counts[t.complaint] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function routeById(data, id) {
  return data.routes.find((r) => r.id === id);
}

export function routeEfficiency(data) {
  const stats = delayByRoute(data);
  return stats
    .map((s) => {
      const route = data.routes.find((r) => r.id === s.routeId);
      const utilization = route?.capacity ? (s.avgPassengers / route.capacity) * 100 : 0;
      const costPerPassenger = s.avgPassengers ? s.totalCost / (s.trips * s.avgPassengers) : 0;
      return { ...s, utilization, costPerPassenger };
    })
    .sort((a, b) => b.utilization - a.utilization);
}

export function monthOverMonth(data) {
  const monthly = monthlyEvolution(data);
  if (monthly.length < 2) return null;
  const curr = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const pctChange = (a, b) => (b === 0 ? 0 : ((a - b) / b) * 100);
  return {
    curr,
    prev,
    tripsChangePct: pctChange(curr.trips, prev.trips),
    delayChangePct: pctChange(curr.avgDelay, prev.avgDelay),
    incidentsChangePct: pctChange(curr.incidents, prev.incidents),
    costChangePct: pctChange(curr.cost, prev.cost),
  };
}
