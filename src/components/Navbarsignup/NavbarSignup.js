import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavbarSignup.css'; // Assurez-vous d'importer votre fichier CSS
import logo from '../../images/logo.png';

const NavbarSignup = () => {
    const navigate = useNavigate(); // Hook pour la navigation

    return (
        <nav className="navbar-container">
            <div className="navbar-logo" onClick={() => window.location.href = 'https://scolara.ma'} style={{ cursor: 'pointer' }}>
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

export default NavbarSignup;
