import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchTeachers, fetchClassrooms, fetchSubjects } from '../../APIServices';
import axios from 'axios';
import '../Timetable/Timetable.css';

const Timetable = () => {
    const [educationLevels, setEducationLevels] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableSessions, setTimetableSessions] = useState([]); 
    const [selectedLevel, setSelectedLevel] = useState(Cookies.get('selectedLevel') || '');
    const [SchoolId, setSchoolId] = useState(Cookies.get('SchoolId') || '');
    const [schedule, setSchedule] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [showTable, setShowTable] = useState(false); 

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeslots = [
        { start: '08:00', end: '10:00' },
        { start: '10:00', end: '12:00' },
        { start: '14:00', end: '16:00' },
        { start: '16:00', end: '18:00' },
    ];

    const fetchTimetableSessions = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/timetable-sessions/?school_id=${SchoolId}`);
            setTimetableSessions(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions d'emploi du temps:", error);
        }
    };

    useEffect(() => {
        fetchTimetableSessions();
    }, [SchoolId]);

    const handleCreateTimetable = async () => {
        if (!selectedLevel) {
            alert("Sélectionnez un niveau d'éducation pour créer un emploi du temps.");
            return;
        }

        try {
            const payload = { education_level: selectedLevel, school: parseInt(SchoolId, 10) };
            const response = await axios.post('http://localhost:8000/api/timetables/', payload);
            const newTimetable = response.data;

            Cookies.set('TimetableID', newTimetable.id, { expires: 7 });
            setShowTable(true);
            alert('Emploi du temps créé avec succès!');
        } catch (error) {
            console.error("Erreur lors de la création de l'emploi du temps:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const levelsResponse = await axios.get(`http://localhost:8000/api/educationlevel/?school_id=${SchoolId}`);
                setEducationLevels(levelsResponse.data);

                setTeachers(await fetchTeachers());
                setClassrooms(await fetchClassrooms(SchoolId));
                setSubjects(await fetchSubjects(SchoolId));
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            }
        };

        fetchData();
    }, [SchoolId]);

    const handleLevelChange = (event) => {
        const level = event.target.value;
        setSelectedLevel(level);
        Cookies.set('selectedLevel', level, { expires: 7 });
    };

    const handlePlusClick = (day, slot) => {
        setModalData({
            day,
            start_time: slot.start,
            end_time: slot.end,
            subject: '',
            teacher: '',
            classroom: '',
            education_level: selectedLevel,
            school: SchoolId,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalData(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const timetableId = Cookies.get('TimetableID');
            const sessionData = {
                timetable: timetableId,
                subject: modalData.subject,
                teacher: modalData.teacher,
                classroom: modalData.classroom,
                education_level: Cookies.get('selectedLevel'),
                day: modalData.day,
                start_time: modalData.start_time,
                end_time: modalData.end_time,
                school: parseInt(SchoolId, 10)
            };

            await axios.post('http://localhost:8000/api/timetable-sessions/', sessionData);

            const updatedSchedule = { ...schedule };
            if (!updatedSchedule[modalData.day]) {
                updatedSchedule[modalData.day] = {};
            }
            updatedSchedule[modalData.day][modalData.start_time] = {
                subject: subjects.find((subj) => subj.id === parseInt(modalData.subject)).name,
                teacher: teachers.find((teacher) => teacher.id === parseInt(modalData.teacher)),
                classroom: classrooms.find((classroom) => classroom.id === parseInt(modalData.classroom)).name,
            };
            setSchedule(updatedSchedule);

            fetchTimetableSessions(); // Rafraîchir la liste des sessions après ajout
            handleCloseModal();
            alert('Séance ajoutée avec succès!');
        } catch (error) {
            console.error("Erreur lors de l'ajout de la séance:", error);
        }
    };

    const handleInputChange = (e) => {
        setModalData({ ...modalData, [e.target.name]: e.target.value });
    };

    const exportToExcel = (table, idx) => {
        const workbook = XLSX.utils.book_new();
        const worksheetData = [
            ["Heure/Jour", ...days],
            ...timeslots.map(slot => [
                `${slot.start} - ${slot.end}`,
                ...days.map(day => 
                    table[day] && table[day][slot.start] 
                    ? `${table[day][slot.start].subject}\n${table[day][slot.start].teacher.first_name} ${table[day][slot.start].teacher.last_name}\n${table[day][slot.start].classroom}`
                    : '-'
                )
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Timetable ${idx + 1}`);
        XLSX.writeFile(workbook, `EmploiDuTemps_${selectedLevel}_${idx + 1}.xlsx`);
    };

    return (
        <div>
            <div className="student-list-title">
                <h3>Emploi du temps</h3>
            </div>

            <select value={selectedLevel} onChange={handleLevelChange} className="student-input-education-level">
                <option value="">Sélectionner un niveau d'éducation</option>
                {educationLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                ))}
            </select>
            <button onClick={handleCreateTimetable} className="create-timetable-button">
                Créer Emploi du Temps
            </button>

            {showTable && (
                <>
                    <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th>Heure/Jour</th>
                                {days.map(day => <th key={day}>{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {timeslots.map((slot, index) => (
                                <tr key={index}>
                                    <td>{slot.start} - {slot.end}</td>
                                    {days.map((day) => (
                                        <td key={day}>
                                            {schedule[day] && schedule[day][slot.start] ? (
                                                <>
                                                    <div>{schedule[day][slot.start].subject}</div>
                                                    <div>{schedule[day][slot.start].teacher.first_name} {schedule[day][slot.start].teacher.last_name}</div>
                                                    <div>{schedule[day][slot.start].classroom}</div>
                                                </>
                                            ) : (
                                                <button onClick={() => handlePlusClick(day, slot)}>
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <div>
                <h4>Sessions d'emploi du temps</h4>
                <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Jour</th>
                            <th>Heure de début</th>
                            <th>Heure de fin</th>
                            <th>Matière</th>
                            <th>Enseignant</th>
                            <th>Salle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timetableSessions.map(session => {
                            const subject = subjects.find(subj => subj.id === session.subject)?.name || "Matière inconnue";
                            const teacher = teachers.find(teach => teach.id === session.teacher);
                            const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : "Enseignant inconnu";
                            const classroom = classrooms.find(room => room.id === session.classroom)?.name || "Salle inconnue";

                            return (
                                <tr key={session.id}>
                                    <td>{session.day}</td>
                                    <td>{session.start_time}</td>
                                    <td>{session.end_time}</td>
                                    <td>{subject}</td>
                                    <td>{teacherName}</td>
                                    <td>{classroom}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && modalData && (
                <div className="modal" style={modalStyle}>
                    <div className="modal-content" style={modalContentStyle}>
                        <h3>Ajouter une séance</h3>
                        <form onSubmit={handleSubmit}>
                            <div><label>Jour: </label><input type="text" value={modalData.day} readOnly /></div>
                            <div><label>Heure de début: </label><input type="time" value={modalData.start_time} readOnly /></div>
                            <div><label>Heure de fin: </label><input type="time" value={modalData.end_time} readOnly /></div>
                            <div>
                                <label>Matière: </label>
                                <select name="subject" value={modalData.subject} onChange={handleInputChange} required>
                                    <option value="">Sélectionnez une matière</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Enseignant: </label>
                                <select name="teacher" value={modalData.teacher} onChange={handleInputChange}>
                                    <option value="">Sélectionnez un enseignant</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {`${teacher.first_name} ${teacher.last_name}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Salle de classe: </label>
                                <select name="classroom" value={modalData.classroom} onChange={handleInputChange}>
                                    <option value="">Sélectionnez une salle</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit">Enregistrer</button>
                            <button type="button" onClick={handleCloseModal}>Annuler</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '300px'
};

export default Timetable;
