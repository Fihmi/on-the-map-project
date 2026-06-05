import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip } from '../../data/trips';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface TunisiaMapProps {
  trips: Trip[];
  onTripClick: (trip: Trip) => void;
}

// ─── Stable constants outside the component ──────────────────────────────────
// Defined once at module level — never triggers object-identity re-renders.
const GEO_STYLE = {
  fillColor: '#164e63',
  weight: 1,
  opacity: 1,
  color: 'white',
  dashArray: '3',
  fillOpacity: 0.1,
} as const;

const GEO_HOVER_STYLE = {
  weight: 3,
  color: '#d97757',
  dashArray: '',
  fillOpacity: 0.4,
  fillColor: '#ea580c',
} as const;
// ─────────────────────────────────────────────────────────────────────────────

export const TunisiaMap: React.FC<TunisiaMapProps> = ({ trips, onTripClick }) => {
  const [geoData, setGeoData] = useState<any>(null);

  // Memoized icon — renderToString() runs once on mount, not on every render.
  const customIcon = useMemo(() => {
    const iconHtml = renderToString(
      <div className="text-orange-600 drop-shadow-md hover:text-orange-500 transition-colors cursor-pointer">
        <MapPin size={36} fill="white" />
      </div>
    );
    return divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, []); // empty deps — icon is static

  // Fetch the GeoJSON data for Tunisia governorates once on mount.
  // Uses an AbortController so the request is cancelled (and setState is
  // never called) if the component unmounts before the response arrives.
  // The two-step .then chain (res → res.json()) is collapsed into a single
  // await, reducing microtask depth on the critical request path.
  useEffect(() => {
    const controller = new AbortController();

    const loadGeoData = async () => {
      try {
        const res = await fetch('/tunisia.json', { signal: controller.signal });
        const data = await res.json();
        setGeoData(data);
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error('Failed to load map data:', err);
        }
      }
    };

    loadGeoData();
    return () => controller.abort();
  }, []);

  // Stable function reference — useCallback prevents Leaflet from re-binding
  // all feature listeners every time the parent re-renders.
  const onEachFeature = useCallback((feature: any, layer: any) => {
    if (feature.properties?.name) {
      layer.bindTooltip(`<strong>${feature.properties.name}</strong>`, {
        sticky: true,
        direction: 'auto',
        className: 'custom-tooltip text-sm font-sans',
      });
    }

    layer.on({
      mouseover: (e: any) => {
        // Batch: single setStyle write, then bringToFront — no interleaved reads.
        e.target.setStyle(GEO_HOVER_STYLE);
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        // Restore using the stable constant — no new object allocation.
        e.target.setStyle(GEO_STYLE);
      },
      click: (e: any) => {
        // getBounds() is a Leaflet internal geometry read, not a DOM layout read.
        // It is safe inside a user-event handler (no interleaved DOM writes).
        e.target._map.fitBounds(e.target.getBounds());
      },
    });
  }, []); // stable — only uses module-level constants

  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl relative z-10 border-4 border-white group">
      <MapContainer
        center={[34.0, 9.5]}
        zoom={6}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            style={GEO_STYLE}
            onEachFeature={onEachFeature}
          />
        )}

        {trips.map((trip) => {
          if (!trip.coordinates) return null;
          return (
            <Marker key={trip.id} position={trip.coordinates} icon={customIcon}>
              <Popup className="custom-popup rounded-xl">
                <div className="w-48">
                  <div className="h-24 w-full rounded-t-lg overflow-hidden mb-2">
                    <img
                      src={trip.images[0]}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">{trip.location}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-orange-600">€{trip.price}</span>
                    <button
                      onClick={() => onTripClick(trip)}
                      className="text-xs bg-cyan-900 text-white px-2 py-1 rounded hover:bg-cyan-800 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Hover over regions to explore!
      </div>
    </div>
  );
};
