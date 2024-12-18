// components/Footer.js
import React from 'react';
import './Footer.css'; // Assurez-vous d'importer votre fichier CSS pour le footer

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-links">
                    <a href="/privacy-policy">Politique de confidentialité</a>
                    <a href="/terms-of-service">Conditions d'utilisation</a>
                    <a href="/contact">Contactez-nous</a>
                </div>
                <div className="footer-socials">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SCOLARA. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
