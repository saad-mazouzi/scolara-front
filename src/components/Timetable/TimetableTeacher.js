import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchTeachers, fetchClassrooms, fetchSubjects, fetchTeacherAvailabilities, createTeacherAvailability, deleteTeacherAvailability, fetchTimeSlots  } from '../../APIServices';
import axios from 'axios';
import '../Timetable/Timetable.css';
import { PulseLoader , PuffLoader, MoonLoader} from 'react-spinners';

const TimetableTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableSessions, setTimetableSessions] = useState([]);
    const [educationLevelName, setEducationLevelName] = useState(''); // Pour le nom du niveau d'éducation
    const [SchoolId, setSchoolId] = useState(Cookies.get('SchoolId') || '');
    const [availabilities, setAvailabilities] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]); // Créneaux horaires récupérés depuis l'API
    const teacherId = Cookies.get('TeacherId'); // ID de l'enseignant connecté
    const [loadingEducationLevel, setLoadingEducationLevel] = useState(true); // Indicateur de chargement
    const [loadingTimetable, setLoadingTimetable] = useState(true); // Indicateur de chargement pour la table
    const [loadingAvailabilities, setLoadingAvailabilities] = useState(true); // Indicateur pour les disponibilités
    const [loadingForm, setLoadingForm] = useState(false); // Indicateur pour le formulaire
    const [newAvailability, setNewAvailability] = useState({
        day: '',
        start_time: '',
        end_time: ''
    });
    const teacherEducationLevel = Cookies.get('TeacherEducationLevel'); // Niveau d'éducation de l'enseignant

    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

    const fetchTimetableSessions = async () => {
        try {
            setLoadingTimetable(true); // Commence le chargement
            const response = await axios.get(`https://scolara-backend.onrender.com/api/timetable-sessions/?school_id=${SchoolId}`);
            const filteredSessions = response.data.filter(
                session => session.education_level === parseInt(teacherEducationLevel)
            );
            setTimetableSessions(filteredSessions);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions:", error);
        } finally {
            setLoadingTimetable(false); // Fin du chargement
        }
    };
    

    const fetchTimeSlotsData = async () => {
        try {
            const slots = await fetchTimeSlots(SchoolId);
            console.log("Créneaux horaires récupérés :", slots); // Vérifiez les créneaux ici
            setTimeSlots(slots);
        } catch (error) {
            console.error("Erreur lors de la récupération des créneaux horaires:", error);
        }
    };
    

    const fetchInitialData = async () => {
        try {
            setTeachers(await fetchTeachers());
            setClassrooms(await fetchClassrooms(SchoolId));
            setSubjects(await fetchSubjects(SchoolId));
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
        }
    };

    const handleAvailabilitySubmit = async (e) => {
        e.preventDefault();

        setLoadingForm(true); // Commence le chargement

        try {
            const availabilityData = {
                ...newAvailability,
                teacher: parseInt(teacherId),
                school: parseInt(SchoolId)
            };
            await createTeacherAvailability(availabilityData);
            setNewAvailability({ day: '', start_time: '', end_time: '' });
            fetchTeacherAvailabilitiesData(); // Refresh the list
        } catch (error) {
            console.error('Erreur lors de l\'ajout de disponibilité:', error);
        } finally {
            setLoadingForm(false); // Fin du chargement
        }
    };

    const handleDeleteAvailability = async (id) => {
        setLoadingForm(true); // Commence le chargement
        try {
            await deleteTeacherAvailability(id);
            fetchTeacherAvailabilitiesData(); // Refresh the list after deletion
        } catch (error) {
            console.error('Erreur lors de la suppression de la disponibilité:', error);
        } finally {
            setLoadingForm(false); // Fin du chargement
        }
    };

    const fetchTeacherAvailabilitiesData = async () => {
        try {
            setLoadingAvailabilities(true); // Commence le chargement
            const data = await fetchTeacherAvailabilities();
            const teacherAvailabilities = data.filter(av => av.teacher === parseInt(teacherId));
            setAvailabilities(teacherAvailabilities);
        } catch (error) {
            console.error('Erreur lors de la récupération des disponibilités:', error);
        } finally {
            setLoadingAvailabilities(false); // Fin du chargement
        }
    };
    
    
    const fetchEducationLevelName = async () => {
        try {
            setLoadingEducationLevel(true); // Commence le chargement
            const response = await axios.get(`https://scolara-backend.onrender.com/api/educationlevel/${teacherEducationLevel}/`);
            setEducationLevelName(response.data.name || 'Niveau inconnu');
        } catch (error) {
            console.error("Erreur lors de la récupération du niveau d'éducation:", error);
            setEducationLevelName('Niveau inconnu');
        } finally {
            setLoadingEducationLevel(false); // Fin du chargement
        }
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5); // Extrait uniquement les heures et minutes (HH:mm)
    };  

    useEffect(() => {
        fetchTimetableSessions();
        fetchEducationLevelName();
        fetchTimeSlotsData();
        fetchInitialData();
        fetchTeacherAvailabilitiesData(); 
    }, [SchoolId, teacherEducationLevel]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeachers(await fetchTeachers());
                setClassrooms(await fetchClassrooms(SchoolId));
                setSubjects(await fetchSubjects(SchoolId));
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            }
        };
        fetchData();
    }, [SchoolId]);

    const organizeSessions = () => {
        const organizedSchedule = {};
    
        // Initialiser chaque jour et chaque créneau
        daysOfWeek.forEach(day => {
            organizedSchedule[day] = {};
            timeSlots.forEach(slot => {
                organizedSchedule[day][slot.id] = null; // Utiliser l'ID unique de chaque créneau
            });
        });
    
        // Mapper les sessions de l'emploi du temps
        timetableSessions.forEach(session => {
            const slot = timeSlots.find(
                t => t.start_time === session.start_time && t.end_time === session.end_time
            );
    
            if (slot && organizedSchedule[session.day]) {
                const teacher = teachers.find(teacher => teacher.id === session.teacher);
                organizedSchedule[session.day][slot.id] = {
                    subject: subjects.find(subj => subj.id === session.subject)?.name || <PulseLoader size={8} color="#ffcc00" />,
                    teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : <PulseLoader size={8} color="#4e7dad" />,
                    classroom: classrooms.find(room => room.id === session.classroom)?.name || <PulseLoader size={8} color="#ffcc00" />,
                };
            }
        });
    
        console.log("Emploi du temps organisé :", organizedSchedule); // Debug
        return organizedSchedule;
    };
    
    
    



    const schedule = organizeSessions();

    return (
        <div>
            <div className="student-list-title">
                <h3>Emploi du temps</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    Niveau d'éducation : 
                    {loadingEducationLevel ? (
                        <PulseLoader size={8} color="#ffcc00" />
                    ) : (
                        <span>{educationLevelName}</span>
                    )}
                </h4>
                {loadingTimetable ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <PuffLoader color="#007bff" size={60} />
                    </div>
                ) : (
                    <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                        <thead>
                            <tr>
                                <th>Heure/Jour</th>
                                {daysOfWeek.map(day => <th key={day}>{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map(slot => (
                                <tr key={slot.id}>
                                    <td>{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</td>
                                    {daysOfWeek.map(day => (
                                        <td key={`${day}-${slot.id}`}>
                                            {schedule[day][slot.id] ? (
                                                <>
                                                    <div><strong>{schedule[day][slot.id].subject}</strong></div>
                                                    <div>{schedule[day][slot.id].teacherName}</div>
                                                    <div><i>{schedule[day][slot.id].classroom}</i></div>
                                                </>
                                            ) : (
                                                <span style={{ color: 'grey' }}>Pas de session</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

            <div>
                <div className='whitetext'>Scolara</div>
                <div className='student-list-title'>
                    <h3>Disponibilités</h3>
                </div>
                <table >
                    <thead>
                        <tr>
                            <th>Jour</th>
                            <th>Heure de début</th>
                            <th>Heure de fin</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingAvailabilities ? (
                            <tr>
                                <div className='teacher-dispo-spinner'><PulseLoader color="#ffcc00" size={15} /></div>
                            </tr>
                        ) : availabilities.length > 0 ? (
                            availabilities.map((availability, index) => (
                                <tr key={index}>
                                    <td>{availability.day}</td>
                                    <td>{availability.start_time}</td>
                                    <td>{availability.end_time}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteAvailability(availability.id)}
                                            className="teacher-button-delete"
                                            style={{ textAlign: 'center', marginRight: '0px', marginTop: '10px' }}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'gray' }}>
                                    Aucune disponibilité trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
                <form onSubmit={handleAvailabilitySubmit} style={{ marginTop: '20px' }}>
                    <label>
                        Jour:
                        <select
                            value={newAvailability.day}
                            className="student-input-education-level"
                            onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
                            required
                        >
                            <option value="" disabled>Choisir un jour</option>
                            {daysOfWeek.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Heure de début:
                        <input
                            type="time"
                            value={newAvailability.start_time}
                            className="teacher-timetable-input-education-level"
                            onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Heure de fin:
                        <input
                            type="time"
                            className="teacher-timetable-input-education-level"
                            value={newAvailability.end_time}
                            onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                            required
                        />
                    </label>
                    <button className="create-student-button" >
                        <i className="fas fa-plus"></i>
                        Ajouter
                    </button>
                </form>
                <div className='whitetext'>Scolara</div>
            </div>
            {loadingForm && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableTeacher;
