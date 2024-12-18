import React, { useState } from 'react';
import axiosInstance from '../../axiosConfig';
import Modal from '../Modal/Modal';
import './ForgotPassword.css'; 

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [showModal, setShowModal] = useState(false); // Contrôle de la modal
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/password-reset/', { email });
            setMessage('Email de réinitialisation envoyé. Veuillez vérifier votre boîte de réception.');
            setShowModal(true); // Affiche la modal
        } catch (error) {
            setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            setShowModal(true); // Affiche également la modal en cas d'erreur
            console.error(error);
        }
    };

    const closeModal = () => setShowModal(false); // Fonction pour fermer la modal

    return (
        <div className="motdepasse-oublie-container">
            <h2>Mot de Passe Oublié</h2>
            <form onSubmit={handleSubmit} className="motdepasse-oublie-form">
                <div className="input-group">
                    <label>Adresse Email :</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleChange}
                        required
                        placeholder="Entrez votre adresse email"
                    />
                </div>
                <button type="submit" className="submit-button">Envoyer le lien</button>
            </form>
            {showModal && <Modal message={message} onClose={closeModal} />} {/* Affichage conditionnel de la modal */}
        </div>
    );
};

export default ForgotPassword;
