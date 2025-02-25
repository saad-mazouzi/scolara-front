import React, { useState, useEffect } from 'react';
import { signup, fetchRoles, fetchSchools, fetchEducationLevelsBySchool,fetchSubjectsByEducationLevel, fetchSubjects,createTeacher } from '../../APIServices'; // Assure-toi d'importer fetchSubjects
import { useNavigate, Link } from 'react-router-dom';
import '../Admin/Adminsignup/AdminSignup.css';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Modal from '../Modal/Modal';
import { MoonLoader } from 'react-spinners';

const Signup = () => {
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
        role: '',
        subject: '',
        educationLevel: '', // Nouveau champ
        gender: '',
        profilePicture: null
    });

    const [roles, setRoles] = useState([]);
    const [schools, setSchools] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]); // Pour les niveaux d'éducation
    const [subjects, setSubjects] = useState([]); // Nouvel état pour les subjects
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false); // État pour le loader


    useEffect(() => {
        const loadRoles = async () => {
            try {
                const rolesData = await fetchRoles();
                const filteredRoles = rolesData.filter(role => role.id !== 1); // Exclure le rôle admin
                setRoles(filteredRoles);
            } catch (error) {
                console.error('Échec de la récupération des rôles :', error);
            }
        };

        const loadSchools = async () => {
            try {
                const schoolsData = await fetchSchools();
                const filteredSchools = schoolsData.filter(school => school !== null);
                setSchools(filteredSchools);
            } catch (error) {
                console.error('Échec de la récupération des écoles :', error);
            }
        };

        loadRoles();
        loadSchools();
    }, []);

    useEffect(() => {
        const loadEducationLevels = async () => {
            if (formData.school) {
                try {
                    const levelsData = await fetchEducationLevelsBySchool(formData.school);
                    setEducationLevels(levelsData);
                } catch (error) {
                    console.error('Échec de la récupération des niveaux d\'éducation :', error);
                }
            } else {
                setEducationLevels([]); // Réinitialiser si aucune école n'est sélectionnée
            }
        };

        loadEducationLevels();
    }, [formData.school]); // Réexécuter quand l'école change


    useEffect(() => {
        const loadSubjectsByEducationLevel = async () => {
            if (formData.role === '3' && formData.educationLevel) { // Vérifie si le rôle est "enseignant"
                try {
                    const subjectsData = await fetchSubjectsByEducationLevel(formData.educationLevel);
                    setSubjects(subjectsData); // Met à jour les matières
                } catch (error) {
                    console.error('Erreur lors de la récupération des matières par niveau d\'éducation :', error);
                }
            } else {
                setSubjects([]); // Réinitialise les matières si aucune condition n'est remplie
            }
        };
    
        loadSubjectsByEducationLevel();
    }, [formData.role, formData.educationLevel]); // Dépendance sur le rôle et le niveau d'éducation
    
    // Nouveau useEffect pour récupérer les subjects
    
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            console.log("Fichier sélectionné :", files[0]);
            setFormData(prevState => ({ ...prevState, [name]: files[0] }));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };
    

    const handleSubmit = async (e) => {
        setLoadingForm(true);
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Les mots de passe ne correspondent pas.');
            setLoadingForm(false);
            return;
        }
    
        const userData = new FormData();
        userData.append('first_name', formData.firstName);
        userData.append('last_name', formData.lastName);
        userData.append('email', formData.email);
        userData.append('phone_number', formData.phone);
        userData.append('address', formData.address);
        userData.append('school', parseInt(formData.school, 10));
        userData.append('password', formData.password);
        userData.append('role', parseInt(formData.role, 10));
        userData.append('gender', formData.gender);
    
        // Ajouter education_level uniquement pour les étudiants ou enseignants
        if (formData.role === '2' || formData.role === '3') {
            userData.append('education_level', parseInt(formData.educationLevel, 10));
        }
    
        // Ajouter subject uniquement pour les enseignants
        if (formData.role === '3') {
            userData.append('subject', parseInt(formData.subject, 10));
        }        
    
        if (formData.profilePicture) {
            userData.append('profile_picture', formData.profilePicture);
        }
        
        try {
            if (formData.role === '3') {
                // Appeler createTeacher si le rôle est Teacher
                await createTeacher(userData);
            } else {
                // Sinon, appeler signup
                await signup(userData);
            }
    
            // Afficher le modal de succès
            setShowModal(true);
    
            // Attendre quelques secondes pour que l'utilisateur lise le message (facultatif)
            setTimeout(() => {
                setShowModal(false);
                // Redirection vers la page de login
                navigate('/login');
            }, 2000); // Attente de 2 secondes avant de rediriger
    
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            setMessage("Échec de l'inscription. Veuillez réessayer.");
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
                        <h2>Inscription</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-pair">
                                <div>
                                    <label>Nom :</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="admin-signup-input" // Ajout de la classe
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Téléphone :</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="admin-signup-input" // Ajout de la classe
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
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="admin-signup-input" // Ajout de la classe
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Adresse :</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="admin-signup-input" // Ajout de la classe
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label>École :</label>
                                <select 
                                    name="school" 
                                    value={formData.school} 
                                    onChange={handleChange} 
                                    className="admin-signup-select" // Ajout de la classe
                                    required
                                >
                                    <option value="">Sélectionnez une école</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Email :</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="admin-signup-input" // Ajout de la classe
                                    required
                                />
                            </div>

                            <div>
                                <label>Mot de passe :</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="admin-signup-input" // Ajout de la classe
                                    required
                                />
                            </div>

                            <div>
                                <label>Confirmer le mot de passe :</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="admin-signup-input" // Ajout de la classe
                                    required
                                />
                            </div>

                            <div>
                                <label>Rôle :</label>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange} 
                                    className="admin-signup-select" // Ajout de la classe
                                    required
                                >
                                    <option value="">Sélectionnez un rôle</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.role === '3'  && (
                                <div>
                                    <label>Niveau d'éducation :</label>
                                    <select 
                                        name="educationLevel" 
                                        value={formData.educationLevel} 
                                        onChange={handleChange} 
                                        className="admin-signup-select" // Ajout de la classe
                                        required
                                    >
                                        <option value="">Sélectionnez un niveau d'éducation</option>
                                        {educationLevels.map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} {/* Assurez-vous que "name" est la bonne propriété */}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

{formData.role === '3' && (
                                <div>
                                    <label>Matière :</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="admin-signup-select"
                                        required
                                    >
                                        <option value="">Sélectionnez une matière</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.role === '2'  && (
                                <div>
                                    <label>Niveau d'éducation :</label>
                                    <select 
                                        name="educationLevel" 
                                        value={formData.educationLevel} 
                                        onChange={handleChange} 
                                        className="admin-signup-select" // Ajout de la classe
                                        required
                                    >
                                        <option value="">Sélectionnez un niveau d'éducation</option>
                                        {educationLevels.map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} {/* Assurez-vous que "name" est la bonne propriété */}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label>Genre :</label>
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange} 
                                    className="admin-signup-select" // Ajout de la classe
                                    required
                                >
                                    <option value="">Sélectionnez votre genre</option>
                                    <option value="MALE">Homme</option>
                                    <option value="FEMALE">Femme</option>
                                </select>
                            </div>

                            <div>
                                <label>Photo de profil :</label>
                                <input
                                    type="file"
                                    name="profilePicture"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="admin-signup-input" // Ajout de la classe
                                />
                            </div>

                            <button type="submit" className="signup-button">S'inscrire</button>
                        </form>

                        {message && <p className="signup-message">{message}</p>}
                    </div>
                </div>
            </div>

            {loadingForm && (
                <div className="overlay-loader">
                    <div className="login-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}

            {/* {showModal && (
                <Modal 
                    message={message}
                    onClose={handleCloseModal}
                />
            )} */}
        </div>
    );
};

export default Signup;
