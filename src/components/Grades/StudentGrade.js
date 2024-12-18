import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { fetchControls, fetchStudentsByEducationLevel, fetchGrades } from '../../APIServices'; // Assurez-vous que fetchGrades est bien configuré
import './StudentTable.css';

const StudentGrade = () => {
    const { id: studentId } = useParams(); // Récupère l'ID de l'étudiant depuis l'URL
    const [cookies] = useCookies(['SchoolId', 'TeacherSubject']); // Récupère les cookies nécessaires
    const [controls, setControls] = useState([]);
    const [grades, setGrades] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const schoolId = cookies.SchoolId; // ID de l'école
    const subjectId = cookies.TeacherSubject; // ID de la matière

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!schoolId || !subjectId) {
                    throw new Error("ID de l'école ou de la matière non trouvé dans les cookies.");
                }

                setLoading(true);

                // Récupérer les informations de l'étudiant
                const studentsData = await fetchStudentsByEducationLevel(schoolId); // Passez le SchoolId
                const selectedStudent = studentsData.find((student) => student.id === parseInt(studentId));
                setStudent(selectedStudent);

                // Récupérer les contrôles
                const controlsData = await fetchControls(schoolId); // Passez le SchoolId
                setControls(controlsData);

                // Récupérer les notes de l'étudiant pour chaque contrôle
                const gradesData = await fetchGrades(studentId, schoolId, subjectId); // Passez les IDs nécessaires
                setGrades(gradesData);

                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données :", err);
                setError(err.message || "Erreur lors du chargement des données.");
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId, schoolId, subjectId]);

    if (loading) {
        return <div>Chargement des données...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!student) {
        return <div>Aucun étudiant trouvé avec cet ID.</div>;
    }

    // Calculer la note finale en fonction des coefficients
    const calculateFinalGrade = () => {
        let totalGrade = 0;
        let totalCoefficient = 0;

        grades.forEach((grade) => {
            totalGrade += grade.score * grade.coefficient;
            totalCoefficient += grade.coefficient;
        });

        return totalCoefficient ? (totalGrade / totalCoefficient).toFixed(2) : 'N/A';
    };

    return (
        <div className="student-grade-container">
            <h2>Notes de {student.first_name} {student.last_name}</h2>
            <table className="student-grade-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        {controls.map((control) => (
                            <th key={control.id}>{control.control_type}</th>
                        ))}
                        <th>Note complète</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{student.last_name}</td>
                        <td>{student.first_name}</td>
                        {controls.map((control) => {
                            const grade = grades.find((g) => g.control_id === control.id);
                            return <td key={control.id}>{grade ? grade.score : 'N/A'}</td>;
                        })}
                        <td>{calculateFinalGrade()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default StudentGrade;
