import React, { useState, useEffect } from 'react';
import './Sidebar.css'; // Réutiliser le même style que le Sidebar admin/parent
import logo from '../../images/logo.png';
import { IoCarSportOutline } from "react-icons/io5"; // Icone pour Transport
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"; // Icone pour Chat
import { Link, useLocation } from 'react-router-dom';
import { BsTruckFront } from "react-icons/bs";
import Cookies from 'js-cookie';
import axios from 'axios';

const DriverSidebar = () => {
    const location = useLocation(); // Pour obtenir le chemin actuel
    const [activeLink, setActiveLink] = useState(location.pathname); // État pour le lien actif
    const [transportId, setTransportId] = useState(null); // État pour stocker l'ID du transport
    const [error, setError] = useState(null); // État pour les erreurs

    // Récupérer l'ID du chauffeur depuis les cookies
    const driverId = Cookies.get('TeacherId');

    useEffect(() => {
        const fetchTransportId = async () => {
            try {
                if (!driverId) {
                    setError("ID du chauffeur introuvable dans les cookies.");
                    return;
                }
                const response = await axios.get(`https://scolara-backend.onrender.com/api/stations-by-driver-id/${driverId}/`);
                setTransportId(response.data.transport_id);
            } catch (err) {
                console.error("Erreur lors de la récupération de l'ID du transport :", err);
                setError("Erreur lors de la récupération des données de transport.");
            }
        };

        fetchTransportId();
    }, [driverId]);

    return (
        <div className="sidebar">
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link
                            to={`/transport-driver/${transportId}`} // Lien dynamique avec l'ID du transport
                            className={`sidebar-button ${activeLink === `/transport/${transportId}` ? 'active' : ''}`}
                            onClick={() => setActiveLink(`/transport-driver/${transportId}`)}
                        >
                        <BsTruckFront style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                        Transport
                        </Link>
                    </li>
                    {/* <li>
                        <Link
                            to="/chat-driver"
                            className={`sidebar-button ${activeLink === '/chat-driver' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat-driver')}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Chat
                        </Link>
                    </li> */}
                </ul>
            </nav>
            {error && <p className="error">{error}</p>} {/* Afficher l'erreur s'il y en a */}
            <div className="whitetext">Scolara</div>
        </div>
    );
};

export default DriverSidebar;
