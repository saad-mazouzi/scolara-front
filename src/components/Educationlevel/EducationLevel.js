import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { 
    fetchEducationLevels, 
    createEducationLevel, 
    updateEducationLevel, 
    deleteEducationLevel 
} from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import './EducationLevel.css';
import { PuffLoader } from 'react-spinners';

const EducationLevel = () => {
    const [loading, setLoading] = useState(true);
    const [cookies] = useCookies(['SchoolId']); 
    const [levels, setLevels] = useState([]);
    const [filteredLevels, setFilteredLevels] = useState([]);
    const [newLevel, setNewLevel] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editLevelId, setEditLevelId] = useState('');
    const [editLevelName, setEditLevelName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();

    useEffect(() => {
        const getLevels = async () => {
            try {
                const schoolId = cookies.SchoolId;
                const data = await fetchEducationLevels(schoolId);
                setLevels(data);
                setFilteredLevels(data);
            } catch (error) {
                console.error('Error fetching education levels:', error);
            } finally {
                setLoading(false);
            }
        };
        getLevels();
    }, [cookies.SchoolId]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        const filtered = levels.filter(level =>
            level.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredLevels(filtered);
        setCurrentPage(1);
    };

    const handleCreate = async () => {
        const schoolId = cookies.SchoolId;
        const created = await createEducationLevel({ name: newLevel, school: schoolId });
        setLevels([...levels, created]);
        setFilteredLevels([...filteredLevels, created]);
        setNewLevel('');
    };

    const handleUpdate = (id, name) => {
        setEditLevelId(id);
        setEditLevelName(name);
        setIsModalOpen(true);
    };

    const handleModalUpdate = async () => {
        const updated = await updateEducationLevel(editLevelId, { name: editLevelName, school: cookies.SchoolId });
        setLevels(levels.map(level => (level.id === editLevelId ? updated : level)));
        setFilteredLevels(filteredLevels.map(level => (level.id === editLevelId ? updated : level)));
        setIsModalOpen(false);
        setEditLevelId('');
        setEditLevelName('');
    };

    const handleDelete = async (id) => {
        await deleteEducationLevel(id);
        setLevels(levels.filter(level => level.id !== id));
        setFilteredLevels(filteredLevels.filter(level => level.id !== id));
    };

    const handleNavigate = (id) => {
        navigate(`/education-level-students/${id}`);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLevels.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    return (
        <div className="education-level-container">
            <div className="student-list-title">
                <h3>Niveaux d'Éducation</h3>
            </div>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher un niveau..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>
            <ul className="education-level-list">
                {currentItems.map(level => (
                    <li 
                        className="education-level-item" 
                        key={level.id} 
                        onClick={() => handleNavigate(level.id)} 
                        style={{ cursor: 'pointer' }}
                    >
                        {level.name}
                        <div>
                            <button 
                                className="education-level-button" 
                                onClick={(e) => { e.stopPropagation(); handleUpdate(level.id, level.name); }}
                            >
                                Modifier
                            </button>
                            <button 
                                className="education-level-button education-level-button-delete" 
                                onClick={(e) => { e.stopPropagation(); handleDelete(level.id); }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div>
                <input 
                    className="education-level-input"
                    type="text" 
                    value={newLevel} 
                    onChange={(e) => setNewLevel(e.target.value)} 
                    placeholder="Nouveau niveau" 
                />
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
                        <h3>Modifier le Niveau d'Éducation</h3>
                        <div>
                            <input 
                                type="text" 
                                value={editLevelName} 
                                onChange={(e) => setEditLevelName(e.target.value)} 
                                placeholder="Nouveau nom" 
                            />
                        </div>
                        <div>
                            <button className="modal-update-button" onClick={handleModalUpdate}>Mettre à jour</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EducationLevel;
