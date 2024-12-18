import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
    fetchCourseFiles,
    uploadCourseFile,
    fetchCourses,
    deleteCourseFile,
    fetchSubjects,
    fetchEducationLevels
} from '../../APIServices';
import './Course.css';

const CourseTeacher = () => {
    const [courseFiles, setCourseFiles] = useState([]);
    const [newFile, setNewFile] = useState(null);
    const [fileType, setFileType] = useState('');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [subjectName, setSubjectName] = useState('');
    const [educationLevelName, setEducationLevelName] = useState('');
    const [error, setError] = useState(null);

    // Données automatiques des cookies
    const teacherId = parseInt(Cookies.get('TeacherId'), 10);
    const schoolId = parseInt(Cookies.get('SchoolId'), 10);
    const teacherEducationLevel = parseInt(Cookies.get('TeacherEducationLevel'), 10);
    const teacherSubject = parseInt(Cookies.get('TeacherSubject'), 10);

    // Debugging logs
    useEffect(() => {
        console.log("TeacherId:", teacherId);
        console.log("SchoolId:", schoolId);
        console.log("TeacherEducationLevel:", teacherEducationLevel);
        console.log("TeacherSubject:", teacherSubject);
    }, [teacherId, schoolId, teacherEducationLevel, teacherSubject]);

    // Obtenir le nom de la matière
    const getSubjectName = async () => {
        try {
            const subjects = await fetchSubjects(schoolId);
            const subject = subjects.find(sub => sub.id === teacherSubject);
            setSubjectName(subject ? subject.name : 'Non spécifiée');
        } catch (error) {
            console.error("Erreur lors de la récupération du nom de la matière :", error);
        }
    };

    // Obtenir le nom du niveau d'éducation
    const getEducationLevelName = async () => {
        try {
            const educationLevels = await fetchEducationLevels(schoolId);
            const level = educationLevels.find(edu => edu.id === teacherEducationLevel);
            setEducationLevelName(level ? level.name : 'Non spécifié');
        } catch (error) {
            console.error("Erreur lors de la récupération du niveau d'éducation :", error);
        }
    };

    // Charger les cours pour cet enseignant
    const fetchTeacherCourse = async () => {
        try {
            if (!teacherEducationLevel || isNaN(teacherEducationLevel)) {
                setError("Niveau d'éducation non valide ou manquant dans les cookies.");
                return;
            }

            const data = await fetchCourses(schoolId, teacherEducationLevel); // Transmettez `teacherEducationLevel` dans la requête
            const teacherCourse = data.find(
                course =>
                    course.teacher === teacherId &&
                    course.education_level === teacherEducationLevel &&
                    course.subject === teacherSubject
            );

            if (teacherCourse) {
                setCurrentCourse(teacherCourse);
                fetchFilesForCourse(teacherCourse.id);
            } else {
                setError("Aucun cours trouvé pour cet enseignant.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du cours de l'enseignant :", error);
        }
    };

    // Charger les fichiers associés à un cours
    const fetchFilesForCourse = async (courseId) => {
        try {
            const files = await fetchCourseFiles(courseId);
            setCourseFiles(files);
        } catch (error) {
            console.error("Erreur lors de la récupération des fichiers du cours :", error);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await deleteCourseFile(fileId);
            setCourseFiles(courseFiles.filter(file => file.id !== fileId)); // Mettre à jour la liste localement
        } catch (error) {
            console.error("Erreur lors de la suppression du fichier :", error);
        }
    };

    // Téléverser un fichier
    const handleUploadFile = async (e) => {
        e.preventDefault();
        try {
            if (!currentCourse) {
                setError("Aucun cours sélectionné.");
                return;
            }

            const formData = new FormData();
            formData.append('file', newFile);
            formData.append('course', currentCourse.id);
            formData.append('file_type', fileType); // Ajout du type de fichier

            await uploadCourseFile(formData);
            fetchFilesForCourse(currentCourse.id); // Rafraîchir les fichiers
            setNewFile(null); // Réinitialiser le champ de fichier
            setFileType(''); // Réinitialiser le champ de type
        } catch (error) {
            console.error("Erreur lors du téléversement du fichier :", error);
        }
    };

    useEffect(() => {
        if (!schoolId || isNaN(schoolId)) {
            setError("L'identifiant de l'école est manquant ou invalide.");
            return;
        }
        getSubjectName();
        getEducationLevelName();
        fetchTeacherCourse();
    }, [schoolId, teacherEducationLevel, teacherSubject]);

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div>
            <div className="course-teacher">
                <div className="student-list-title">
                    <h3>Mes Fichiers de Cours</h3>
                </div>
                {currentCourse ? (
                    <>
                        <h4>
                            Matière : {subjectName} | Niveau : {educationLevelName}
                        </h4>
                        <form onSubmit={handleUploadFile} className="course-teacher-form">
                            <label>
                                Ajouter un fichier :
                                <input
                                    type="file"
                                    onChange={(e) => setNewFile(e.target.files[0])}
                                    required
                                />
                            </label>
                            <label>
                                Type de fichier :
                                <input
                                    type="text"
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                    placeholder="Ex: Cours, TD"
                                    required
                                />
                            </label>
                            <button type="submit">Téléverser</button>
                        </form>
                        <table className="course-teacher-table">
                            <thead>
                                <tr>
                                    <th>Nom du fichier</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseFiles.map((file) => (
                                    <tr key={file.id}>
                                        <td>{file.file.split('/').pop()}</td>
                                        <td>{file.file_type || 'Inconnu'}</td>
                                        <td>{new Date(file.uploaded_at).toLocaleDateString()}</td>
                                        <td>
                                            <a href={file.file} target="_blank" rel="noopener noreferrer">
                                                Télécharger
                                            </a>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="course-teacher-delete-btn"
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="course-teacher-empty-message">
                        Aucun cours trouvé pour cet enseignant.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CourseTeacher;
