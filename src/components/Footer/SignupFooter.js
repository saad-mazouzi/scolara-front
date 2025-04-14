// components/SignupFooter.js
import React from 'react';
import './Footer.css'; // Assurez-vous d'importer votre fichier CSS pour le footer

const SignupFooter = () => {
    return (
        <footer className="signup-footer-container">
            {/* Section des icônes sociales */}
            <div className="footer-socials">
                <a
                    href="https://www.linkedin.com/company/scolara-ma/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                >
                    <i className="fab fa-linkedin"></i>
                </a>
                <a
                    href="https://www.facebook.com/share/18YaB86qGR/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                >
                    <i className="fab fa-facebook"></i>
                </a>
                <a
                    href="https://wa.me/0691581813?text=Bonjour,%20je%20souhaite%20avoir%20plus%20d'informations."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                >
                    <i className="fab fa-whatsapp"></i> {/* Icône WhatsApp */}
                </a>
            </div>

            {/* Section des droits réservés */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SCOLARA. Tous droits réservés. Développé par DeepTech.</p>
            </div>
        </footer>
    );
};

export default SignupFooter;
