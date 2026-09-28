// Generates realistic-looking demo data for SOTREG Analytics (Khouribga / OCP transport).
// Pure synthetic data — no real SOTREG/OCP records. Run with: npm run generate:data
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "src", "data", "generated-data.json");

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rnd = seededRandom(42);
function pick(arr) {
  return arr[Math.floor(rnd() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}

// ---------- Geography (Khouribga area — approximate, illustrative only) ----------
const CENTER = { lat: 32.8811, lng: -6.9063 };

function jitter(v, amt) {
  return v + (rnd() - 0.5) * amt;
}

// Rough bearings/distances so towns fan out around Khouribga like a real network would.
function offsetPoint(base, bearingDeg, distKm) {
  const R = 6371;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (base.lat * Math.PI) / 180;
  const lng1 = (base.lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distKm / R) + Math.cos(lat1) * Math.sin(distKm / R) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(distKm / R) * Math.cos(lat1), Math.cos(distKm / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

function buildPath(origin, destination) {
  // 4-5 waypoints with light jitter so it doesn't look like a perfectly straight line.
  const steps = 4;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    const jitterAmt = i === 0 || i === steps ? 0 : 0.01;
    path.push([round4(jitter(lat, jitterAmt)), round4(jitter(lng, jitterAmt))]);
  }
  return path;
}
function round4(n) {
  return Math.round(n * 10000) / 10000;
}

const SITE_COORDS = {};
const TOWN_COORDS = {};

const SITES = [
  "Site Merah",
  "Site Sidi Chennane",
  "Site Daoui",
  "Site Beni Idir",
  "Site Bouchane",
  "Laverie Khouribga",
  "Complexe Industriel",
  "Cité OCP",
];
const TOWNS = [
  "Khouribga Centre",
  "Oued Zem",
  "Boujniba",
  "Bejaad",
  "Hattane",
  "El Foukra",
  "Ouled Abdoun",
  "Zerarda",
  "Al Massira",
  "Bir Msaoud",
];

SITES.forEach((s, i) => {
  SITE_COORDS[s] = offsetPoint(CENTER, (i / SITES.length) * 360 + 20, randInt(3, 9));
});
TOWNS.forEach((t, i) => {
  TOWN_COORDS[t] = offsetPoint(CENTER, (i / TOWNS.length) * 360 + 200, randInt(6, 22));
});

const routes = [];
let routeId = 1;
const STATION_LABELS = ["Portail Nord", "Centre-ville", "Hay Al Massira", "Rond-point", "Portail Site"];
for (const town of TOWNS) {
  const nRoutes = randInt(1, 2);
  for (let i = 0; i < nRoutes; i++) {
    const site = pick(SITES);
    const distance = randInt(6, 34);
    const origin = TOWN_COORDS[town];
    const destination = SITE_COORDS[site];
    const path = buildPath(origin, destination);

    const nStations = randInt(2, 3);
    const stations = [];
    for (let s = 1; s <= nStations; s++) {
      const t = s / (nStations + 1);
      const idx = Math.min(path.length - 1, Math.round(t * (path.length - 1)));
      stations.push({
        id: `S${routeId}-${s}`,
        name: `${pick(STATION_LABELS)} — ${town}`,
        lat: path[idx][0],
        lng: path[idx][1],
        progress: round1(t),
      });
    }

    routes.push({
      id: `R${String(routeId).padStart(2, "0")}`,
      name: `${town} → ${site}`,
      origin: town,
      destination: site,
      originCoords: [round4(origin.lat), round4(origin.lng)],
      destinationCoords: [round4(destination.lat), round4(destination.lng)],
      distanceKm: distance,
      scheduledDurationMin: Math.round(distance * 1.8 + randInt(5, 15)),
      capacity: pick([45, 50, 55, 60, 22, 30]),
      path,
      stations,
    });
    routeId++;
  }
}

// ---------- Vehicles ----------
const VEHICLE_MODELS = [
  "Iveco Crossway",
  "Mercedes Sprinter",
  "King Long XMQ",
  "Golden Dragon XML",
  "Setra S415",
  "Higer Touring",
];
const vehicles = [];
for (let i = 1; i <= 28; i++) {
  const capacity = pick([22, 30, 45, 50, 55, 60]);
  const mileage = randInt(40000, 320000);
  vehicles.push({
    id: `V${String(i).padStart(2, "0")}`,
    plate: `${randInt(10000, 99999)}-${pick(["A", "B", "H"])}-${randInt(10, 25)}`,
    model: pick(VEHICLE_MODELS),
    capacity,
    mileageKm: mileage,
    yearsInService: randInt(1, 12),
    lastMaintenance: `2026-${String(randInt(4, 8)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
    status: mileage > 260000 && rnd() > 0.4 ? "Maintenance requise" : rnd() > 0.93 ? "Immobilisé" : "En service",
  });
}

// ---------- Drivers ----------
const FIRST_NAMES = ["Rachid", "Hassan", "Youssef", "Karim", "Omar", "Mustapha", "Aziz", "Said", "Brahim", "Nabil", "Fouad", "Larbi", "Khalid", "Hamid", "Anas"];
const LAST_INITIALS = ["B.", "M.", "K.", "L.", "T.", "R.", "F.", "H.", "S.", "A."];
const drivers = [];
for (let i = 1; i <= 22; i++) {
  drivers.push({
    id: `D${String(i).padStart(2, "0")}`,
    name: `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}`,
    yearsExperience: randInt(1, 20),
    licenseExpiry: `2027-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
  });
}

// ---------- Trips (last 90 days) ----------
const trips = [];
let tripId = 1;
const today = new Date("2026-09-09");
const complaintCategories = ["Retard", "Surcharge", "Confort", "Comportement chauffeur", "Panne véhicule"];

for (let d = 89; d >= 0; d--) {
  const date = new Date(today);
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().slice(0, 10);
  const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Fri/Sat weekend pattern

  for (const route of routes) {
    // Not every route runs every day (weekend reduced service)
    if (isWeekend && rnd() > 0.4) continue;

    const departuresPerDay = isWeekend ? 1 : randInt(2, 4);
    for (let dep = 0; dep < departuresPerDay; dep++) {
      const hour = pick([6, 7, 7, 8, 13, 14, 16, 17, 17, 18]);
      const vehicle = pick(vehicles);
      const driver = pick(drivers);

      // Delay model: worse for older/high-mileage vehicles, peak hours, and some routes
      let delayBase = randInt(-2, 6);
      if (vehicle.mileageKm > 250000) delayBase += randInt(2, 10);
      if (hour === 7 || hour === 17) delayBase += randInt(1, 6);
      if (route.distanceKm > 25) delayBase += randInt(0, 5);
      const delayMin = Math.max(0, delayBase);

      const occupancyRate = Math.min(1.15, Math.max(0.35, 0.7 + (rnd() - 0.5) * 0.6));
      const passengers = Math.round(route.capacity * occupancyRate);

      const incident = rnd() > 0.985;
      const complaint = rnd() > 0.88 ? pick(complaintCategories) : null;

      const costPerKm = 3.2;
      const cost = round1(route.distanceKm * 2 * costPerKm + (incident ? randInt(200, 1500) : 0));

      trips.push({
        id: `T${tripId++}`,
        date: dateStr,
        hour,
        routeId: route.id,
        vehicleId: vehicle.id,
        driverId: driver.id,
        scheduledDurationMin: route.scheduledDurationMin,
        delayMin,
        passengers,
        capacity: route.capacity,
        incident,
        complaint,
        cost,
      });
    }
  }
}

const data = { generatedAt: today.toISOString(), routes, vehicles, drivers, trips, complaintCategories };

// ---------- Live fleet snapshot (used by the live map) ----------
const activeVehicles = vehicles.filter((v) => v.status === "En service");
const liveStatuses = ["En route", "En route", "En route", "À l'arrêt (station)", "Embarquement"];
const liveFleet = [];
const nLive = Math.min(activeVehicles.length, 20);
const shuffled = [...activeVehicles].sort(() => rnd() - 0.5).slice(0, nLive);
shuffled.forEach((v, i) => {
  const route = pick(routes);
  const driver = pick(drivers);
  liveFleet.push({
    vehicleId: v.id,
    plate: v.plate,
    model: v.model,
    routeId: route.id,
    driverId: driver.id,
    progress: round1(rnd()),
    direction: rnd() > 0.5 ? 1 : -1,
    speedKmh: randInt(28, 62),
    status: pick(liveStatuses),
    occupancy: Math.min(1.1, Math.max(0.2, 0.65 + (rnd() - 0.5) * 0.6)),
    lastUpdate: today.toISOString(),
  });
});
data.liveFleet = liveFleet;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data));
console.log(`Generated ${trips.length} trips across ${routes.length} routes, ${vehicles.length} vehicles, ${drivers.length} drivers.`);
console.log(`Live fleet snapshot: ${liveFleet.length} vehicles.`);
console.log(`Written to ${OUT}`);
