import React, { useEffect, useState } from 'react';
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

// Create a custom icon using a standard divIcon
const createCustomIcon = () => {
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
    popupAnchor: [0, -36]
  });
};

export const TunisiaMap: React.FC<TunisiaMapProps> = ({ trips, onTripClick }) => {
  const customIcon = createCustomIcon();
  const [geoData, setGeoData] = useState<any>(null);

  // Fetch the GeoJSON data for Tunisia governorates
  useEffect(() => {
    fetch('/tunisia.json')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load map data:", err));
  }, []);

  // Default style for governorate polygons
  const geoStyle = {
    fillColor: '#164e63', // tunis-blue
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.1
  };

  // Hover events for governorates
  const onEachFeature = (feature: any, layer: any) => {
    // Show governorate name on hover
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(`<strong>${feature.properties.name}</strong>`, {
        sticky: true,
        direction: 'auto',
        className: 'custom-tooltip text-sm font-sans'
      });
    }

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: '#d97757', // tunis-terracotta
          dashArray: '',
          fillOpacity: 0.4,
          fillColor: '#ea580c' // bright orange highlight
        });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        // We need a ref to the geojson to resetstyle, but we can also just apply the default style manually
        const target = e.target;
        target.setStyle(geoStyle);
      },
      click: (e: any) => {
        // Optional: zoom to region on click
        const map = e.target._map;
        map.fitBounds(e.target.getBounds());
      }
    });
  };

  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl relative z-10 border-4 border-white group">
      <MapContainer 
        center={[34.0, 9.5]} // Center of Tunisia
        zoom={6} 
        scrollWheelZoom={false}
        tap={false} // Improves scrolling on mobile devices by not capturing touch events for taps aggressively
        className="w-full h-full z-0"
      >
        {/* Minimalistic tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Interactive Governorate Overlay */}
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={geoStyle} 
            onEachFeature={onEachFeature}
          />
        )}

        {/* Trip Markers */}
        {trips.map((trip) => {
          if (!trip.coordinates) return null;
          return (
            <Marker 
              key={trip.id} 
              position={trip.coordinates} 
              icon={customIcon}
            >
              <Popup className="custom-popup rounded-xl">
                <div className="w-48">
                  <div className="h-24 w-full rounded-t-lg overflow-hidden mb-2">
                    <img 
                      src={trip.images[0]} 
                      alt={trip.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{trip.title}</h3>
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
      
      {/* Interactive Hint Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Hover over regions to explore!
      </div>
    </div>
  );
};
