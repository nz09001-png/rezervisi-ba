"use client";

// Karta över salonger på startsidan (OpenStreetMap via Leaflet).
// Laddas bara i webbläsaren, se dynamic(..., { ssr: false }) i app/page.tsx.

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type MapSalon = {
  id: number;
  salon_name: string;
  slug: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
};

// Vinröd nål i Salonix-färgen.
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1z" fill="#611a1a" stroke="#ffffff" stroke-width="2"/>
    <circle cx="17" cy="16.5" r="6" fill="#ffffff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
  popupAnchor: [0, -38],
});

// Zoomar kartan så att alla synliga nålar får plats.
function FitToSalons({ salons }: { salons: MapSalon[] }) {
  const map = useMap();

  useEffect(() => {
    if (salons.length === 0) return;
    if (salons.length === 1) {
      map.setView([salons[0].latitude, salons[0].longitude], 15);
      return;
    }
    map.fitBounds(
      salons.map((salon) => [salon.latitude, salon.longitude] as [number, number]),
      { padding: [40, 40], maxZoom: 15 }
    );
  }, [map, salons]);

  return null;
}

export default function SalonMap({ salons }: { salons: MapSalon[] }) {
  return (
    <div
      style={{
        // Egen "våning" så att kartan inte lägger sig över listen och panelen.
        position: "relative",
        zIndex: 0,
        isolation: "isolate",
        height: "65vh",
        minHeight: 380,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #ececec",
      }}
    >
      <MapContainer
        // Mitten av Bosnien och Hercegovina, innan nålarna har zoomats in.
        center={[44.0, 17.8]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {salons.map((salon) => (
          <Marker
            key={salon.id}
            position={[salon.latitude, salon.longitude]}
            icon={pinIcon}
          >
            <Popup>
              <div style={{ minWidth: 170 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1f1f1f" }}>
                  {salon.salon_name}
                </div>
                {(salon.address || salon.city) && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    {[salon.address, salon.city]
                      .filter(Boolean)
                      .filter((part, i, all) => i === 0 || !all[0]!.includes(part!))
                      .join(", ")}
                  </div>
                )}
                <Link
                  href={`/${salon.slug}`}
                  style={{
                    display: "block",
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "#611a1a",
                    color: "#ffffff",
                    fontWeight: 700,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Rezerviši
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitToSalons salons={salons} />
      </MapContainer>
    </div>
  );
}
