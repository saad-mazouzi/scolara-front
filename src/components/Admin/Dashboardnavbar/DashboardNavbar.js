import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardNavbar.css'; // Assurez-vous d'importer votre fichier CSS
import logo from '../../../images/logo.jpg'

const DashboardNavbar = () => {
    const navigate = useNavigate(); // Hook pour la navigation

    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                <img src={logo} alt="Logo de l'application" />
            </div>
            <div className="navbar-text">
                L'avenir de la gestion scolaire à portée de main
            </div>
            <div className="navbar-buttons">
                <button 
                    className="navbar-button-login" 
                    onClick={() => navigate('/login')}
                >
                    Connexion
                </button>
                <button 
                    className="navbar-button-signup" 
                    onClick={() => navigate('/register')}
                >
                    Inscription
                </button>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
