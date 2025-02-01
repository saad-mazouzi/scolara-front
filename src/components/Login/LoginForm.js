import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import axiosInstance from '../../axiosConfig';
import '../../components/Signup/Signup.css';
import '../Admin/Adminsignup/AdminSignup.css';
import './LoginForm.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const [, setCookie] = useCookies([
        'jwtToken', 'refreshToken', 'userFirstName', 
        'profilePicture', 'SchoolName', 'SchoolId', 
        'education_level', 'TeacherId', 'UserRole'
    ]);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loadingForm, setLoadingForm] = useState(false); // État pour le loader

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingForm(true); // Activer le loader
        try {
            const response = await axiosInstance.post('users/login/', formData);
            const { access, refresh, first_name, school, school_id, user} = response.data;

            setCookie('jwtToken', access, { path: '/', sameSite: 'None', secure: true });
            setCookie('refreshToken', refresh, { path: '/', sameSite: 'None', secure: true });
            setCookie('userFirstName', first_name, { path: '/', sameSite: 'None', secure: true });
            setCookie('profilePicture', user.profile_picture, { path: '/', sameSite: 'None', secure: true });
            setCookie('SchoolName', school, { path: '/', sameSite: 'None', secure: true });
            setCookie('SchoolId', school_id, { path: '/', sameSite: 'None', secure: true });
            setCookie('TeacherId', user.id, { path: '/', sameSite: 'None', secure: true });
            setCookie('UserRole', user.role, { path: '/', sameSite: 'None', secure: true });

            const schoolResponse = await axiosInstance.get(`school/${school_id}/`);
            const schoolLogo = schoolResponse.data.logo;

            // Stocker le logo dans les cookies
            if (schoolLogo) {
                setCookie('SchoolLogo', schoolLogo, { path: '/', sameSite: 'None', secure: true });
            }


            if (user.role === 5) {
                navigate('/transport-driver');
            } else if (user.role === 3) {
                if (user.education_level) {
                    setCookie('TeacherEducationLevel', user.education_level, { path: '/' });
                }
                if (user.subject) {
                    setCookie('TeacherSubject', user.subject, { path: '/' });
                }
                navigate('/timetable-teacher');
            } else if (user.role === 4) {
                navigate('/enter-secret-key');
            } else if (user.role === 1) {
                navigate('/dashboard');
            } else if (user.role === 2) {
                if (user.education_level) {
                    setCookie('education_level', user.education_level, { path: '/' });
                }
                navigate('/student-timetable');
            } else {
                navigate('/');
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
        } finally {
            setLoadingForm(false); // Désactiver le loader
        }
    };

    return (
        <div className="signupbody">
            <div className="zoom-container">
                <div className="login-container">
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
                                    disabled={loadingForm} // Désactiver pendant le chargement
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
                                    disabled={loadingForm} // Désactiver pendant le chargement
                                />
                            </div>
                            <div className="whitetext">_</div>
                            <button className="signup-button" type="submit" disabled={loadingForm}>
                                {loadingForm ? 'Chargement...' : 'Se connecter'}
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

export default LoginForm;
