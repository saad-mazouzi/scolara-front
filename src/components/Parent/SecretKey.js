import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './Parent.css';
import { MoonLoader } from 'react-spinners';

const SecretKeyForm = () => {
    const [secretKey, setSecretKey] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setSecretKey(e.target.value);
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        if (secretKey.trim() === '') {
            setMessage('Veuillez entrer une clé secrète.');
            return;
        }

        try {
            // Stocker la clé secrète dans les cookies
            Cookies.set('parent_key', secretKey, { expires: 7 }); // Expire après 7 jours

            // Récupérer l'education_level via l'API
            const educationLevelResponse = await axios.get(
                `https://scolara-backend.onrender.com/api/education-level-by-parent-key/${encodeURIComponent(secretKey)}/`
            );
            const educationLevelId = educationLevelResponse.data.education_level_id;
            Cookies.set('education_level', educationLevelId, { expires: 7 });

            // Récupérer l'école via l'API
            const schoolResponse = await axios.get(
                `https://scolara-backend.onrender.com/api/school-by-parent-key/${encodeURIComponent(secretKey)}/`
            );
            const schoolId = schoolResponse.data.school_id;
            Cookies.set('SchoolId', schoolId, { expires: 7 }); // Stocke school_id en tant que SchoolId

            const studentResponse = await axios.get(
                `https://scolara-backend.onrender.com/api/student-by-parent-key/${encodeURIComponent(secretKey)}/`
            );
            const studentId = studentResponse.data.student_id;
            Cookies.set('StudentId', studentId, { expires: 7 }); // Stocke school_id en tant que SchoolId

            const absencesResponse = await axios.get(
                `https://scolara-backend.onrender.com/api/absences-by-parent-key/${encodeURIComponent(secretKey)}/`
            );
            const absences= absencesResponse.data.absences_number;
            Cookies.set('absences', absences, { expires: 7 }); // Stocke school_id en tant que SchoolId


            // Rediriger vers la page parent-timetable avec la clé secrète dans l'URL
            navigate(`/parent-timetable/${encodeURIComponent(secretKey)}`);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            setMessage('Clé secrète invalide ou erreur lors de la récupération des données.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="secret-key-container">
            <h2>Vérification de la clé secrète</h2>
            <form onSubmit={handleSubmit}>
                <div className="secret-key">
                    <label>Clé secrète de votre enfant :</label>
                    <input
                        type="text"
                        name="secretKey"
                        value={secretKey}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="secret-key-button" type="submit">Entrer</button>
            </form>
            {message && <p className="error-message">{message}</p>}
            {loading && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loading} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecretKeyForm;
