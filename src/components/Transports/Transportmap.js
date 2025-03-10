import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TransportMap = () => {
    const [drivers, setDrivers] = useState([]);
    const mapRef = useRef(null); // Référence à la carte

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch("https://scolara-backend.onrender.com/api/driver-locations/");
                if (!response.ok) throw new Error("Erreur lors de la récupération des données");

                const data = await response.json();
                setDrivers(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des positions :", error);
            }
        };

        fetchLocations();
        const interval = setInterval(fetchLocations, 5000); // Mise à jour toutes les 5 secondes
        return () => clearInterval(interval);
    }, []);

    // Icône personnalisée pour les chauffeurs
    const customIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/5811/5811962.png",
        iconSize: [45, 41],
        iconAnchor: [15, 30],
    });

    // 🔹 Ajuste automatiquement la carte sur les positions des chauffeurs
    const AdjustMapView = () => {
        const map = useMap();
        useEffect(() => {
            if (drivers.length > 0) {
                if (drivers.length === 1) {
                    // Si un seul chauffeur, centre directement dessus
                    map.setView([drivers[0].latitude, drivers[0].longitude], 14);
                } else {
                    // Sinon, ajuste les bounds
                    const bounds = L.latLngBounds(drivers.map(driver => [driver.latitude, driver.longitude]));
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }, [drivers, map]);

        return null;
    };

    return (
        <MapContainer
            center={[33.5731, -7.5898]}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
            whenCreated={mapInstance => (mapRef.current = mapInstance)}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Ajuste la vue automatiquement vers les chauffeurs */}
            <AdjustMapView />

            {drivers.length > 0 ? (
                drivers.map((driver, index) => (
                    <Marker key={index} position={[driver.latitude, driver.longitude]} icon={customIcon}>
                        <Popup>
                            <strong>Chauffeur : {driver.driver__first_name} {driver.driver__last_name}</strong>
                        </Popup>
                    </Marker>
                ))
            ) : (
                <p style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>
                    🚍 Aucun chauffeur en ligne pour le moment...
                </p>
            )}
        </MapContainer>
    );
};

export default TransportMap;
