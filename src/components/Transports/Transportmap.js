import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TransportMap = () => {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/driver-locations/");
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

    // Icône personnalisée pour les chauffeurs (bus ou autre véhicule)
    const customIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/5811/5811962.png",
        iconSize: [45, 41],
        iconAnchor: [15, 30],
    });

    return (
        <MapContainer center={[33.5731, -7.5898]} zoom={12} style={{ height: "500px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
