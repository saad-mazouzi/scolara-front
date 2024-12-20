import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axiosInstance from '../../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import '../../components/Signup/Signup.css';
import '../Admin/Adminsignup/AdminSignup.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const [, setCookie] = useCookies([
        'jwtToken', 'refreshToken', 'userFirstName', 
        'profilePicture', 'SchoolName', 'SchoolId', 
        'education_level', 'TeacherId', 'UserRole' // Ajout de 'UserRole' ici
    ]);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isParent, setIsParent] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('users/login/', formData);
            const { access, refresh, first_name, school, school_id, user } = response.data;
    
            // Stocker les cookies
            setCookie('jwtToken', access, { path: '/', sameSite: 'None', secure: true });
            setCookie('refreshToken', refresh, { path: '/', sameSite: 'None', secure: true });
            setCookie('userFirstName', first_name, { path: '/' });
            setCookie('profilePicture', user.profile_picture, { path: '/' });
            setCookie('SchoolName', school, { path: '/' });
            setCookie('SchoolId', school_id, { path: '/' });
    
            // Stocker l'ID et le rôle de l'utilisateur dans les cookies
            setCookie('TeacherId', user.id, { path: '/' });
            setCookie('UserRole', user.role, { path: '/' });
    
            if (user.role === 5) { // Chauffeur
                // Récupérer l'ID du transport en fonction de l'ID du chauffeur
                try {
                    const transportResponse = await axiosInstance.get(
                        `https://scolara-backend.onrender.com/api/stations-by-driver-id/${user.id}/`
                    );
                    const { transport_id } = transportResponse.data;
    
                    if (transport_id) {
                        // Rediriger vers l'URL dynamique
                        navigate(`/transport-driver/${transport_id}`);
                    } else {
                        throw new Error("ID du transport introuvable.");
                    }
                } catch (transportError) {
                    console.error("Erreur lors de la récupération du transport :", transportError);
                    setMessage(
                        <span style={{ color: 'red' }}>
                            Erreur lors de la récupération des informations de transport.
                        </span>
                    );
                }
            } else if (user.role === 3) { // Enseignant
                if (user.education_level) {
                    setCookie('TeacherEducationLevel', user.education_level, { path: '/' });
                }
                if (user.subject) {
                    setCookie('TeacherSubject', user.subject, { path: '/' });
                    console.log('Cookies set for TeacherSubject:', document.cookie);
                }
                setIsTeacher(true);
            } else if (user.role === 4) { // Parent
                setIsParent(true);
            } else if (user.role === 1) { // Administrateur
                navigate('/dashboard');
            } else if (user.role === 2) { // Étudiant
                if (user.education_level) {
                    setCookie('education_level', user.education_level, { path: '/' });
                }
                navigate('/student-timetable');
            } else {
                navigate('/'); // Autres utilisateurs
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            setMessage(
                <span style={{ color: 'red' }}>
                    {error.response?.status === 401
                        ? 'Email ou mot de passe incorrect.'
                        : 'Erreur lors de la connexion.'}
                </span>
            );
        }
    };
    
    
    useEffect(() => {
        if (isParent) {
            navigate('/enter-secret-key'); // Remplacez '/enter-secret-key' par le chemin réel de votre composant de saisie de la clé secrète
        }
    }, [isParent, navigate]);

    useEffect(() => {
        if (isTeacher) {
            navigate('/timetable-teacher');
        }
    }, [isTeacher, navigate]);

    return (
        <div className="signupbody">
            <div className="zoom-container">
                <div className="container">
                    <div className="form-section">
                        <h2>Connexion</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Email :</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="admin-signup-input"
                                    required
                                />
                            </div>
                            <div className="whitetext">_</div>
                            <div>
                                <label>Mot de passe :</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="admin-signup-input"
                                    required
                                />
                            </div>
                            <div className="whitetext">_</div>
                            <button className="signup-button" type="submit">
                                Se connecter
                            </button>
                        </form>
                        {message && <p>{message}</p>}
                        <div className="whitetext">da</div>
                        <div>
                            <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        </div>
                        <p>
                            Pas encore de compte ? <Link to="/register">Inscrivez-vous ici</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
