import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import { updateDriverProfilePicture, updateDriverpassword } from '../../APIServices';
import axiosInstance from '../../axiosConfig';
import '../Teacher/TeacherProfile.css';
import { HashLoader, MoonLoader } from 'react-spinners';

const DriverProfileNavbar = () => {
    const [cookies, setCookie] = useCookies(['userFirstName', 'profilePicture', 'TeacherId']);
    const [profilePicture, setProfilePicture] = useState('');
    const [userName, setUserName] = useState('');
    const [schoolLogo, setSchoolLogo] = useState('');
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [absencesNumber, setAbsencesNumber] = useState(null);
    const [loading, setLoading] = useState(true); // Indicateur de chargement
    const [profilePictureLoading, setProfilePictureLoading] = useState(false); // Indicateur de chargement pour la mise à jour de la photo
    const TeacherId = cookies.TeacherId;
    const schoolId = cookies.SchoolId;
    const [loadingform, setLoadingForm] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!TeacherId) {
                setAlertMessage('Aucun ID utilisateur trouvé dans les cookies.');
                setAlertType('error');
                return;
            }

            setLoading(true); // Début du chargement
            try {
                const response = await axiosInstance.get(`users/${TeacherId}/retrieve_driver/`);
                const { profile_picture, first_name, last_name, absences_number } = response.data;

                setProfilePicture(profile_picture ? `${profile_picture}` : '');
                setUserName(`${first_name} ${last_name}`);
                setAbsencesNumber(absences_number || 0);

                if (schoolId) {
                    const schoolResponse = await axiosInstance.get(`school/${schoolId}/`);
                    const { logo } = schoolResponse.data;
                    setSchoolLogo(logo ? `${logo}` : '');
                }
            } catch (error) {
                setAlertMessage('Erreur lors de la récupération des données.');
                setAlertType('error');
            } finally {
                setLoading(false); // Fin du chargement
            }
        };

        fetchProfileData();
    }, [TeacherId, schoolId]);

    const handleProfilePictureSubmit = async () => {
        if (!newProfilePicture) {
            setAlertMessage('Veuillez sélectionner une nouvelle photo de profil.');
            setAlertType('error');
            return;
        }

        setLoadingForm(true);

        const formData = new FormData();
        formData.append('profile_picture', newProfilePicture);

        setProfilePictureLoading(true); // Début du chargement
        try {
            const updatedData = await updateDriverProfilePicture(TeacherId, formData);
            const newProfilePicturePath = updatedData.profile_picture;
            setProfilePicture(`${newProfilePicturePath}`);
            setNewProfilePicture(null);
            setCookie('profilePicture', encodeURIComponent(newProfilePicturePath), { path: '/' });
            setAlertMessage('Photo de profil mise à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            setAlertMessage('Erreur lors de la mise à jour de la photo de profil.');
            setAlertType('error');
        } finally {
            setProfilePictureLoading(false); // Fin du chargement
            setLoadingForm(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setAlertMessage('Les mots de passe ne correspondent pas.');
            setAlertType('error');
            return;
        }
        setLoadingForm(true);
        try {
            const updatedData = { password: newPassword };
            await updateDriverpassword(TeacherId, updatedData);
            setNewPassword('');
            setConfirmPassword('');
            setAlertMessage('Mot de passe mis à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            setAlertMessage('Erreur lors de la mise à jour du mot de passe.');
            setAlertType('error');
        } finally {
            setLoadingForm(false);
        }
    };

    const handleAlertClose = () => {
        setAlertMessage('');
        setAlertType('');
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                handleAlertClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    if (loading) {
        return (
            <div className="loading-container">
                <HashLoader size={60} color="#ffcc00" />
            </div>
        );
    }

    return (
        <div className="admin-profile-container">
            {alertMessage && (
                <div className={`alert ${alertType}`}>
                    {alertMessage}
                    <span className="alert-close" onClick={handleAlertClose}>&times;</span>
                </div>
            )}
            <div className="admin-profile-content">
                <div className="admin-profile-picture-container">
                    <div className="driver-name">
                        {userName || 'Nom Inconnu'}
                    </div>
                    {profilePictureLoading ? (
                        <HashLoader size={40} color="#ffcc00" />
                    ) : profilePicture ? (
                        <img
                            src={profilePicture}
                            alt={`Photo de profil de ${userName}`}
                            className="driver-profile-picture"
                        />
                    ) : (
                        <div className="admin-placeholder">
                            <span>Aucune Photo</span>
                        </div>
                    )}
                    <FaEdit
                        className="edit-icon-admin"
                        onClick={() => document.getElementById('fileInput').click()}
                        style={{ cursor: 'pointer', position: 'absolute', bottom: '10px', right: '10px', fontSize: '20px' }}
                    />
                </div>
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={(e) => setNewProfilePicture(e.target.files[0])}
                />
                <button className="modify-profile-picture-admin" onClick={handleProfilePictureSubmit}>
                    Mettre à jour la photo de profil
                </button>
                <div className="admin-password-update">
                    <div className="change-password-title"><strong>Changer votre mot de passe :</strong></div>
                    <div className="password-fields-container">
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="admin-input-modify-password"
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="password-field">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirmer mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="admin-input-modify-password"
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className="modify-password-button" onClick={handlePasswordSubmit}>
                            Mettre à jour le mot de passe
                        </button>
                    </div>
                </div>
            </div>
            {loadingform && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingform} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default DriverProfileNavbar;
