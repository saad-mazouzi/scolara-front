import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { fetchAdminCourses, fetchTeachers, fetchSubjects, fetchEducationLevels } from '../../APIServices';
import { faSearch, faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PuffLoader } from 'react-spinners';

const Course = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
    const itemsPerPage = 4; // 4 lignes avec 3 colonnes = 12 items par page

    const schoolId = Cookies.get('SchoolId');  
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const coursesData = await fetchAdminCourses(schoolId);
                const teachersData = await fetchTeachers();
                const subjectsData = await fetchSubjects(schoolId);
                const educationLevelsData = await fetchEducationLevels(schoolId);

                setCourses(coursesData);
                setTeachers(teachersData);
                setSubjects(subjectsData);
                setEducationLevels(educationLevelsData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        
        if (schoolId) {
            fetchData();
        }
    }, [schoolId]);

    const getEducationLevelName = (educationLevelId) => {
        const level = educationLevels.find(level => level.id === educationLevelId);
        return level ? level.name : "No Education Level";
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(subject => subject.id === subjectId);
        return subject ? subject.name : "No Subject";
    };

    const getTeacherName = (teacherId) => {
        const teacher = teachers.find(teacher => teacher.id === teacherId);
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : "No Teacher";
    };

    const filteredCourses = courses.filter((course) => {
        const subjectName = getSubjectName(course.subject).toLowerCase();
        return subjectName.includes(searchTerm.toLowerCase());
    });

    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRowClick = (courseId) => {
        navigate(`/courses/${courseId}/files`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) return <p>Error loading courses: {error.message}</p>;

    return (
        <div>
            <div className="student-list-title">
                <h3>Cours</h3>
            </div>

            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher par matière..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Cours</th>
                        <th>Enseignants</th>
                        <th>Niveaux d'éducation</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCourses.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                                Aucun cours disponible.
                            </td>
                        </tr>
                    ) : (
                        paginatedCourses.map((course) => (
                            <tr 
                                key={course.id}
                                onClick={() => handleRowClick(course.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{getSubjectName(course.subject)}</td>
                                <td>{getTeacherName(course.teacher)}</td>
                                <td>{getEducationLevelName(course.education_level)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className='whitetext'>Scolara</div>
            <div className="pagination-controls-student">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active-page' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                </button>
            </div>
        </div>
    );
};

export default Course;
