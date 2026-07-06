import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane, Hotel, MapPin, Users, CalendarDays } from 'lucide-react';
import { bearing, interpolate } from '@/lib/airportCoords';
import { buildJourneys, PHASE_LABEL, PHASE_COLOR } from '@/lib/journey';

const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function planeIcon(deg, color) {
  return L.divIcon({
    className: 'lv-plane',
    html: `<div style="transform:rotate(${deg}deg);color:${color};filter:drop-shadow(0 0 4px ${color}aa)">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5L21 16z"/></svg>
    </div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
  });
}
function dotIcon(color, glyph) {
  return L.divIcon({
    className: 'lv-dot',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 0 3px ${color}44">${glyph}</div>`,
    iconSize: [22, 22], iconAnchor: [11, 11],
  });
}
const AIRPORT = '<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="6"/></svg>';
const HOTEL = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M7 2h10v6H7zM4 9h16v13h-6v-4h-4v4H4z"/></svg>';

function FitBounds({ journeys }) {
  const map = useMap();
  useEffect(() => {
    if (!journeys.length) return;
    const pts = [];
    journeys.forEach((j) => { pts.push(j.origin, j.destination, j.currentPos); });
    try { map.fitBounds(L.latLngBounds(pts).pad(0.25), { animate: true }); } catch { /* noop */ }
  }, [journeys.length]); // eslint-disable-line
  return null;
}

export default function ClientsWorldMap({ bookings = [], theme = 'dark', height = 460, onSelect }) {
  const [, tick] = useState(0);
  // Re-render every 15s so flight positions animate (positions depend on Date.now)
  useEffect(() => { const id = setInterval(() => tick((t) => t + 1), 15000); return () => clearInterval(id); }, []);

  const journeys = useMemo(() => buildJourneys(bookings), [bookings, /* re-run on tick */ Math.floor(Date.now() / 15000)]);

  const tiles = theme === 'dark'
    ? { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '&copy; CARTO' }
    : { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attr: '&copy; CARTO' };

  const active = journeys.filter((j) => j.phase !== 'completed');

  return (
    <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 relative" data-testid="clients-world-map" style={{ height }}>
      <MapContainer center={[19, -75]} zoom={3} minZoom={2} scrollWheelZoom style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#0B0710' : '#e8eef5' }}>
        <TileLayer url={tiles.url} attribution={tiles.attr} />
        <FitBounds journeys={active} />
        {active.map((j) => {
          const inFlight = j.phase === 'outbound_flight' || j.phase === 'return_flight';
          const atDest = j.phase === 'at_destination';
          const preDep = j.phase === 'pre_departure' || j.phase === 'scheduled';
          const color = PHASE_COLOR[j.phase] || '#7C3AED';
          const routeA = j.phase === 'return_flight' ? j.destination : j.origin;
          const routeB = j.phase === 'return_flight' ? j.origin : j.destination;
          const brg = bearing(routeA, routeB);
          const from = j.origin, to = j.destination;
          const info = (
            <div style={{ minWidth: 190 }}>
              <div style={{ fontWeight: 800 }}>{j.clientName}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{PHASE_LABEL[j.phase]}</div>
              <hr style={{ margin: '4px 0', opacity: 0.2 }} />
              <div style={{ fontSize: 12 }}>👥 {j.pax} pax · Paquete #{j.proposalNumber || '—'}</div>
              <div style={{ fontSize: 12 }}>✈ {j.flightNumber} · {j.originCode} → {j.destinationCode}</div>
              <div style={{ fontSize: 12 }}>📅 {fmt(j.start)} → {fmt(j.end)}</div>
              {j.departureOverride && <div style={{ fontSize: 12 }}>🛫 Salida: {fmtTime(j.departureOverride)}</div>}
            </div>
          );
          return (
            <React.Fragment key={j.id}>
              {/* Route line */}
              <Polyline positions={[from, to]} pathOptions={{ color, weight: 2, opacity: inFlight ? 0.8 : 0.35, dashArray: inFlight ? undefined : '6 8' }} />
              {/* Origin & destination airport dots */}
              <Marker position={from} icon={dotIcon('#7C3AED', AIRPORT)} />
              <Marker position={to} icon={dotIcon('#EC4899', AIRPORT)} />
              {/* Plane: in-flight at currentPos, pre-departure sits at origin airport */}
              {(inFlight || preDep) && (
                <Marker position={inFlight ? j.currentPos : j.origin} icon={planeIcon(inFlight ? brg : (preDep ? bearing(j.origin, j.destination) : 0), color)}
                  eventHandlers={{ click: () => onSelect && onSelect(j) }}>
                  <Tooltip>{info}</Tooltip>
                </Marker>
              )}
              {/* Hotel when at destination */}
              {atDest && j.hotelCoord && (
                <Marker position={j.hotelCoord} icon={dotIcon('#10B981', HOTEL)} eventHandlers={{ click: () => onSelect && onSelect(j) }}>
                  <Tooltip>
                    <div style={{ minWidth: 190 }}>
                      <div style={{ fontWeight: 800 }}>{j.hotelName || 'Hotel'}</div>
                      <div style={{ fontSize: 12 }}>👤 {j.clientName} · {j.pax} pax</div>
                      <div style={{ fontSize: 12 }}>📍 {j.destinationName}</div>
                      <div style={{ fontSize: 12 }}>Paquete #{j.proposalNumber || '—'}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{j.daysLeft} día(s) restante(s)</div>
                      <div style={{ fontSize: 12 }}>Regresa el {fmt(j.end)}</div>
                    </div>
                  </Tooltip>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] flex gap-2 flex-wrap text-[10px] font-bold">
        {Object.entries(PHASE_LABEL).filter(([k]) => k !== 'layover' && k !== 'completed').map(([k, v]) => (
          <span key={k} className="px-2 py-0.5 rounded-full" style={{ background: (PHASE_COLOR[k] || '#7C3AED') + '22', color: PHASE_COLOR[k] }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

export function JourneyStats({ bookings }) {
  const journeys = buildJourneys(bookings);
  const inFlight = journeys.filter((j) => j.phase === 'outbound_flight' || j.phase === 'return_flight').length;
  const atDest = journeys.filter((j) => j.phase === 'at_destination').length;
  const upcoming = journeys.filter((j) => j.phase === 'scheduled' || j.phase === 'pre_departure').length;
  return { inFlight, atDest, upcoming, total: journeys.length };
}
