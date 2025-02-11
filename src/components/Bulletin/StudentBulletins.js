import React, { useEffect, useState } from 'react';
import { fetchEducationLevels, fetchStudentsByEducationLevel } from '../../APIServices';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import '../Grades/Grades.css';
import { PuffLoader } from 'react-spinners';

const StudentBulletins = () => {
    const [educationLevels, setEducationLevels] = useState([]);
    const [selectedEducationLevel, setSelectedEducationLevel] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const schoolId = Cookies.get('SchoolId');
    const navigate = useNavigate(); // Initialiser useNavigate

    useEffect(() => {
        const getEducationLevels = async () => {
            try {
                if (schoolId) {
                    const levels = await fetchEducationLevels(schoolId);
                    setEducationLevels(levels);
                } else {
                    console.error("SchoolId non trouvé dans les cookies.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des niveaux d'éducation :", error);
            } finally {
                setLoading(false);
            }
        };

        getEducationLevels();
    }, [schoolId]);

    const handleEducationLevelClick = async (educationLevelId) => {
        setSelectedEducationLevel(educationLevelId);
        Cookies.set('selectedEducationLevel', educationLevelId); // Stocker l'ID sélectionné dans les cookies

        setStudentsLoading(true);
        try {
            const studentsData = await fetchStudentsByEducationLevel(schoolId, educationLevelId);
            setStudents(studentsData);
        } catch (error) {
            console.error("Erreur lors de la récupération des étudiants :", error);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleStudentClick = (studentId) => {
        navigate(`/bulletin/${studentId}`); // Rediriger vers la page bulletin/student_id
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    return (
        <div className="grades-container">
            <div className="student-list-title">
                <h3>Niveaux d'Éducation</h3>
            </div>
            {educationLevels.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
                    Aucun niveau d'éducation disponible.
                </p>
            ) : (
                <div className="education-level-cards">
                    {educationLevels.map((level) => (
                        <div
                            key={level.id}
                            className={`education-card ${selectedEducationLevel === level.id ? 'selected' : ''}`}
                            onClick={() => handleEducationLevelClick(level.id)}
                        >
                            <h4>{level.name}</h4>
                        </div>
                    ))}
                </div>
            )}
            <div className='whitetext'>Scolara</div>
            {selectedEducationLevel && (
                <div className="selected-education-level">
                    {studentsLoading ? (
                        <div className="subjects-loading-container">
                            <PuffLoader size={60} color="#ffcc00" loading={studentsLoading} />
                        </div>
                    ) : students.length > 0 ? (
                        <div className="grades-table">
                            <div className="student-list-title">
                                <h3>Étudiants</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Photo de profil</th>
                                        <th>Nom</th>
                                        <th>Prénom</th>
                                        <th>Email</th>
                                        <th>Numéro de téléphone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            onClick={() => handleStudentClick(student.id)} // Redirection au clic
                                            style={{ cursor: 'pointer' }} // Indique que la ligne est cliquable
                                        >
                                            <td>
                                                {student.profile_picture ? (
                                                    <img
                                                        className="student-img"
                                                        src={`${student.profile_picture}`}
                                                        alt={`${student.first_name} ${student.last_name}`}
                                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                                    />
                                                ) : (
                                                    <span>Aucune image</span>
                                                )}
                                            </td>
                                            <td>{student.last_name}</td>
                                            <td>{student.first_name}</td>
                                            <td>{student.email || 'Non spécifié'}</td>
                                            <td>{student.phone_number || 'Non spécifié'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }} >
                            Aucun étudiant trouvé pour ce niveau d'éducation.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentBulletins;
