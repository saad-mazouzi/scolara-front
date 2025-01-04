import React, { useEffect, useState } from 'react';
import {
    fetchEducationLevels,
    fetchSubjectsByEducationLevel,
    fetchGrades,
    fetchStudents,
    fetchAdminControls,
} from '../../APIServices';
import Cookies from 'js-cookie';
import './Grades.css';
import { PuffLoader } from 'react-spinners';

const Grades = () => {
    const [educationLevels, setEducationLevels] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // Filtered students by education level
    const [grades, setGrades] = useState([]);
    const [controls, setControls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEducationLevel, setSelectedEducationLevel] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(false); 

    const schoolId = Cookies.get('SchoolId');

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

        const loadStudents = async () => {
            try {
                const studentsData = await fetchStudents();
                setStudents(studentsData);
            } catch (error) {
                console.error("Erreur lors de la récupération des étudiants :", error);
            }
        };

        getEducationLevels();
        loadStudents();
    }, [schoolId]);

    const getStudentName = (studentId) => {
        const student = students.find((std) => std.id === studentId);
        return student ? `${student.first_name} ${student.last_name}` : 'Nom introuvable';
    };

    const getControlType = (controlId) => {
        const control = controls.find((ctrl) => ctrl.id === controlId);
        return control ? control.control_type : 'N/A';
    };

    const calculateTotalGrade = (studentId) => {
        return controls.reduce((total, control) => {
            const grade = grades.find((g) => g.student === studentId && g.control === control.id);
            const score = grade ? grade.score : 0;
            const coefficient = control.coefficient || 1; // Default coefficient is 1 if not provided
            return total + score * coefficient;
        }, 0).toFixed(2); // Fixed to 2 decimal points
    };

    const getRankings = () => {
        const studentGrades = filteredStudents.map((student) => ({
            id: student.id,
            name: getStudentName(student.id),
            totalGrade: parseFloat(calculateTotalGrade(student.id)),
        }));
    
        // Sort students by total grade in descending order
        studentGrades.sort((a, b) => b.totalGrade - a.totalGrade);
    
        // Add ranking with ties
        let rank = 1;
        let previousGrade = null;
        return studentGrades.map((student, index) => {
            if (student.totalGrade !== previousGrade) {
                rank = index + 1;
            }
            previousGrade = student.totalGrade;
            return { ...student, rank };
        });
    };
    
    const handleEducationLevelClick = async (educationLevelId) => {
        try {
            setLoadingSubjects(true); // Commence le chargement
            setSelectedEducationLevel(educationLevelId);
            Cookies.set('selectedEducationLevel', educationLevelId);
    
            // Filter students by education level
            const filtered = students.filter((student) => student.education_level === educationLevelId);
            setFilteredStudents(filtered);
    
            // Load subjects related to the education level
            const subjects = await fetchSubjectsByEducationLevel(educationLevelId);
            setSubjects(subjects);
    
            setSelectedSubject(null); // Reset selected subject
            setGrades([]); // Reset grades
            setControls([]); // Reset controls
        } catch (error) {
            console.error("Erreur lors de la récupération des matières et des étudiants :", error);
        } finally {
            setLoadingSubjects(false); // Fin du chargement
        }
    };
    

    const handleSubjectClick = async (subjectId) => {
        try {
            setLoadingGrades(true); // Commence le chargement
            setSelectedSubject(subjectId);
            Cookies.set('selectedSubject', subjectId);
    
            // Load controls for the selected level and subject
            const controlsData = await fetchAdminControls(schoolId, selectedEducationLevel, subjectId);
            setControls(controlsData);
    
            // Load grades for each control
            const gradesPromises = controlsData.map((control) =>
                fetchGrades(selectedEducationLevel, subjectId)
            );
    
            const gradesData = await Promise.all(gradesPromises);
            setGrades(gradesData.flat());
        } catch (error) {
            console.error("Erreur lors de la récupération des contrôles et des notes :", error);
        } finally {
            setLoadingGrades(false); // Fin du chargement
        }
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    const rankings = getRankings();

    return (
        <div className="grades-container">
            <div className="student-list-title">
                <h3>Niveaux d'éducation</h3>
            </div>
            <div className="education-level-cards">
                {educationLevels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                        Aucun niveau d'éducation disponible.
                    </div>
                ) : (
                    educationLevels.map((level) => (
                        <div
                            key={level.id}
                            className={`education-card ${selectedEducationLevel === level.id ? 'selected' : ''}`}
                            onClick={() => handleEducationLevelClick(level.id)}
                        >
                            <h4>{level.name}</h4>
                        </div>
                    ))
                )}
            </div>


            {selectedEducationLevel && (
                <div className="subject-cards">
                    <div className='whitetext'>Scolara</div>
                    <div className="student-list-title">
                        <h3>Matières</h3>
                    </div>
                    {loadingSubjects ? (
                        <div className="subjects-loading-container">
                            <PuffLoader size={60} color="#ffcc00" loading={loadingSubjects} />
                        </div>
                    ) : subjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                            Aucune matière disponible pour ce niveau d'éducation.
                        </div>
                    ) : (
                        <div className="education-level-cards">
                            {subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className={`education-card ${selectedSubject === subject.id ? 'selected' : ''}`}
                                    onClick={() => handleSubjectClick(subject.id)}
                                >
                                    <h4>{subject.name}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {loadingGrades ? (
                <div className="grades-loading-container">
                    <PuffLoader size={60} color="#ffcc00" loading={loadingGrades} />
                </div>
            ) : (
                selectedSubject && grades.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                        Aucune note disponible pour cette matière.
                    </p>
                ) : (
                    grades.length > 0 && controls.length > 0 && (
                        <div className="grades-table">
                            <div className='whitetext'>Scolara</div>
                            <div className="student-list-title">
                                <h3>Notes des étudiants</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Classement</th>
                                        <th>Nom de l'étudiant</th>
                                        {controls.map((control) => (
                                            <th key={control.id}>{getControlType(control.id)}</th>
                                        ))}
                                        <th>Note Totale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.rank}</td>
                                            <td>{student.name}</td>
                                            {controls.map((control) => {
                                                const grade = grades.find(
                                                    (g) => g.student === student.id && g.control === control.id
                                                );
                                                return <td key={control.id}>{grade ? grade.score : '-'}</td>;
                                            })}
                                            <td>{student.totalGrade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )
            )}

        </div>
    );
};

export default Grades;
