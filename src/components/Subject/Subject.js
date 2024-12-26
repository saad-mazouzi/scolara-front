import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { 
    fetchSubjects, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    fetchEducationLevels 
} from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { PuffLoader , PulseLoader } from 'react-spinners';

const Subject = () => {
    const [cookies] = useCookies(['SchoolId']);
    const [subjects, setSubjects] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]);
    const [loading,setLoading] = useState(true);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [newCoefficient, setNewCoefficient] = useState(''); // Coefficient for new subject
    const [selectedEducationLevel, setSelectedEducationLevel] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editSubjectId, setEditSubjectId] = useState('');
    const [editSubjectName, setEditSubjectName] = useState('');
    const [editCoefficient, setEditCoefficient] = useState(''); // Coefficient in edit modal
    const [editEducationLevel, setEditEducationLevel] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const schoolId = cookies.SchoolId;

    useEffect(() => {
        if (schoolId) {
            const getSubjects = async () => {
                try {
                    const data = await fetchSubjects(schoolId);
                    setSubjects(data);
                    setFilteredSubjects(data);
                } catch (error) {
                    console.error("Erreur lors du chargement des sujets : ", error);
                } finally {
                    setLoading(false);
                }
            };
            const getEducationLevels = async () => {
                try {
                    const data = await fetchEducationLevels(schoolId);
                    setEducationLevels(data);
                } catch (error) {
                    console.error("Erreur lors du chargement des niveaux d'éducation : ", error);
                }
            };
            getSubjects();
            getEducationLevels();
        } else {
            console.warn("ID de l'école introuvable dans les cookies.");
        }
    }, [schoolId]);

    const getEducationLevelName = (id) => {
        const level = educationLevels.find(level => level.id === id);
        return level ? level.name : <PulseLoader   color="#4e7dad" size={8} />;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        const filtered = subjects.filter(subject =>
            subject.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredSubjects(filtered);
        setCurrentPage(1);
    };

    const handleCreate = async () => {
        if (!newSubject.trim() || !selectedEducationLevel || !newCoefficient.trim()) return;
        try {
            const created = await addSubject({ 
                name: newSubject, 
                school: schoolId, 
                education_level: selectedEducationLevel,
                coefficient: parseFloat(newCoefficient)
            });
            setSubjects([...subjects, created]);
            setFilteredSubjects([...filteredSubjects, created]);
            setNewSubject('');
            setNewCoefficient('');
            setSelectedEducationLevel('');
        } catch (error) {
            console.error("Erreur lors de la création du sujet : ", error);
        }
    };

    const handleUpdate = (id, name, educationLevelId, coefficient) => {
        setEditSubjectId(id);
        setEditSubjectName(name);
        setEditCoefficient(coefficient);
        setEditEducationLevel(educationLevelId);
        setIsModalOpen(true);
    };

    const handleModalUpdate = async () => {
        try {
            const updated = await updateSubject(editSubjectId, { 
                name: editSubjectName, 
                school: schoolId,
                education_level: editEducationLevel,
                coefficient: parseFloat(editCoefficient)
            });
            setSubjects(subjects.map(subject => (subject.id === editSubjectId ? updated : subject)));
            setFilteredSubjects(filteredSubjects.map(subject => (subject.id === editSubjectId ? updated : subject)));
            setIsModalOpen(false);
            setEditSubjectId('');
            setEditSubjectName('');
            setEditCoefficient('');
            setEditEducationLevel('');
        } catch (error) {
            console.error("Erreur lors de la mise à jour du sujet : ", error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    const handleDelete = async (id) => {
        try {
            await deleteSubject(id);
            setSubjects(subjects.filter(subject => subject.id !== id));
            setFilteredSubjects(filteredSubjects.filter(subject => subject.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression du sujet : ", error);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="education-level-container">
            <div className="student-list-title">
                <h3>Matières de l'école</h3>
            </div>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher un sujet..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>
            <ul className="education-level-list">
                {currentItems.map(subject => (
                    <li className="education-level-item" key={subject.id}>
                        {subject.name} - Niveau: {getEducationLevelName(subject.education_level)} - Coefficient: {subject.coefficient || 'Non spécifié'}
                        <div>
                            <button 
                                className="education-level-button" 
                                onClick={() => handleUpdate(subject.id, subject.name, subject.education_level, subject.coefficient)}
                            >
                                Modifier
                            </button>
                            <button 
                                className="education-level-button education-level-button-delete" 
                                onClick={() => handleDelete(subject.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="add-subject-gaps">
                <input 
                    className="education-level-input"
                    type="text" 
                    value={newSubject} 
                    onChange={(e) => setNewSubject(e.target.value)} 
                    placeholder="Nouveau sujet" 
                />
                <input 
                    className="education-level-input"
                    type="number" 
                    value={newCoefficient} 
                    onChange={(e) => setNewCoefficient(e.target.value)} 
                    placeholder="Coefficient" 
                />
                <select 
                    value={selectedEducationLevel} 
                    onChange={(e) => setSelectedEducationLevel(e.target.value)}
                    className="education-level-select"
                >
                    <option value="">Sélectionner un niveau d'éducation</option>
                    {educationLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                </select>
                <button 
                    className="education-level-add-button" 
                    onClick={handleCreate}
                >
                    Ajouter
                </button>
            </div>

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

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h3>Modifier le Sujet</h3>
                        <input 
                            type="text" 
                            value={editSubjectName} 
                            onChange={(e) => setEditSubjectName(e.target.value)} 
                            placeholder="Nouveau nom" 
                        />
                        <input 
                            type="number" 
                            value={editCoefficient} 
                            onChange={(e) => setEditCoefficient(e.target.value)} 
                            placeholder="Coefficient" 
                        />
                        <select 
                            value={editEducationLevel} 
                            onChange={(e) => setEditEducationLevel(e.target.value)} 
                            className="education-level-select"
                        >
                            <option value="">Sélectionner un niveau d'éducation</option>
                            {educationLevels.map(level => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                        <button className="modal-update-button" onClick={handleModalUpdate}>
                            Mettre à jour
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;
