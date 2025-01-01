import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa'; // Icones pour l'édition et affichage/masquage des mots de passe
import { updateAdminProfilePicture, updateAdminPassword,updateSchoolLogo } from '../../APIServices'; // Import des fonctions
import axiosInstance from '../../axiosConfig';
import './AdminProfile.css';
import { HashLoader,MoonLoader } from 'react-spinners';

const AdminProfile = () => {
    const [cookies, setCookie] = useCookies(['userFirstName', 'profilePicture', 'TeacherId']);
    const [profilePicture, setProfilePicture] = useState('');
    const [userName, setUserName] = useState('');
    const [schoolLogo, setSchoolLogo] = useState('');
    const [newSchoolLogo, setNewSchoolLogo] = useState(null); // Pour le fichier à uploader
    const [isLoading, setIsLoading] = useState(true);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [schoolPhone, setSchoolPhone] = useState('');
    const [newSchoolAddress, setNewSchoolAddress] = useState('');
    const [schoolSemestre, setSchoolSemestre] = useState('');
    const [newSchoolSemestre, setNewSchoolSemestre] = useState('');
    const [newSchoolPhone, setNewSchoolPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // État pour afficher/masquer le mot de passe de confirmation
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const TeacherId = cookies.TeacherId;
    const schoolId = cookies.SchoolId; // Récupération de SchoolId
    const [loadingForm, setLoadingForm] = useState(false);  // État pour le chargement du formulaire    

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!TeacherId) {
                setAlertMessage('Aucun ID utilisateur trouvé dans les cookies.');
                setAlertType('error');
                setIsLoading(false);
                return;
            }
    
            try {
                // Récupération des données de l'administrateur
                const adminResponse = await axiosInstance.get(`users/${TeacherId}/retrieve_admin/`);
                const { profile_picture, first_name, last_name } = adminResponse.data;
                setProfilePicture(profile_picture ? `${profile_picture}` : '');
                setUserName(`${first_name} ${last_name}`);
    
                // Récupération des données de l'école
                if (schoolId) {
                    const schoolResponse = await axiosInstance.get(`school/${schoolId}/`);
                    const { logo } = schoolResponse.data;
                    console.log(`le logo est ${logo}`);
                    setSchoolLogo(logo ? `${logo}` : '');
                }
            } catch (error) {
                setAlertMessage('Erreur lors de la récupération des données.');
                setAlertType('error');
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchProfileData();
    }, [TeacherId, schoolId]);

    useEffect(() => {
        console.log("Chemin du logo de l'école:", schoolLogo);
    }, [schoolLogo]);

    useEffect(() => {
        console.log ('le chemin du photo de profil est :', profilePicture);
    }, [profilePicture]);
    
    
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                if (!schoolId) {
                    setAlertMessage('School ID not found.');
                    setAlertType('error');
                    return;
                }

                const response = await axiosInstance.get(`school/${schoolId}/`);
                const {  name, address, phone_number,semestre } = response.data;
                setSchoolName(name || ''); // Set school name
                setSchoolAddress(address || '');
                setSchoolPhone(phone_number || '');
                setSchoolSemestre(semestre || '');
            } catch (error) {
                console.error('Error fetching school data:', error);
                setAlertMessage('Failed to load school details.');
                setAlertType('error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchoolData();
    }, [schoolId]);


    const handleProfilePictureSubmit = async () => {
        if (!newProfilePicture) {
            setAlertMessage('Veuillez sélectionner une nouvelle photo de profil.');
            setAlertType('error');
            return;
        }
        setLoadingForm(true);
        const formData = new FormData();
        formData.append('profile_picture', newProfilePicture);

        try {
            const updatedData = await updateAdminProfilePicture(TeacherId, formData);
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
            setLoadingForm(false);
        }
    };

    const handleSchoolLogoSubmit = async () => {
        if (!schoolId) {
            setAlertMessage('ID de l\'école introuvable.');
            setAlertType('error');
            return;
        }
    
        if (!newSchoolLogo) {
            setAlertMessage('Veuillez sélectionner un nouveau logo.');
            setAlertType('error');
            return;
        }
        setLoadingForm(true);
        const formData = new FormData();
        formData.append('logo', newSchoolLogo);
    
        try {
            const updatedData = await updateSchoolLogo(schoolId, formData);
    
            // Mise à jour du logo dans l'état après succès
            const newSchoolLogoPath = updatedData.logo; // Chemin relatif renvoyé par le backend
            setSchoolLogo(`${newSchoolLogoPath}`);
            setNewSchoolLogo(null);
            setAlertMessage('Logo de l\'école mis à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du logo de l\'école :', error);
            setAlertMessage('Erreur lors de la mise à jour du logo de l\'école.');
            setAlertType('error');
        } finally {
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
            await updateAdminPassword(TeacherId, updatedData);
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
            }, 5000); // Masquer le message après 5 secondes
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const handleAddressSubmit = async () => {
        if (!newSchoolAddress) {
            setAlertMessage('Please enter a valid address.');
            setAlertType('error');
            return;
        }
        setLoadingForm(true);

        try {
            await axiosInstance.put(`school/${schoolId}/`, {
                name: schoolName, // Include the school name
                address: newSchoolAddress,
                phone_number: schoolPhone, 
                semestre : schoolSemestre// Include the existing phone number
            });
            setSchoolAddress(newSchoolAddress);
            setNewSchoolAddress('');
            setAlertMessage('School address updated successfully.');
            setAlertType('success');
        } catch (error) {
            console.error('Error updating school address:', error);
            setAlertMessage('Failed to update school address.');
            setAlertType('error');
        } finally {
            setLoadingForm(false);
        }
    };

    const handlePhoneSubmit = async () => {
        if (!newSchoolPhone) {
            setAlertMessage('Please enter a valid phone number.');
            setAlertType('error');
            return;
        } 
        setLoadingForm(true);

        try {
            await axiosInstance.put(`school/${schoolId}/`, {
                name: schoolName, // Include the school name
                address: schoolAddress, // Include the existing address
                phone_number: newSchoolPhone,
                semestre:schoolSemestre // Correct the key to `phone_number`
            });
            setSchoolPhone(newSchoolPhone);
            setNewSchoolPhone('');
            setAlertMessage('School phone number updated successfully.');
            setAlertType('success');
        } catch (error) {
            console.error('Error updating school phone number:', error);
            setAlertMessage('Failed to update school phone number.');
            setAlertType('error');
        } finally {
            setLoadingForm(false);
        }
    };

    const handleSemestreSubmit = async () => {
        if (!newSchoolSemestre) {
            setAlertMessage('Veuillez entrer un semestre valide.');
            setAlertType('error');
            return;
        }
        setLoadingForm(true);

        try {
            await axiosInstance.put(`school/${schoolId}/`, {
                semestre: newSchoolSemestre,
                name: schoolName,
                address: schoolAddress,
                phone_number: schoolPhone,
            });

            setSchoolSemestre(newSchoolSemestre);
            setNewSchoolSemestre('');
            setAlertMessage('Semestre mis à jour avec succès.');
            setAlertType('success');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du semestre:', error);
            setAlertMessage('Erreur lors de la mise à jour du semestre.');
            setAlertType('error');
        } finally {
            setLoadingForm(false);
        }   
    };


    if (isLoading) {
        return (
            <div className="loading-container">
                <HashLoader size={60} color="#ffcc00" loading={isLoading} />
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
                        <div className="loading-container">
                            <HashLoader size={60} color="#ffcc00" loading={isLoading} />
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
                    <div className="change-logo-title">
                        <strong>Modifier le logo de l'école :</strong>
                    </div>
                    <div className="school-logo-container">
                        {schoolLogo ? (
                            <img
                                src={schoolLogo}
                                alt="Logo de l'école"
                                className="school-logo"
                            />
                        ) : (
                            <div className="loading-container">
                                <HashLoader size={60} color="#ffcc00" loading={isLoading} />
                            </div>
                        )}
                        <FaEdit
                            className="edit-icon-admin-logo"
                            onClick={() => document.getElementById('schoolFileInput').click()}
                            style={{ cursor: 'pointer', position: 'absolute', fontSize: '20px', top: '560px', left: '1000px' }}
                        />
                        <input
                            type="file"
                            id="schoolFileInput"
                            style={{ display: 'none' }}
                            onChange={(e) => setNewSchoolLogo(e.target.files[0])}
                        />
                        {newSchoolLogo && (
                            <button className="submit-school-logo-button" onClick={handleSchoolLogoSubmit}>
                                Mettre à jour le logo de l'école
                            </button>
                        )}
                    </div>

                    <div className="change-logo-title">
                        <div>
                            <strong>Adresse:</strong> {schoolAddress || 'Not specified'}
                        </div>
                        <input
                            type="text"
                            placeholder="Nouvelle adresse"
                            value={newSchoolAddress}
                            onChange={(e) => setNewSchoolAddress(e.target.value)}
                            className="admin-input-modify-password "
                        />
                        <button className="modify-address-button" onClick={handleAddressSubmit}>
                            Modifier l'adresse
                        </button>
                    </div>

                    <div className="change-logo-title">
                        <div>
                            <strong>Numéro de téléphone:</strong> {schoolPhone || 'Not specified'}
                        </div>
                        <input
                            type="text"
                            placeholder="Nouveau numéro de téléphone"
                            value={newSchoolPhone}
                            onChange={(e) => setNewSchoolPhone(e.target.value)}
                            className="admin-input-modify-password "
                        />
                        <button className="modify-address-button" onClick={handlePhoneSubmit}>
                            Modifier le numéro de téléphone
                        </button>
                    </div>
                    <div className="change-logo-title">
                        <div>
                            <strong>Semestre ou Trismestre actuel:</strong> {schoolSemestre}
                        </div>
                        <input
                            type="text"
                            placeholder="Nouveau semestre"
                            value={newSchoolSemestre}
                            onChange={(e) => setNewSchoolSemestre(e.target.value)}
                            className="admin-input-modify-password"
                        />
                        <button className="modify-address-button" onClick={handleSemestreSubmit}>
                            Modifier le semestre
                        </button>
                    </div>
                </div>
            </div>
            {loadingForm && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProfile;
