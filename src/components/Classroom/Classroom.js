import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { 
    fetchClassrooms, 
    createClassrooms, 
    updateClassrooms, 
    deleteClassrooms 
} from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { PuffLoader, MoonLoader } from 'react-spinners';


const Classroom = () => {
    const [cookies] = useCookies(['SchoolId']);
    const [levels, setLevels] = useState([]);
    const [loading,setLoading] = useState(true);
    const [filteredLevels, setFilteredLevels] = useState([]);
    const [newLevel, setNewLevel] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editLevelId, setEditLevelId] = useState('');
    const [loadingCreate, setLoadingCreate] = useState(false);  
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [editLevelName, setEditLevelName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle
    const itemsPerPage = 4; // Nombre d'éléments par page

    const schoolId = cookies.SchoolId;

    useEffect(() => {
        if (schoolId) {
            const getClassrooms = async () => {
                try {
                    const data = await fetchClassrooms(schoolId);
                    setLevels(data);
                    setFilteredLevels(data);
                } catch (error) {
                    console.error("Erreur lors du chargement des salles : ", error);
                } finally {
                    setLoading(false);
                }
            };
            getClassrooms();
        } else {
            console.warn("ID de l'école introuvable dans les cookies.");
        }
    }, [schoolId]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        const filtered = levels.filter(level =>
            level.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredLevels(filtered);
        setCurrentPage(1); // Réinitialiser à la première page après recherche
    };

    const handleCreate = async () => {
        if (!newLevel.trim()) return;
        setLoadingCreate(true);
        try {
            const created = await createClassrooms({ name: newLevel, school: schoolId });
            setLevels([...levels, created]);
            setFilteredLevels([...filteredLevels, created]);
            setNewLevel('');
        } catch (error) {
            console.error("Erreur lors de la création de la salle : ", error);
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleUpdate = (id, name) => {
        setEditLevelId(id);
        setEditLevelName(name);
        setIsModalOpen(true);
    };

    const handleModalUpdate = async () => {
        setLoadingUpdate(true);
        try {
            const updated = await updateClassrooms(editLevelId, { 
                name: editLevelName, 
                school: schoolId 
            });
            setLevels(levels.map(level => (level.id === editLevelId ? updated : level)));
            setFilteredLevels(filteredLevels.map(level => (level.id === editLevelId ? updated : level)));
            setIsModalOpen(false);
            setEditLevelId('');
            setEditLevelName('');
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la salle : ", error);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleDelete = async (id) => {
        setLoadingDelete(true);
        try {
            await deleteClassrooms(id);
            setLevels(levels.filter(level => level.id !== id));
            setFilteredLevels(filteredLevels.filter(level => level.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression de la salle : ", error);
        } finally {
            setLoadingDelete(false);    
        }
    };

    // Pagination
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
                <h3>Salles de l'école</h3>
            </div>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher une salle..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>
            <ul className="education-level-list">
                {currentItems.map(level => (
                    <li className="education-level-item" key={level.id}>
                        {level.name}
                        <div>
                            <button 
                                className="education-level-button" 
                                onClick={() => handleUpdate(level.id, level.name)}
                            >
                                Modifier
                            </button>
                            <button 
                                className="education-level-button education-level-button-delete" 
                                onClick={() => handleDelete(level.id)}
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
                    placeholder="Nouvelle salle" 
                />
                <button 
                    className="education-level-add-button" 
                    onClick={handleCreate}
                >
                    Ajouter
                </button>
            </div>
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

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Modifier la Salle</h2>
                        <input 
                            type="text" 
                            value={editLevelName} 
                            onChange={(e) => setEditLevelName(e.target.value)} 
                            placeholder="Nouveau nom" 
                        />
                        <button className="modal-update-button" onClick={handleModalUpdate}>
                            Mettre à jour
                        </button>
                    </div>
                </div>
            )}
            {loadingCreate && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingCreate} />
                    </div>
                </div>
            )}

            {loadingUpdate && (
            <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingUpdate} />
                    </div>
                </div>
            )}

            {loadingDelete && (
            <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingDelete} />
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Classroom;
