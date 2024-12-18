import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { fetchStudentsByEducationLevel, fetchControls, fetchGrades, createControl, deleteControl,updateGrade, createGrade } from '../../APIServices'; // Assurez-vous que fetchGrades est correctement configuré
import './StudentTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import XLSX


const StudentsTable = () => {
    const [cookies] = useCookies(['TeacherEducationLevel', 'SchoolId', 'TeacherSubject']);
    const [students, setStudents] = useState([]);
    const [controls, setControls] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // Liste filtrée des étudiants
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche


    const teacherEducationLevel = cookies.TeacherEducationLevel; // Niveau d'éducation de l'enseignant
    const schoolId = cookies.SchoolId; // ID de l'école
    const subjectId = cookies.TeacherSubject; // ID de la matière enseignée
    const teacherId = cookies.TeacherId;
    const [modifiedGrades, setModifiedGrades] = useState({}); // État pour les notes modifiées


    const navigate = useNavigate(); // Pour la navigation

    const [newControl, setNewControl] = useState({
        control_type: '',
        coefficient: '',
        control_number: '',
    });

    const downloadCSV = () => {
        const csvContent =
            "data:text/csv;charset=utf-8," +
            filteredStudents.map((student) => {
                const gradesRow = controls.map((control) => {
                    const grade = grades.find(
                        (g) => g.student === student.id && g.control === control.id
                    );
                    return grade ? grade.score : '';
                });

                return `${student.last_name},${student.first_name},${gradesRow.join(
                    ','
                )},${calculateFinalGrade(student.id)}`;
            }).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_grades.csv");
        document.body.appendChild(link);
        link.click();
    };

    const downloadXLSX = () => {
        const data = filteredStudents.map((student) => {
            const gradesRow = controls.reduce((acc, control) => {
                const grade = grades.find(
                    (g) => g.student === student.id && g.control === control.id
                );
                acc[control.control_type] = grade ? grade.score : '';
                return acc;
            }, {});

            return {
                Nom: student.last_name,
                Prénom: student.first_name,
                ...gradesRow,
                'Note complète': calculateFinalGrade(student.id),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes des étudiants');
        XLSX.writeFile(workbook, 'students_grades.xlsx');
    };
    
    useEffect(() => {
        console.log("TeacherEducationLevel:", teacherEducationLevel);
        console.log("SchoolId:", schoolId);
        console.log("TeacherSubject:", subjectId);
        console.log("TeacherId:", teacherId);

        if (!teacherEducationLevel || !schoolId || !subjectId || !teacherId) {
            setError("Données manquantes dans les cookies.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer les étudiants
                const studentsData = await fetchStudentsByEducationLevel(schoolId, teacherEducationLevel);
                setStudents(studentsData);
                setFilteredStudents(studentsData);

                // Récupérer les contrôles
                const controlsData = await fetchControls(schoolId, teacherId, teacherEducationLevel, subjectId);
                setControls(controlsData);

                // Récupérer les notes
                const gradesData = await fetchGrades(teacherEducationLevel, subjectId);
                setGrades(gradesData);

                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données :", err);
                setError("Erreur lors du chargement des données.");
                setLoading(false);
            }
        };

        fetchData();
    }, [teacherEducationLevel, schoolId, subjectId, teacherId]);

    const handleGradeChange = (studentId, controlId, value) => {
        setModifiedGrades((prev) => ({
            ...prev,
            [`${studentId}-${controlId}`]: value,
        }));
    };

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = students.filter((student) =>
            `${student.first_name} ${student.last_name}`.toLowerCase().includes(term)
        );
        setFilteredStudents(filtered);
    };

    const handleSaveGrades = async () => {
        try {
            for (const [key, score] of Object.entries(modifiedGrades)) {
                const [studentId, controlId] = key.split('-');
    
                const existingGrade = grades.find(
                    (g) => g.student === parseInt(studentId) && g.control === parseInt(controlId)
                );
    
                const gradeData = {
                    student: parseInt(studentId),
                    subject: subjectId,
                    control: parseInt(controlId),
                    score: parseFloat(score),
                    education_level: teacherEducationLevel,
                };
    
                if (existingGrade) {
                    // Mettre à jour la note existante
                    await updateGrade(existingGrade.id, gradeData);
                } else {
                    // Créer une nouvelle note si elle n'existe pas
                    await createGrade(gradeData);
                }
            }
    
            setModifiedGrades({});
            const updatedGrades = await fetchGrades(teacherEducationLevel, subjectId);
            setGrades(updatedGrades);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des notes :", error);
        }
    };
    
    const handleControlSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newControl.control_type || !newControl.coefficient || !newControl.control_number) {
                return;
            }

            const controlData = {
                control_type: newControl.control_type,
                coefficient: parseFloat(newControl.coefficient),
                control_number: parseInt(newControl.control_number, 10),
                education_level: teacherEducationLevel,
                school: schoolId,
                teacher: teacherId,
                subject: subjectId,
            };

            const createdControl = await createControl(controlData);
            setControls((prevControls) => [...prevControls, createdControl]);
            setNewControl({ control_type: '', coefficient: '', control_number: '' });
        } catch (err) {
            console.error("Erreur lors de l'ajout du contrôle :", err);
        }
    };

    const handleDeleteControl = async (id) => {
        try {
            await deleteControl(id);
            setControls((prevControls) => prevControls.filter((control) => control.id !== id)); // Mettre à jour la liste locale
        } catch (err) {
            console.error(`Erreur lors de la suppression du contrôle ID ${id} :`, err);
        }
    };

    const calculateFinalGrade = (studentId) => {
        let totalGrade = 0; // Cumul des scores pondérés
        let totalCoefficient = 0; // Cumul des coefficients
    
        grades
            .filter((grade) => grade.student === studentId) // Vérifiez bien la clé `student`
            .forEach((grade) => {
                // Trouver le contrôle correspondant
                const control = controls.find((c) => c.id === grade.control);
                if (control) {
                    totalGrade += grade.score * parseFloat(control.coefficient); // Score pondéré
                    totalCoefficient += parseFloat(control.coefficient); // Coefficient
                }
            });
    
        // Calculer la moyenne pondérée
        return totalCoefficient ? (totalGrade / totalCoefficient).toFixed(2) : 'N/A';
    };
    
    
    const handleRowClick = (studentId) => {
        navigate(`/student-grade/${studentId}`);
    };

    if (loading) {
        return <div>Chargement des données...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        
        <div className="students-table-container">
            <button onClick={downloadCSV} className="csv-download-button">Exporter CSV</button>
            <button onClick={downloadXLSX} className="xlsx-download-button">Exporter XLSX</button>
            <div className="grades-section">
                <div className='student-list-title'>
                    <h3>Notes des étudiants</h3>
                </div>
                <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />  
                </div>
                <table className="grades-table">
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
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.last_name}</td>
                                <td>{student.first_name}</td>
                                {controls.map((control) => {
                                    const grade = grades.find(
                                        (g) => g.student === student.id && g.control === control.id
                                    );
                                    return (
                                        <td key={control.id}>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={
                                                    modifiedGrades[`${student.id}-${control.id}`] ??
                                                    (grade ? grade.score : '')
                                                }
                                                onChange={(e) =>
                                                    handleGradeChange(student.id, control.id, e.target.value)
                                                }
                                                className="grade-input"
                                            />
                                        </td>
                                    );
                                })}
                                <td>{calculateFinalGrade(student.id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='whitetext'>Scolara</div>
                <button className="create-student-student-button" onClick={handleSaveGrades}>
                    Enregistrer les notes
                </button>
            </div>
            <div className='whitetext'>Scolara</div>
            <div className="controls-section">
                <div className='student-list-title'><h3>Liste des contrôles</h3></div>
                {controls.length > 0 ? (
                    <table className="controls-table">
                        <thead>
                            <tr>
                                <th>Type de contrôle</th>
                                <th>Coefficient</th>
                                <th>Numéro de contrôle</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {controls.map((control) => (
                                <tr key={control.id}>
                                    <td>{control.control_type}</td>
                                    <td>{control.coefficient}</td>
                                    <td>{control.control_number}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteControl(control.id)}
                                            className="control-button-delete"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>Aucun contrôle trouvé.</div>
                )}

                <form onSubmit={handleControlSubmit} className="control-form">
                    <h4>Ajouter un nouveau contrôle :</h4>
                    <input
                        type="text"
                        placeholder="Type de contrôle (DS, Quiz...)"
                        value={newControl.control_type}
                        onChange={(e) => setNewControl({ ...newControl, control_type: e.target.value })}
                        className='student-input-firstname'
                    />
                    <input
                        type="number"
                        placeholder="Coefficient"
                        step="0.1"
                        value={newControl.coefficient}
                        onChange={(e) => setNewControl({ ...newControl, coefficient: e.target.value })}
                        className='student-input-firstname'
                    />
                    <input
                        type="number"
                        placeholder="Numéro du contrôle"
                        value={newControl.control_number}
                        onChange={(e) => setNewControl({ ...newControl, control_number: e.target.value })}
                        className='student-input-firstname'
                    />
                    <button type="submit" className='create-student-student-button'>Ajouter le contrôle</button>
                </form>
                <div className='whitetext'> Scolara</div>
            </div>
        </div>
    );
};

export default StudentsTable;
