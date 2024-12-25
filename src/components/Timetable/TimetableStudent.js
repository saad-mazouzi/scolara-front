import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchTeachers, fetchClassrooms, fetchSubjects, fetchTimeSlots } from '../../APIServices';
import axios from 'axios';
import '../Timetable/Timetable.css';
import { PulseLoader , PuffLoader } from 'react-spinners';

const TimetableStudent = () => {
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableSessions, setTimetableSessions] = useState([]);
    const [educationLevelName, setEducationLevelName] = useState(''); 
    const [SchoolId, setSchoolId] = useState(Cookies.get('SchoolId') || '');
    const [timeSlots, setTimeSlots] = useState([]); // Time slots dynamiques
    const teacherEducationLevel = Cookies.get('education_level'); 
    const [loadingEducationLevel, setLoadingEducationLevel] = useState(true);
    const [loadingtimetableSessions, setLoadingtimetableSessions] = useState(true);

    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

    // Fonction pour récupérer les créneaux horaires dynamiques
    const fetchTimeSlotsData = async () => {
        try {
            const slots = await fetchTimeSlots(SchoolId);
            setTimeSlots(slots);
        } catch (error) {
            console.error("Erreur lors de la récupération des créneaux horaires:", error);
        }
    };

    // Fonction pour récupérer les sessions de l'emploi du temps
    const fetchTimetableSessions = async () => {
        try {
            const response = await axios.get(`https://scolara-backend.onrender.com/api/timetable-sessions/?school_id=${SchoolId}`);
            const filteredSessions = response.data.filter(
                session => session.education_level === parseInt(teacherEducationLevel)
            );
            setTimetableSessions(filteredSessions);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions d'emploi du temps:", error);
        } finally {
            setLoadingtimetableSessions(false);
        }
    };

    const fetchEducationLevelName = async () => {
        try {
            const response = await axios.get(`https://scolara-backend.onrender.com/api/educationlevel/${teacherEducationLevel}/`);
            setEducationLevelName(response.data.name || 'Niveau inconnu');
            setLoadingEducationLevel(false);
        } catch (error) {
            console.error("Erreur lors de la récupération du niveau d'éducation:", error);
            setEducationLevelName('Niveau inconnu');
        }
    };

    useEffect(() => {
        fetchTimetableSessions();
        fetchEducationLevelName();
        fetchTimeSlotsData();
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

    // Fonction pour formater l'heure (HH:mm)
    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5);
    };

    // Organiser les sessions en fonction des jours et créneaux
    const organizeSessions = () => {
        const organizedSchedule = {};
        daysOfWeek.forEach(day => {
            organizedSchedule[day] = {};
            timeSlots.forEach(slot => {
                organizedSchedule[day][slot.id] = null;
            });
        });

        timetableSessions.forEach(session => {
            const slot = timeSlots.find(
                t => t.start_time === session.start_time && t.end_time === session.end_time
            );
            if (slot && organizedSchedule[session.day]) {
                const subject = subjects.find(subj => subj.id === session.subject)?.name || <PulseLoader   color="#ffcc00" size={8} />;
                const teacher = teachers.find(teach => teach.id === session.teacher);
                const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : <PulseLoader   color="#ffcc00" size={8} />;
                const classroom = classrooms.find(room => room.id === session.classroom)?.name || <PulseLoader   color="#ffcc00" size={8} />;

                organizedSchedule[session.day][slot.id] = { subject, teacherName, classroom };
            }
        });

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

                {loadingtimetableSessions ? (
                    // Affiche le loader pendant le chargement des données
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <PuffLoader color="#007bff" size={60} />
                    </div>
                ) : (
                <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                    <thead>
                        <tr>
                            <th>Heure/Jour</th>
                            {daysOfWeek.map(day => (
                                <th key={day}>{day}</th>
                            ))}
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
                                            <h4 className='pas-de-session'>Pas de session</h4>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
            <div className='whitetext'>Scolara</div>
        </div>
    );
};

export default TimetableStudent;
