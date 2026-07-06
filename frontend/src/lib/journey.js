// Journey/phase logic ported from Levond Travel OS (ClientsWorldMap useClientJourneys).
// Single source of truth: derives journeys from travel_bookings so Dashboard, Map,
// Calendar and Bookings all stay in sync.
import { lookupCoord, distanceKm, interpolate } from '@/lib/airportCoords';

// Phases: scheduled → pre_departure → outbound_flight → at_destination → return_flight → completed
export const PHASES = ['scheduled', 'pre_departure', 'outbound_flight', 'at_destination', 'return_flight', 'completed'];

export const PHASE_LABEL = {
  scheduled: 'Programado',
  pre_departure: 'Pre-embarque',
  outbound_flight: 'En vuelo (ida)',
  layover: 'En escala',
  at_destination: 'En destino',
  return_flight: 'En vuelo (regreso)',
  completed: 'Completado',
};

export const PHASE_COLOR = {
  scheduled: '#64748B', pre_departure: '#F59E0B', outbound_flight: '#3B82F6',
  layover: '#A855F7', at_destination: '#10B981', return_flight: '#6366F1', completed: '#94A3B8',
};

const OUT_DEP_HOUR = 9;
const RET_DEP_HOUR = 17;
const CRUISE_KMH = 800;

const AIRPORT_MAP = {
  MIAMI: 'MIA', 'FORT LAUDERDALE': 'FLL', ORLANDO: 'MCO', 'NEW YORK': 'JFK',
  'LOS ANGELES': 'LAX', 'LAS VEGAS': 'LAS', 'PUNTA CANA': 'PUJ', CANCUN: 'CUN',
  'CANCÚN': 'CUN', 'RIVIERA MAYA': 'CUN', 'SANTO DOMINGO': 'SDQ', 'LA HABANA': 'HAV',
  HAVANA: 'HAV', NASSAU: 'NAS', ARUBA: 'AUA', CURACAO: 'CUR', 'SAN JUAN': 'SJU',
  MEDELLIN: 'MDE', BOGOTA: 'BOG', 'BOGOTÁ': 'BOG', CARTAGENA: 'CTG', LIMA: 'LIM', CUSCO: 'CUZ',
  'RIO DE JANEIRO': 'GIG', 'SAO PAULO': 'GRU', 'BUENOS AIRES': 'EZE', SANTIAGO: 'SCL',
  QUITO: 'UIO', PANAMA: 'PTY', MADRID: 'MAD', BARCELONA: 'BCN', PARIS: 'CDG',
  ROME: 'FCO', LONDON: 'LHR', LISBOA: 'LIS', DUBAI: 'DXB', TOKYO: 'HND', TOKIO: 'HND', BALI: 'DPS',
};

export function airportCodeFor(fallback) {
  const f = String(fallback || '').toUpperCase().trim();
  if (/^[A-Z]{3}$/.test(f)) return f;
  for (const [k, v] of Object.entries(AIRPORT_MAP)) if (f.includes(k)) return v;
  return f.slice(0, 3) || 'AAA';
}

export function flightNumberFor(bookingId) {
  let h = 0;
  for (let i = 0; i < bookingId.length; i++) h = (h * 31 + bookingId.charCodeAt(i)) | 0;
  const n = (Math.abs(h) % 9000) + 1000;
  return `LV${n}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function depTimeFor(phase, j) {
  if (phase === 'return_flight' && j.returnOverride) return j.returnOverride;
  if (phase !== 'return_flight' && j.departureOverride) return j.departureOverride;
  const d = new Date(phase === 'return_flight' ? j.end : j.start);
  d.setHours(phase === 'return_flight' ? RET_DEP_HOUR : OUT_DEP_HOUR, 0, 0, 0);
  return d;
}
const flightHoursFor = (dist) => Math.max(1, dist / CRUISE_KMH);

export function computePhase(start, end, departureOverride, returnOverride) {
  const nowMs = Date.now();
  if (departureOverride && departureOverride.getTime() > nowMs) return 'pre_departure';
  if (returnOverride && returnOverride.getTime() <= nowMs) return 'completed';
  if (departureOverride && returnOverride && returnOverride.getTime() > nowMs) {
    // decide flight vs destination below via progress
  }
  const now = new Date();
  if (isSameDay(now, start)) return 'outbound_flight';
  if (isSameDay(now, end)) return 'return_flight';
  if (now < start) return 'scheduled';
  if (now > end) return 'completed';
  return 'at_destination';
}

function flightProgressAt(dep, dist, now = new Date()) {
  const fh = flightHoursFor(dist);
  return Math.max(0, Math.min(1, (now.getTime() - dep.getTime()) / 36e5 / fh));
}

// Build a Journey from a booking (single source of truth).
export function bookingToJourney(b) {
  const start = new Date(b.start_date);
  const end = new Date(b.end_date);
  if (isNaN(start) || isNaN(end)) return null;
  const destText = b.destination || '';
  const dest = lookupCoord(destText);
  if (!dest) return null;
  const originText = b.origin || 'Miami';
  const origin = lookupCoord(originText) || lookupCoord('miami');

  const departureOverride = b.departure_at ? new Date(b.departure_at) : null;
  const returnOverride = b.return_at ? new Date(b.return_at) : null;

  const dist = distanceKm(origin, dest);
  let phase = computePhase(start, end, departureOverride, returnOverride);
  const jStub = { start, end, departureOverride, returnOverride };

  // Refine flight vs destination using progress when overrides exist
  let currentPos = dest;
  let progress = 0;
  const outDep = depTimeFor('outbound_flight', jStub);
  const retDep = depTimeFor('return_flight', jStub);
  const outArr = new Date(outDep.getTime() + flightHoursFor(dist) * 36e5);
  const retArr = new Date(retDep.getTime() + flightHoursFor(dist) * 36e5);
  const now = new Date();

  if (departureOverride || returnOverride) {
    if (now >= outDep && now < outArr) phase = 'outbound_flight';
    else if (now >= retDep && now < retArr) phase = 'return_flight';
    else if (now >= outArr && now < retDep) phase = 'at_destination';
    else if (now >= retArr) phase = 'completed';
    else if (now < outDep) phase = 'pre_departure';
  }

  if (phase === 'outbound_flight') { progress = flightProgressAt(outDep, dist); currentPos = interpolate(origin, dest, progress); }
  else if (phase === 'return_flight') { progress = flightProgressAt(retDep, dist); currentPos = interpolate(dest, origin, progress); }
  else if (phase === 'scheduled' || phase === 'pre_departure') { currentPos = origin; }

  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));

  return {
    id: b.id,
    clientName: b.traveler || 'Cliente',
    destinationName: destText,
    origin, destination: dest,
    originCode: airportCodeFor(originText),
    destinationCode: airportCodeFor(destText),
    flightNumber: b.flight_number || flightNumberFor(b.id),
    proposalNumber: b.proposal_number || '',
    start, end, pax: b.pax || 1,
    amount: b.amount || 0,
    status: b.status || 'pending',
    phase,
    hotelName: b.hotel || null,
    hotelCoord: b.hotel ? [dest[0] + 0.03, dest[1] + 0.03] : null,
    currentPos, flightProgress: progress, daysLeft,
    departureOverride, returnOverride, distanceKm: Math.round(dist),
  };
}

export function buildJourneys(bookings) {
  return (bookings || []).map(bookingToJourney).filter(Boolean);
}
