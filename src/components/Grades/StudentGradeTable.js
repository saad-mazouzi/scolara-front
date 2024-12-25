import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchStudentSubjects } from '../../APIServices';
// import './StudentGradeTable.css'; // Assurez-vous que votre fichier CSS est bien configuré
import { PuffLoader } from 'react-spinners';

const StudentGradesTable = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const schoolId = Cookies.get('SchoolId');
    const educationLevelId = Cookies.get('education_level'); // Récupère l'ID du niveau d'éducation depuis les cookies
    const navigate = useNavigate(); // Hook pour la navigation

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer les matières liées au niveau d'éducation
                const subjectsData = await fetchStudentSubjects(schoolId, educationLevelId);
                setSubjects(subjectsData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (schoolId && educationLevelId) {
            fetchData();
        }
    }, [schoolId, educationLevelId]);

    const handleSubjectClick = (subjectId) => {
        navigate(`/student-grades/${subjectId}`); // Redirection vers les notes de la matière
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) return <p>Erreur lors du chargement des matières : {error.message}</p>;

    return (
        <div>
            <div className="student-list-title">
                <h3>Mes Matières</h3>
            </div>

            <div className="subjects-grid">
                {subjects.map((subject) => (
                    <div
                        className="subject-card"
                        key={subject.id}
                        onClick={() => handleSubjectClick(subject.id)} // Redirection au clic
                        style={{ cursor: 'pointer' }} // Indique que la carte est cliquable
                    >
                        <h4>{subject.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentGradesTable;
