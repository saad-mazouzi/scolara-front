import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchTeachers, fetchClassrooms, fetchSubjects } from '../../APIServices';
import axios from 'axios';
import '../Timetable/Timetable.css';
import { PulseLoader } from 'react-spinners';

const TimetableParent= () => {
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableSessions, setTimetableSessions] = useState([]);
    const [educationLevelName, setEducationLevelName] = useState(''); // Pour le nom du niveau d'éducation
    const [SchoolId, setSchoolId] = useState(Cookies.get('SchoolId') || '');
    const [loadingEducationLevel, setLoadingEducationLevel] = useState(true);
    // const teacherId = Cookies.get('TeacherId'); // ID de l'enseignant connecté
    const teacherEducationLevel = Cookies.get('education_level'); // Niveau d'éducation de l'enseignant

    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const timeSlots = ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00"];

    const fetchTimetableSessions = async () => {
        try {
            const response = await axios.get(`https://scolara-backend.onrender.com/api/timetable-sessions/?school_id=${SchoolId}`);
            const filteredSessions = response.data.filter(
                session => session.education_level === parseInt(teacherEducationLevel)
            );
            setTimetableSessions(filteredSessions);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions d'emploi du temps:", error);
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
        daysOfWeek.forEach(day => {
            organizedSchedule[day] = {};
            timeSlots.forEach(slot => {
                organizedSchedule[day][slot] = null;
            });
        });

        timetableSessions.forEach(session => {
            const subject = subjects.find(subj => subj.id === session.subject)?.name || <PulseLoader   color="#4e7dad" size={8} />;
            const teacher = teachers.find(teach => teach.id === session.teacher);
            const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : <PulseLoader   color="#4e7dad" size={8} />;
            const classroom = classrooms.find(room => room.id === session.classroom)?.name || <PulseLoader   color="#4e7dad" size={8} />;

            const timeSlot = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;
            if (organizedSchedule[session.day]) {
                organizedSchedule[session.day][timeSlot] = { subject, teacherName, classroom };
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
                            <tr key={slot}>
                                <td>{slot}</td>
                                {daysOfWeek.map(day => (
                                    <td key={day}>
                                        {schedule[day][slot] ? (
                                            <>
                                                <div><strong>{schedule[day][slot].subject}</strong></div>
                                                <div>{schedule[day][slot].teacherName}</div>
                                                <div><i>{schedule[day][slot].classroom}</i></div>
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
            </div>
            <div className='whitetext'>Scolara</div>
           </div>
    );
};

export default TimetableParent;
