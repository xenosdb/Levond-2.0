// Ported from Levond Travel OS (airportCoords.ts). Case-insensitive substring lookup.

export const KNOWN_PLACES = {
  // Caribbean / Mexico
  cancun: [21.1619, -86.8515], "cancún": [21.1619, -86.8515],
  "riviera maya": [20.6296, -87.0739], "playa del carmen": [20.6296, -87.0739],
  tulum: [20.2114, -87.4654], cozumel: [20.4230, -86.9223],
  "puerto vallarta": [20.6534, -105.2253], "los cabos": [22.8905, -109.9167],
  "ciudad de mexico": [19.4326, -99.1332], "mexico city": [19.4326, -99.1332],
  "punta cana": [18.5601, -68.3725], "santo domingo": [18.4861, -69.9312],
  "la habana": [23.1136, -82.3666], havana: [23.1136, -82.3666],
  varadero: [23.1396, -81.2864], "montego bay": [18.4762, -77.8939],
  nassau: [25.0443, -77.3504], aruba: [12.5211, -69.9683], curacao: [12.1696, -68.9900],
  "san juan": [18.4655, -66.1057], "puerto rico": [18.4655, -66.1057],
  // USA
  miami: [25.7617, -80.1918], mia: [25.7959, -80.2870], fll: [26.0726, -80.1527],
  "fort lauderdale": [26.0726, -80.1527], "ft lauderdale": [26.0726, -80.1527],
  florida: [26.0726, -80.1527], orlando: [28.5383, -81.3792], mco: [28.4312, -81.3081],
  "new york": [40.7128, -74.0060], "nueva york": [40.7128, -74.0060], jfk: [40.6413, -73.7781],
  "las vegas": [36.1699, -115.1398], "los angeles": [34.0522, -118.2437], lax: [33.9416, -118.4085],
  // Caribbean codes
  puj: [18.5601, -68.3725], hav: [23.1136, -82.3666], cun: [21.0365, -86.8771],
  // South America
  "buenos aires": [-34.6037, -58.3816], bogota: [4.7110, -74.0721], "bogotá": [4.7110, -74.0721],
  medellin: [6.2476, -75.5658], "medellín": [6.2476, -75.5658], cartagena: [10.3910, -75.4794],
  lima: [-12.0464, -77.0428], cusco: [-13.5319, -71.9675],
  "rio de janeiro": [-22.9068, -43.1729], "sao paulo": [-23.5505, -46.6333], "são paulo": [-23.5505, -46.6333],
  santiago: [-33.4489, -70.6693], quito: [-0.1807, -78.4678], panama: [8.9824, -79.5199], "panamá": [8.9824, -79.5199],
  "san jose": [9.9281, -84.0907],
  // Europe
  madrid: [40.4168, -3.7038], barcelona: [41.3851, 2.1734], paris: [48.8566, 2.3522], "parís": [48.8566, 2.3522],
  roma: [41.9028, 12.4964], rome: [41.9028, 12.4964], londres: [51.5074, -0.1278], london: [51.5074, -0.1278],
  lisboa: [38.7223, -9.1393],
  // Asia / Pacific
  dubai: [25.2048, 55.2708], tokio: [35.6762, 139.6503], tokyo: [35.6762, 139.6503], bali: [-8.3405, 115.0920],
};

const ENTRIES = Object.entries(KNOWN_PLACES);

export function lookupCoord(text) {
  if (!text) return null;
  const t = String(text).toLowerCase().trim();
  if (KNOWN_PLACES[t]) return KNOWN_PLACES[t];
  for (const [k, v] of ENTRIES) if (t.includes(k)) return v;
  return null;
}

export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function interpolate(a, b, t) {
  const tt = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt];
}

export function bearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const p1 = toRad(a[0]);
  const p2 = toRad(b[0]);
  const l1 = toRad(a[1]);
  const l2 = toRad(b[1]);
  const y = Math.sin(l2 - l1) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
