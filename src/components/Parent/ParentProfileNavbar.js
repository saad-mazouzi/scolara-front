import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import { updateParentProfilePicture, updateParentPassword } from '../../APIServices'; // Import des fonctions spécifiques aux étudiants
import axiosInstance from '../../axiosConfig';
import '../Teacher/TeacherProfile.css';
import { HashLoader } from 'react-spinners';

const ParentProfileNavbar = () => {
    const [cookies, setCookie] = useCookies(['userFirstName', 'profilePicture', 'TeacherId', 'absences']); // Inclure absences dans les cookies
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
    const [absencesNumber, setAbsencesNumber] = useState(cookies.absences || 0); // Récupérer absences depuis les cookies
    const [parentKey, setParentKey] = useState(''); // Clé secrète des parents
    const studentId = cookies.TeacherId; // ID de l'étudiant
    const schoolId = cookies.SchoolId;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!studentId) {
                setAlertMessage('Aucun ID utilisateur trouvé dans les cookies.');
                setAlertType('error');
                return;
            }

            try {
                const response = await axiosInstance.get(`users/${studentId}/retrieve_parent/`);
                const { profile_picture, first_name, last_name, absences_number, parent_key } = response.data;

                setProfilePicture(profile_picture ? `https://scolara-backend.onrender.com${profile_picture}` : '');
                setUserName(`${first_name} ${last_name}`);
                setAbsencesNumber(absences_number || cookies.absences || 0); // Priorité aux absences récupérées
                setParentKey(parent_key || 'Non défini'); // Mettre à jour la clé secrète

                if (schoolId) {
                    const schoolResponse = await axiosInstance.get(`school/${schoolId}/`);
                    const { logo } = schoolResponse.data;
                    setSchoolLogo(logo ? `${logo}` : '');
                }
            } catch (error) {
                setAlertMessage('Erreur lors de la récupération des données.');
                setAlertType('error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [studentId, schoolId, cookies.absences]);

    const handleProfilePictureSubmit = async () => {
        if (!newProfilePicture) {
            setAlertMessage('Veuillez sélectionner une nouvelle photo de profil.');
            setAlertType('error');
            return;
        }

        const formData = new FormData();
        formData.append('profile_picture', newProfilePicture);

        try {
            const updatedData = await updateParentProfilePicture(studentId, formData);
            const newProfilePicturePath = updatedData.profile_picture;
            setProfilePicture(`https://scolara-backend.onrender.com${newProfilePicturePath}`);
            setNewProfilePicture(null);
            setCookie('profilePicture', encodeURIComponent(newProfilePicturePath), { path: '/' });
            setAlertMessage('Photo de profil mise à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            setAlertMessage('Erreur lors de la mise à jour de la photo de profil.');
            setAlertType('error');
        }
    };

    const handlePasswordSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setAlertMessage('Les mots de passe ne correspondent pas.');
            setAlertType('error');
            return;
        }

        try {
            const updatedData = { password: newPassword };
            await updateParentPassword(studentId, updatedData);
            setNewPassword('');
            setConfirmPassword('');
            setAlertMessage('Mot de passe mis à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            setAlertMessage('Erreur lors de la mise à jour du mot de passe.');
            setAlertType('error');
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
                    <div className="admin-name">
                        {userName}
                    </div>
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt={`Photo de profil de ${userName}`}
                            className="admin-profile-picture"
                        />
                    ) : (
                        <div></div>
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
                <div className="parent-left-text"><strong>Nombre d'absences de votre enfant : </strong>{absencesNumber !== null ? absencesNumber : 0}</div>
            </div>
        </div>
    );
};

export default ParentProfileNavbar;
