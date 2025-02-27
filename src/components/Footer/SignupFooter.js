// components/Footer.js
import React from 'react';
import './Footer.css'; // Assurez-vous d'importer votre fichier CSS pour le footer

const SignupFooter = () => {
    return (
        <footer className="signup-footer-container">
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SCOLARA. Tous droits réservés. Développé par DeepTech.</p>
            </div>
        </footer>
    );
};

export default SignupFooter;
