import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { getTransports, createTransport, fetchStudentsBySchool, fetchDriversBySchool,updateTransport, deleteTransport,deleteTransportLocation,deleteLocation } from '../../APIServices';
import './Transports.css';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';



const Transport = () => {
    const [transports, setTransports] = useState([]);
    const [students, setStudents] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [stations, setStations] = useState([]);
    const [editingTransportId, setEditingTransportId] = useState(null); // ID du transport en cours de modification
    const [newTransportData, setNewTransportData] = useState({
        name: '',
        registration: '',
        driver: '',
        students: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // État pour la barre de recherche
    const navigate = useNavigate();

    const handleRowClick = (transportId) => {
        navigate(`/transport/${transportId}`); // Redirige vers la page des détails avec l'ID du transport
    };


    
    useEffect(() => {
        const fetchData = async () => {
            const schoolId = Cookies.get('SchoolId');

            if (!schoolId) {
                setError("Aucun ID d'école trouvé dans les cookies.");
                setLoading(false);
                return;
            }

            try {
                const transportsData = await getTransports(schoolId);
                setTransports(transportsData);

                const studentsData = await fetchStudentsBySchool(schoolId);
                const filteredStudents = studentsData.filter(student => student.transportation_service); // Filtrer les étudiants
                setStudents(filteredStudents);

                const driversData = await fetchDriversBySchool(schoolId);
                setDrivers(driversData);
            } catch (err) {
                console.error(err);
                setError("Une erreur est survenue lors de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransportData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleStudentCheckboxChange = (studentId) => {
        setNewTransportData((prevData) => {
            const updatedStudents = prevData.students.includes(studentId)
                ? prevData.students.filter((id) => id !== studentId)
                : [...prevData.students, studentId];
            
            return { ...prevData, students: updatedStudents };
        });
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // Met à jour l'état de la recherche
    };

    const handleAddTransport = async (e) => {
        e.preventDefault();
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
            setError('ID de l\'école introuvable dans les cookies.');
            return;
        }

        try {
            const transportData = {
                ...newTransportData,
                school: schoolId,
                stations: stations.map((station, index) => ({
                    address: station.address || '',
                    latitude: station.latitude,
                    longitude: station.longitude,
                    order: index + 1
                }))
            };

            await createTransport(transportData);
            const updatedTransports = await getTransports(schoolId);
            setTransports(updatedTransports);
            setNewTransportData({
                name: '',
                registration: '',
                driver: '',
                students: []
            });
            setStations([]);
        } catch (error) {
            console.error('Erreur lors de la création du transport:', error);
        }
    };

    const getDriverName = (driverId) => {
        const driver = drivers.find((d) => d.id === driverId);
        return driver ? `${driver.first_name} ${driver.last_name}` : 'Nom inconnu';
    };

    const getDriverPhone = (driverId) => {
        const driver = drivers.find((d) => d.id === driverId);
        return driver ? driver.phone_number : 'Téléphone inconnu';
    };

    const getStudentNames = (studentIds) => {
        return studentIds.map((studentId) => {
            const student = students.find((s) => s.id === studentId);
            return student ? `${student.first_name} ${student.last_name}` : 'Nom inconnu';
        }).join(', ');
    };

    // Fonction pour obtenir l'adresse via l'API Nominatim
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat,
                    lon: lng,
                    format: 'json'
                }
            });
            return response.data.display_name || '';
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'adresse:', error);
            return '';
        }
    };

    const handleEditTransport = (transportId) => {
        const transportToEdit = transports.find((t) => t.id === transportId);
        setNewTransportData({
            name: transportToEdit.name,
            registration: transportToEdit.registration,
            driver: transportToEdit.driver,
            students: transportToEdit.students,
        });
        setEditingTransportId(transportId); // Définit l'ID du transport à modifier
    };

    const handleUpdateTransport = async () => {
        try {
            const schoolId = Cookies.get('SchoolId');
            const updatedTransportData = {
                ...newTransportData,
                school: schoolId, // Ajoute schoolId aux données du transport
            };
    
            // Met à jour le transport
            await updateTransport(editingTransportId, updatedTransportData);
    
            // Rafraîchit la liste des transports
            const updatedTransports = await getTransports(schoolId);
            setTransports(updatedTransports);
            
            // Réinitialise le mode d'édition
            setEditingTransportId(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du transport:', error);
        }
    };
    
    const handleDeleteTransport = async (transportId) => {
        try {
            const transport = transports.find((t) => t.id === transportId);
    
            if (transport && transport.stations) {
                // Supprimer les locations
                await Promise.all(transport.stations.map(async (station) => {
                    await deleteLocation(station.id);
                }));
    
                // Supprimer les relations `transport-location`
                await Promise.all(transport.stations.map(async (station) => {
                    await deleteTransportLocation(station.id);
                }));
            }
    
            // Supprimer le transport après suppression des dépendances
            await deleteTransport(transportId);
            setTransports((prevTransports) => prevTransports.filter((t) => t.id !== transportId));
    
            console.log("Transport et toutes les locations associées supprimés avec succès.");
    
        } catch (error) {
            console.error('Erreur lors de la suppression du transport et de ses dépendances :', error);
        }
    };
    
    

    const filteredTransports = transports.filter(transport => {
        const driver = drivers.find(d => d.id === transport.driver);
        const driverName = driver ? `${driver.first_name} ${driver.last_name}`.toLowerCase() : '';
        return driverName.includes(searchTerm.toLowerCase()); // Filtrer les transports en fonction du terme de recherche
    });

    const addStation = async (lat, lng) => {
        const address = await fetchAddress(lat, lng); // Récupère l'adresse
        setStations((prevStations) => [
            ...prevStations,
            { latitude: lat, longitude: lng, address }
        ]);
    };

    function MapClickHandler() {
        useMapEvents({
            click(e) {
                addStation(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    }

    const customIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/5811/5811962.png',
        iconSize: [45, 41],
        iconAnchor: [12, 41]
    });

    if (loading) {
        return <p>Chargement...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="transport-container">
            <h3 className="student-list-title">Liste des Transports</h3>

            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher par nom de chauffeur..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>

            <table>
            <thead>
                <tr>
                    <th>Transport</th>
                    <th>Immatriculation</th>
                    <th>Chauffeur</th>
                    <th>Téléphone du Chauffeur</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody className='Transportation-tr'>
                    {filteredTransports.map((transport) => (
                        <tr key={transport.id} onClick={() => handleRowClick(transport.id)}>
                            <td>{transport.name}</td>
                            <td>{transport.registration}</td>
                            <td>{getDriverName(transport.driver)}</td>
                            <td>{getDriverPhone(transport.driver)}</td>
                            <td>
                                <div className='action-buttons'>
                                    {/* <button className='edit-student-button' onClick={(e) => { e.stopPropagation(); handleEditTransport(transport.id); }}>
                                        Modifier
                                    </button> */}
                                    <button className="student-button-delete" onClick={(e) => { e.stopPropagation(); handleDeleteTransport(transport.id); }}>
                                        Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
        </table>

        {editingTransportId && (
                <div>
                    <h3>Modifier le Transport</h3>
                    <button onClick={handleUpdateTransport}>Enregistrer les modifications</button>
                </div>
            )}

        <div className='whitetext'>Scolara</div>
        <h3 className="student-list-title">Ajouter un Nouveau Transport</h3>

        <form onSubmit={handleAddTransport} className="transport-form">
        <div className="transport-row">
            <input
                type="text"
                name="name"
                placeholder="Nom"
                value={newTransportData.name}
                onChange={handleInputChange}
                required
                className="transport-input"
            />
            <input
                type="text"
                name="registration"
                placeholder="Immatriculation"
                value={newTransportData.registration}
                onChange={handleInputChange}
                required
                className="transport-input"
            />
            <select
                name="driver"
                value={newTransportData.driver}
                onChange={handleInputChange}
                required
                className="transport-select"
            >
                <option value="">Sélectionnez un chauffeur</option>
                {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                    </option>
                ))}
            </select>
        </div>
        <div className="transport-student-checkboxes">
            <label>Étudiants :</label>
            <div className="transport-student-grid">
                {students.map((student) => (
                    <label key={student.id} className="transport-student-label">
                        <input
                            type="checkbox"
                            checked={newTransportData.students.includes(student.id)}
                            onChange={() => handleStudentCheckboxChange(student.id)}
                        />
                        {student.first_name} {student.last_name}
                    </label>
                ))}
            </div>
        </div>


            <h3 className="transport-stations-title">Sélectionnez les stations</h3>
            <MapContainer
                center={[34.020882, -6.841650]}
                zoom={13}
                className="transport-map-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                {stations.map((station, index) => (
                    <Marker
                        key={index}
                        position={[station.latitude, station.longitude]}
                        icon={customIcon}
                    />
                ))}
            </MapContainer>

            {stations.map((station, index) => (
                <div key={index} className="transport-station-info">
                    <label>Adresse de la station {index + 1}:</label>
                    <input
                        type="text"
                        value={station.address}
                        readOnly
                        className="transport-station-address"
                    />
                </div>
            ))}

            <button type="submit" className="create-student-button"><i className="fas fa-plus"></i>Ajouter</button>
        </form>
    </div>
);
};

export default Transport;
