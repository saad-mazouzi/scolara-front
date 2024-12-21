import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import './Dashboard.css';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserFriends } from 'react-icons/fa';
import DonutChart from './DonutChart';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight,faTrash } from '@fortawesome/free-solid-svg-icons';
import MonthlyExpensesChart from './MonthlyExpensesChart';
import MonthlyEarningsChart from './MonthlyEarningsChart';
import { deleteEvent } from '../../APIServices';
import Cookies from 'js-cookie';


const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newEvent, setNewEvent] = useState({ title: '', description: '' });
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
    const eventsPerPage = 2; // Nombre maximum d'événements par page
    const schoolId = Cookies.get('SchoolId'); // Récupère SchoolId des cookies

    
    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await axiosInstance.get(`/dashboard/?school_id=${schoolId}`);
                setData(response.data);
            } catch (err) {
                setError("Erreur lors de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchEvents = async () => {
            try {
                const response = await axiosInstance.get(`/events/?school_id=${schoolId}`);
                setEvents(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des événements:", error);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        setSelectedDate(new Date());
    }, [events]);

    const onDateChange = (selectedDate) => {
        setDate(selectedDate);
        setSelectedDate(selectedDate);
        setShowForm(true);
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();

        const formattedDate = selectedDate.toLocaleDateString('fr-CA');
        const eventData = {
            title: newEvent.title,
            description: newEvent.description,
            date: formattedDate,
        };

        try {
            const response = await axiosInstance.post(`/events/?school_id=${schoolId}`, eventData);
            setEvents([...events, response.data]);
            setNewEvent({ title: '', description: '' });
            setShowForm(false);
        } catch (error) {
            console.error("Erreur lors de la création de l'événement:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteEvent(eventId);
            setEvents(events.filter(event => event.id !== eventId));
        } catch (error) {
            console.error("Erreur lors de la suppression de l'événement:", error);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
    };

    // Filtrer les événements pour la date sélectionnée
    const eventsForSelectedDate = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === selectedDate.toDateString();
    });

    // Pagination logique
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = eventsForSelectedDate.slice(indexOfFirstEvent, indexOfLastEvent);

    const totalPages = Math.ceil(eventsForSelectedDate.length / eventsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="dashboard-container">
            <div className="student-list-title">
                <h3>Tableau de Bord</h3>
            </div>
            <div className="dashboard-cards">
                <div className="dashboard-card" onClick={() => navigate('/students')}>
                    <div className="icon-container student-icon">
                        <FaUserGraduate size={30} />
                    </div>
                    <div className="card-content">
                        <h3>Étudiants</h3>
                        <p>{data.students_count}</p>
                    </div>
                </div>
                <div className="dashboard-card" onClick={() => navigate('/teachers')}>
                    <div className="icon-container teacher-icon">
                        <FaChalkboardTeacher size={30} />
                    </div>
                    <div className="card-content">
                        <h3>Enseignants</h3>
                        <p>{data.teachers_count}</p>
                    </div>
                </div>
                <div className="dashboard-card" onClick={() => navigate('/drivers')}>
                    <div className="icon-container driver-icon">
                        <FaUserTie size={30} />
                    </div>
                    <div className="card-content">
                        <h3>Chauffeurs</h3>
                        <p>{data.drivers_count}</p>
                    </div>
                </div>
                <div className="dashboard-card" onClick={() => navigate('/parents')}>
                    <div className="icon-container parent-icon">
                        <FaUserFriends size={30} />
                    </div>
                    <div className="card-content">
                        <h3>Parents</h3>
                        <p>{data.parents_count}</p>
                    </div>
                </div>
            </div>

            <div className="chart-calendar-container">
                <DonutChart 
                    maleCount={data.male_students_count || 0} 
                    femaleCount={data.female_students_count || 0} 
                />
                
                <div className="calendar-reminders-container">
                <div className="calendar-container">
                    <h4>Calendrier des Événements</h4>
                    <Calendar
                        onChange={onDateChange}
                        value={date}
                        tileClassName={({ date, view }) => {
                            if (view === 'month') {
                                const eventDates = events.map(event => new Date(event.date).toDateString());
                                return eventDates.includes(date.toDateString()) ? 'react-calendar__tile--highlight' : null;
                            }
                        }}
                    />
                </div>
                    
                
                <div className="event-reminders">
                    <h4>Rappels d'Événements</h4>
                    {currentEvents.length > 0 ? (
                        currentEvents.map((event) => (
                            <div key={event.id} className="event-reminder">
                                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                                <p className="event-title">{event.title}</p>
                                <p className="event-description">{event.description}</p>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="delete-icon"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    title="Supprimer cet événement"
                                />
                            </div>
                        ))
                    ) : (
                        <p>Aucun événement pour aujourd'hui.</p>
                    )}

                    {eventsForSelectedDate.length > eventsPerPage && (
                        <div className="pagination-controls">
                            <button onClick={prevPage} disabled={currentPage === 1}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Précédent
                            </button>
                            <span>Page {currentPage} sur {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages}>
                                Suivant <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </div>
            <div className="monthly-expenses-chart">
                    <MonthlyExpensesChart />                    <MonthlyEarningsChart />

                </div>
            {showForm && (
                <div className="event-form">
                    <div className="form-header">
                        <h4>Ajouter un Événement pour le {selectedDate.toLocaleDateString()}</h4>
                        <button onClick={handleCloseForm} className="close-button-dashboard">Fermer</button>
                    </div>
                    <form onSubmit={handleEventSubmit}>
                        <input
                            type="text"
                            placeholder="Titre"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            required
                        ></textarea>
                        <button className="create-student-button" type="submit"><i className="fas fa-plus"></i>Ajouter</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
