import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TransportMap = () => {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch("https://scolara-backend.onrender.com/api/driver-locations/");
                const data = await response.json();
                setDrivers(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des positions :", error);
            }
        };

        fetchLocations();
        const interval = setInterval(fetchLocations, 5000);
        return () => clearInterval(interval);
    }, []);

    const customIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/5811/5811962.png",
        iconSize: [45, 41],
        iconAnchor: [15, 30],
    });

    return (
        <MapContainer center={[33.5731, -7.5898]} zoom={12} style={{ height: "500px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {drivers.map((driver, index) => (
                <Marker key={index} position={[driver.latitude, driver.longitude]} icon={customIcon}>
                    <Popup>
                        <strong>Chauffeur : {driver.driver__first_name}</strong>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default TransportMap;
