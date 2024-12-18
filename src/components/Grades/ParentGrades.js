import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchStudentGrades, fetchStudentControls } from '../../APIServices';
import './Grades.css';

const ParentGrades = () => {
    const { subjectId } = useParams(); // ID du sujet cliqué depuis l'URL
    const userId = Cookies.get('StudentId'); // ID de l'utilisateur depuis les cookies
    const schoolId = Cookies.get('SchoolId'); // ID de l'école depuis les cookies
    const [grades, setGrades] = useState([]);
    const [controls, setControls] = useState([]); // Liste des contrôles
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalScore, setTotalScore] = useState(0); // Note totale pondérée

    // Fonction pour récupérer le type de contrôle
    const getControlType = (controlId) => {
        const control = controls.find((ctrl) => ctrl.id === controlId);
        return control ? control.control_type : 'N/A';
    };

    // Fonction pour récupérer le coefficient du contrôle
    const getControlCoefficient = (controlId) => {
        const control = controls.find((ctrl) => ctrl.id === controlId);
        return control ? parseFloat(control.coefficient) : 0; // Retourne 0 si aucun coefficient trouvé
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer les notes
                if (userId && subjectId) {
                    const gradesData = await fetchStudentGrades(userId, subjectId);
                    setGrades(gradesData);
                } else {
                    console.error("Manque userId ou subjectId pour récupérer les notes.");
                    setError("Impossible de charger les notes.");
                    return;
                }

                // Récupérer les contrôles
                if (schoolId && subjectId) {
                    const controlsData = await fetchStudentControls(schoolId, subjectId);
                    setControls(controlsData);
                } else {
                    console.error("Manque schoolId ou subjectId pour récupérer les contrôles.");
                    setError("Impossible de charger les contrôles.");
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des données :", err);
                setError("Impossible de charger les données.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, subjectId, schoolId]);

    useEffect(() => {
        if (grades.length > 0 && controls.length > 0) {
            // Calculer la note totale pondérée
            const total = grades.reduce((acc, grade) => {
                const coefficient = getControlCoefficient(grade.control);
                const score = grade.score ? parseFloat(grade.score) : 0;
                return acc + score * coefficient;
            }, 0);

            setTotalScore(total.toFixed(2)); // Arrondir à deux décimales
        }
    }, [grades, controls]);

    if (loading) return <p>Chargement des notes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="grades-container">
            <div className="student-list-title">
                <h3>Notes</h3>
            </div>

            {grades.length > 0 ? (
                <>
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Type de contrôle</th>
                                <th>Coefficient</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade) => {
                                const controlType = getControlType(grade.control);
                                const controlCoefficient = getControlCoefficient(grade.control);

                                return (
                                    <tr key={grade.id}>
                                        <td>{controlType !== 'N/A' ? controlType : 'Contrôle manquant'}</td>
                                        <td>{controlCoefficient !== 0 ? controlCoefficient : '-'}</td>
                                        <td>{grade.score || 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="total-score">
                        <strong>Note totale : {totalScore}</strong>
                    </div>
                </>
            ) : (
                <p>Aucune note disponible pour cette matière.</p>
            )}
        </div>
    );
};

export default ParentGrades;
