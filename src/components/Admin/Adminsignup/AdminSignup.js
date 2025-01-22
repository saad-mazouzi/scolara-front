import React, { useState } from 'react';
import { signup } from '../../../APIServices';
import { useNavigate } from 'react-router-dom';
import './AdminSignup.css'; 
import Modal from '../../Modal/Modal';
import { MoonLoader } from 'react-spinners';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        school: '',
        password: '',
        confirmPassword: '',
        profilePicture: null,
        gender: '', // Nouveau champ pour le genre
    });

    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false); // État pour le loader
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Récupérer le premier fichier
        setFormData((prevState) => ({ ...prevState, profilePicture: file }));
    };

    const handleSubmit = async (e) => {
        setLoadingForm(true);
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Les mots de passe ne correspondent pas');
            return;
        }
    
        const userData = new FormData();
        userData.append('first_name', formData.firstName);
        userData.append('last_name', formData.lastName);
        userData.append('email', formData.email);
        userData.append('phone_number', formData.phone);
        userData.append('address', formData.address);
        userData.append('school', formData.school); // Envoyer le nom de l'école ici
        userData.append('password', formData.password);
        userData.append('gender', formData.gender);
        userData.append('role', 1); // ID du rôle "ADMIN"
        userData.append('is_admin', true); // Indiquer que c'est un admin
    
        if (formData.profilePicture) {
            userData.append('profile_picture', formData.profilePicture);
        }
        
        try {
            const response = await signup(userData);
            setMessage("Inscription réussie ! Un e-mail de vérification a été envoyé.");
            setShowModal(true);
            console.log(response);
            navigate('/login'); // Redirige vers la page de connexion après une inscription réussie
        } catch (error) {
            setMessage('Échec de l\'inscription. Veuillez réessayer.');
            console.error(error);
            setShowModal(true); // Affiche le modal en cas d'erreur
        } finally {
            setLoadingForm(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="signupbody">
            <div className="zoom-container"> 
                <div className="container">
                    <div className="form-section">
                        <h2>Inscription Admin</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="form-pair">
                                <div>
                                    <label>Nom :</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        className="admin-signup-input" // Classe unique
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Téléphone :</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="admin-signup-input" // Classe unique
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-pair">
                                <div>
                                    <label>Prénom :</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        className="admin-signup-input" // Classe unique
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Adresse :</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="admin-signup-input" // Classe unique
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label>École :</label>
                                <input
                                    type="text"
                                    name="school"
                                    className="admin-signup-input" // Classe unique
                                    value={formData.school}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email :</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="admin-signup-input" // Classe unique
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Mot de passe :</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="admin-signup-input" // Classe unique
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Confirmer le mot de passe :</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="admin-signup-input" // Classe unique
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label>Genre :</label>
                                <select
                                    name="gender"
                                    className="admin-signup-select" // Classe unique
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un genre</option>
                                    <option value="MALE">Homme</option>
                                    <option value="FEMALE">Femme</option>
                                </select>
                            </div>

                            <div>
                                <label>Photo de profil :</label>
                                <input
                                    type="file"
                                    name="profilePicture"
                                    accept="image/*" // Accepter uniquement les images
                                    onChange={handleFileChange} // Utilisez handleFileChange ici
                                    className="file-input" // Classe pour le style
                                />
                            </div>

                            <div className='whitetext'>Scolara</div>
                            <button className="signup-button" type="submit">S'inscrire</button>
                        </form>

                        {message && <p>{message}</p>}
                    </div>
                </div>
            </div>
            {showModal && <Modal message={message} onClose={handleCloseModal} />}
            {loadingForm && (
                <div className="overlay-loader">
                    <div className="login-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}
        </div>    
    );
};

export default AdminSignup;
