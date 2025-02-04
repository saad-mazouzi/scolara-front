import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTransports, fetchStudentsBySchool } from '../../APIServices';
import Cookies from 'js-cookie';
import './Transports.css';
import { ScaleLoader } from 'react-spinners';

const TransportDetails = () => {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [transportStudents, setTransportStudents] = useState([]);
    const [stations, setStations] = useState([]);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransportDetails = async () => {
            setLoading(true);
            try {
                const schoolId = Cookies.get('SchoolId');
                const transports = await getTransports(schoolId);
                const studentsData = await fetchStudentsBySchool(schoolId);

                setStudents(studentsData);

                const transport = transports.find((t) => t.id === parseInt(id));

                if (transport) {
                    setTransportStudents(transport.students);
                    setStations(transport.transport_locations);
                } else {
                    setError("Transport introuvable ou sans stations.");
                }
            } catch (err) {
                console.error(err);
                setError("Erreur lors de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransportDetails();
    }, [id]);

    const getStudentProfiles = (studentIds) => {
        return studentIds.map((studentId) => {
            const student = students.find((s) => s.id === studentId);
            return student
                ? {
                      name: `${student.first_name} ${student.last_name}`,
                      profile_picture: student.profile_picture ? `${student.profile_picture}` : '',
                  }
                : { name: 'Nom inconnu', profile_picture: '' };
        });
    };

    const loadMoreStudents = () => {
        setVisibleCount(visibleCount + 8);
    };

    const customIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/5811/5811962.png',
        iconSize: [45, 41],
        iconAnchor: [15, 30],
    });

    const MapBounds = ({ stations }) => {
        const map = useMap();
        useEffect(() => {
            if (stations.length > 0) {
                const bounds = L.latLngBounds(
                    stations.map(station => [
                        station.location.latitude,
                        station.location.longitude
                    ])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, [stations, map]);
        return null;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <ScaleLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <div className='student-list-title'>
                <h3>Détails du Transport</h3>
            </div>
            <div className='blue-text'><strong>Étudiants :</strong></div>
            <div className="student-grid">
                {getStudentProfiles(transportStudents).slice(0, visibleCount).map((student, index) => (
                    <div key={index} className="transport-student-profile">
                        <img
                            src={student.profile_picture || 'https://via.placeholder.com/50'}
                            alt={student.name}
                            className="student-photo"
                        />
                        <p className="student-name-transport">{student.name}</p>
                    </div>
                ))}
            </div>
            {visibleCount < transportStudents.length && (
                <button onClick={loadMoreStudents} className="create-student-button">
                    Afficher plus
                </button>
            )}

            <div className='blue-text'><strong>Stations :</strong></div>
            <div className="station-list">
                {stations.map((station, index) => (
                    <div key={station.location.id} className="station-item">
                        <p className='blue-text'><strong>Station </strong> {station.order}</p>
                        <p>
                            <strong className='blue-text'>Adresse :</strong>{' '}
                            <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(station.location.address)}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="waze-link"
                            >
                                {station.location.address}
                            </a>
                        </p>
                    </div>
                ))}
            </div>

            <div className='blue-text'><strong>Carte des stations :</strong></div>
            <MapContainer
                center={[0, 0]}
                zoom={15}
                style={{ height: "400px", width: "100%", marginTop: "20px", marginBottom: "100px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds stations={stations} />
                {stations.map((station) => (
                    <Marker
                        key={station.location.id}
                        position={[station.location.latitude, station.location.longitude]}
                        icon={customIcon}
                    >
                        <Popup>
                            <strong>Station {station.order}</strong><br />
                            <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(station.location.address)}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="waze-link"
                            >
                                {station.location.address}
                            </a>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className='whitetext'>Scolara</div>
        </div>
    );
};

export default TransportDetails;