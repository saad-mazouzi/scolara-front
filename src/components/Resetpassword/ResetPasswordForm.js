import React, { useState } from 'react';
import axiosInstance from '../../axiosConfig';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ResetPasswordForm.css'; // Assurez-vous que ce fichier existe

const ResetPasswordForm = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
    const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChangeNouveauMotDePasse = (e) => {
        setNouveauMotDePasse(e.target.value);
    };

    const handleChangeConfirmerMotDePasse = (e) => {
        setConfirmerMotDePasse(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (nouveauMotDePasse !== confirmerMotDePasse) {
            setMessage("Les mots de passe ne correspondent pas. Veuillez réessayer.");
            return;
        }

        try {
            await axiosInstance.post('/password-reset/confirm/', { token, new_password: nouveauMotDePasse });
            setMessage('Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');

            // Redirection vers la page de connexion après la réinitialisation
            setTimeout(() => {
                navigate('/login'); // Redirige vers la page de connexion
            }, 3000); // Attendre 3 secondes avant la redirection
        } catch (error) {
            setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            console.error(error);
        }
    };

    return (
        <div className="formulaire-reinitialisation-container">
            <h2>Réinitialiser le Mot de Passe</h2>
            <form onSubmit={handleSubmit} className="formulaire-reinitialisation-form">
                <div className="input-group">
                    <label>Nouveau Mot de Passe :</label>
                    <input
                        type="password"
                        value={nouveauMotDePasse}
                        onChange={handleChangeNouveauMotDePasse}
                        required
                        placeholder="Entrez votre nouveau mot de passe"
                    />
                </div>
                <div className="input-group">
                    <label>Confirmer le Mot de Passe :</label>
                    <input
                        type="password"
                        value={confirmerMotDePasse}
                        onChange={handleChangeConfirmerMotDePasse}
                        required
                        placeholder="Confirmez votre mot de passe"
                    />
                </div>
                <button type="submit" className="submit-button">Réinitialiser le Mot de Passe</button>
            </form>
            {message && <p className="reset-password-message">{message}</p>}
        </div>
    );
};

export default ResetPasswordForm;
