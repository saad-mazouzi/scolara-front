import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from "react-router-dom";

const ParentTransportTracking = () => {
    const { parentKey } = useParams(); // Récupérer la clé parent depuis l'URL
    const [transport, setTransport] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchTransportLocation = async () => {
            try {
                const response = await fetch(`https://scolara-backend.onrender.com/api/transport/${parentKey}/`);
                if (!response.ok) throw new Error("Erreur lors de la récupération des données");
                
                const data = await response.json();
                if (data.status === "success") {
                    setTransport(data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la position du transport :", error);
            }
        };

        fetchTransportLocation();
        const interval = setInterval(fetchTransportLocation, 5000); // Met à jour toutes les 5 secondes
        return () => clearInterval(interval);
    }, [parentKey]);

    // Icône personnalisée pour représenter le transport (bus, voiture...)
    const transportIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/5811/5811962.png",
        iconSize: [45, 41],
        iconAnchor: [15, 30],
    });

    // 🔹 Ajuste le zoom de la carte pour suivre le transport
    const AdjustMapView = () => {
        const map = useMap();
        useEffect(() => {
            if (transport) {
                const position = [transport.latitude, transport.longitude];
                map.setView(position, 15); // Centre la carte sur le transport
            }
        }, [transport, map]);
        return null;
    };

    return (
        <div>
            <h3 className="student-list-title">📍 Suivi du Transport</h3>
            <MapContainer
                center={[33.5731, -7.5898]} // Position initiale (Casablanca, par exemple)
                zoom={12}
                style={{ height: "500px", width: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Ajuster la carte pour suivre le transport */}
                <AdjustMapView />

                {transport && (
                    <Marker position={[transport.latitude, transport.longitude]} icon={transportIcon}>
                        <Popup>
                            <strong>🚖 Chauffeur : {transport.chauffeur}</strong>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {!transport && (
                <p style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>
                    🚍 Aucun transport en ligne pour le moment...
                </p>
            )}
        </div>
    );
};

export default ParentTransportTracking;
