import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css'; // Style spécifique pour ce composant

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            axios
                .get(`https://scolara-backend.onrender.com/verify-email/?token=${token}`)
                .then(response => {
                    setMessage(response.data.message);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000); // Redirection après 3 secondes
                })
                .catch(() => {
                    setMessage('Erreur lors de la vérification de l\'email.');
                });
        } else {
            setMessage('Token non trouvé.');
        }
    }, [location.search, navigate]);

    return (
        <div className="verify-email-overlay">
            <div className="verify-email-modal">
                <h2>Vérification de l'Email</h2>
                <p>{message}</p>
                <p>Redirection vers la page de connexion dans quelques secondes...</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
