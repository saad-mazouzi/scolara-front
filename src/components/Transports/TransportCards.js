import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { fetchDriverTransports } from '../../APIServices';
import './DriverTransports.css';
import { PuffLoader } from 'react-spinners';

const DriverTransports = () => {
    const [transports, setTransports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cookies, setCookie] = useCookies(['SelectedTransportId']); // Utilisation des cookies
    const navigate = useNavigate();

    useEffect(() => {
        const loadTransports = async () => {
            const driverId = cookies.TeacherId;
            if (!driverId) {
                setError("ID du chauffeur introuvable.");
                setLoading(false);
                return;
            }

            try {
                const data = await fetchDriverTransports(driverId);
                setTransports(data); // `data` contient des objets avec `id` et `name`
            } catch (err) {
                console.error("Erreur lors du chargement des transports :", err);
                setError("Impossible de récupérer les transports.");
            } finally {
                setLoading(false);
            }
        };

        loadTransports();
    }, [cookies]);

    const handleCardClick = (transport) => {
        setCookie('SelectedTransportId', transport.id, { path: '/', sameSite: 'None', secure: true }); // Stocke l'ID dans les cookies
        navigate(`/transport-driver/${transport.id}`); // Redirection basée sur l'ID
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader color="#ffcc00" size={60} />
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (transports.length === 0) {
        return <div className="no-transports">Aucun transport disponible.</div>;
    }

    return (
        <div>
            <div className="student-list-title" style={{ marginTop: '80px' }}>
                <h3>Mes Transports</h3>
            </div>
            <div className="driver-transports-container">
                <div className="transports-grid">
                    {transports.map((transport) => (
                        <div
                            key={transport.id}
                            className="transport-card"
                            onClick={() => handleCardClick(transport)}
                        >
                            <h3>{transport.name || "Nom non spécifié"}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverTransports;
