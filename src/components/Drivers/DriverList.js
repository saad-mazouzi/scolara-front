import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchDriversBySchool, createDriver, updateDriver, deleteDriver } from '../../APIServices';
import { faSearch, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import './Driver.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { PuffLoader , MoonLoader} from 'react-spinners';

const DriverList = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
    const itemsPerPage = 4; // Nombre d'étudiants par page
    const [error, setError] = useState(null);
    const [newDriverData, setNewDriverData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        password: ''
    });
    const [editDriverData, setEditDriverData] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getDrivers = async () => {
            try {
                const schoolId = Cookies.get('SchoolId');
                if (!schoolId) {
                    throw new Error("Aucun ID d'école trouvé dans les cookies.");
                }

                const driversData = await fetchDriversBySchool(schoolId);
                setDrivers(driversData);
            } catch (err) {
                console.error(err);
                setError("Une erreur est survenue lors de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };

        getDrivers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDriverData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Fonction pour générer un e-mail basé sur le prénom et le nom
    const handleGenerateEmail = () => {
        const email = `${newDriverData.first_name.toLowerCase()}.${newDriverData.last_name.toLowerCase()}@scolara.com`;
        setNewDriverData((prevData) => ({
            ...prevData,
            email
        }));
    };

    // Fonction pour générer un mot de passe aléatoire
    const generatePassword = (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleGeneratePassword = () => {
        const password = generatePassword();
        setNewDriverData((prevData) => ({
            ...prevData,
            password
        }));
    };

    const handleDeleteClick = async (driverId,e) => {
        e.stopPropagation(); // Empêche la propagation de l'événement
        setLoadingForm(true);
        try {
            await deleteDriver(driverId);
            const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
            setDrivers(updatedDrivers);
        } catch (error) {
            console.error('Erreur lors de la suppression du chauffeur:', error);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDrivers = drivers.filter(driver => {
        const fullName = `${driver.first_name} ${driver.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const paginatedDrivers = filteredDrivers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
    
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    
    const handleEditClick = (driver,e) => {
        e.stopPropagation(); // Empêche la propagation de l'événement
        setEditDriverData(driver);
        setNewDriverData({
            first_name: driver.first_name,
            last_name: driver.last_name,
            phone_number: driver.phone_number,
        });
        setShowForm(true);
    };

    // Fonction pour exporter en CSV
    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + drivers.map(driver => 
                `${driver.first_name},${driver.last_name},${driver.phone_number}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "drivers.csv");
        document.body.appendChild(link);
        link.click();
    };

    
    const getPaymentStatus = (paid) => {
        return (
        <button
            className={`payment-status-button ${paid ? 'paid' : 'unpaid'}`}
            disabled
        >
            {paid ? 'Payé' : 'Non payé'}
        </button>
        );
    };

    // Fonction pour exporter en Excel
    const downloadXLSX = () => {
        const worksheet = XLSX.utils.json_to_sheet(drivers.map(driver => ({
            'Prénom': driver.first_name,
            'Nom': driver.last_name,
            'Téléphone': driver.phone_number
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Chauffeurs');
        XLSX.writeFile(workbook, 'drivers.xlsx');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    const handleRowClick = (teacherId) => {
        navigate(`/driver/${teacherId}`);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingForm(true);
        try {
            const schoolId = Cookies.get('SchoolId');
            if (!schoolId) {
                throw new Error("ID de l'école introuvable dans les cookies.");
            }
    
            // Création de l'objet FormData pour les données du chauffeur
            const driverData = new FormData();
            driverData.append('first_name', newDriverData.first_name);
            driverData.append('last_name', newDriverData.last_name);
            driverData.append('phone_number', newDriverData.phone_number);
            driverData.append('email', newDriverData.email);
            driverData.append('school', schoolId); // Ajouter l'ID de l'école
            if (newDriverData.password) {
                driverData.append('password', newDriverData.password); // Ajouter le mot de passe généré
            }
    
            // Débogage : afficher les données envoyées
            console.log('Données envoyées :', Object.fromEntries(driverData.entries()));
    
            // Création ou modification du chauffeur
            if (editDriverData) {
                await updateDriver(editDriverData.id, driverData);
                console.log('Chauffeur modifié avec succès');
            } else {
                await createDriver(driverData);
                console.log('Chauffeur créé avec succès');
            }
    
            // Mise à jour de la liste des chauffeurs après modification ou création
            const updatedDrivers = await fetchDriversBySchool(schoolId);
            setDrivers(updatedDrivers);
    
            // Réinitialiser les champs du formulaire et fermer le formulaire
            setShowForm(false);
            setNewDriverData({
                first_name: '',
                last_name: '',
                phone_number: '',
                email: '',
                password: '',
            });
            setEditDriverData(null);
        } catch (error) {
            console.error("Erreur lors de la création ou de la modification du chauffeur :", error);
        } finally {
            setLoadingForm(false);
        }
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <button onClick={downloadCSV} className="csv-download-button">Exporter CSV</button>
            <button onClick={downloadXLSX} className="xlsx-download-button">Exporter XLSX</button>
            <div className="student-list-title">
                <h3>Table des Chauffeurs</h3>
            </div>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher un chauffeur..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Téléphone</th>
                        <th>Statut de paiement</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDrivers.map((driver) => (
                        <tr key={driver.id} onClick={() => handleRowClick(driver.id)} style={{ cursor: 'pointer' }}>
                            <td>{driver.first_name}</td>
                            <td>{driver.last_name}</td>
                            <td>{driver.phone_number}</td>
                            <td>{getPaymentStatus(driver.paid)}</td> {/* Statut de paiement */}
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        onClick={(e) => handleEditClick(driver, e)} 
                                        className="edit-student-button"
                                    >
                                        Modifier
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteClick(driver.id, e)} 
                                        className="student-button-delete"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
        
            {showForm ? (
                <button className="cancel-student-button" onClick={() => setShowForm(false)}>
                    <i className="fas fa-times"></i> Annuler
                </button>
            ) : (
                <button className="create-student-button" onClick={() => setShowForm(true)}>
                    <i className="fas fa-plus"></i> Ajouter un Nouveau Chauffeur
                </button>
            )}

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Prénom"
                        value={newDriverData.first_name}
                        onChange={handleInputChange}
                        required
                        className="driver-input-firstname"
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Nom"
                        value={newDriverData.last_name}
                        onChange={handleInputChange}
                        required
                        className="driver-input-lastname"
                    />
                    <input
                        type="text"
                        name="phone_number"
                        placeholder="Téléphone"
                        value={newDriverData.phone_number}
                        onChange={handleInputChange}
                        required
                        className="driver-input-phone"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newDriverData.email}
                        onChange={handleInputChange}
                        className="driver-input-firstname"
                        required
                    />
                    <button type="button" onClick={handleGenerateEmail} className="generate-password-button">
                        <FontAwesomeIcon icon={faRobot} className="icon" />
                        Générer un e-mail
                    </button>
                    
                    <input
                        type="text"
                        name="password"
                        placeholder="Mot de passe généré"
                        value={newDriverData.password}
                        readOnly
                        className="driver-input-firstname"
                    />
                    <button type="button" onClick={handleGeneratePassword} className="generate-password-button">
                        <FontAwesomeIcon icon={faRobot} className="icon" />
                        Générer un mot de passe
                    </button>
                    <button type="submit" className="create-student-button" disabled={loadingForm}>
                        {loadingForm ? (
                                <div className="overlay-loader">
                                    <div className="CRUD-loading-container">
                                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                                    </div>
                                </div>
                        ) : (
                            editDriverData ? 'Modifier le Chauffeur' : 'Créer le Chauffeur'
                        )}
                    </button>

                </form>
            )}
             {loadingForm && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}

            <div className='whitetext'>Scolara</div>
        </div>
    );
};

export default DriverList;
