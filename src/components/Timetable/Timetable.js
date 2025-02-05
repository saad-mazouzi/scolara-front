import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchTeachers, fetchClassrooms,fetchTeachersBySubject, deleteTeacherAvailability,fetchSubjects,fetchTeacherAvailabilities, fetchSubjectsByEducationLevel } from '../../APIServices';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../Timetable/Timetable.css';
import {fetchTimeSlots,createTimeSlot,updateTimeSlot,deleteTimeSlot} from '../../APIServices.js';
import { MdOutlineSettings } from "react-icons/md";
import { faPrint } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône d'impression
import { PuffLoader } from 'react-spinners';
import {PulseLoader, MoonLoader} from 'react-spinners';




const Timetable = () => {
    const [educationLevels, setEducationLevels] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading , setLoading] = useState(true);
    const [activeTable, setActiveTable] = useState(null); // Contrôle de la table active
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche pour les enseignants
    const [teacherAvailabilities, setTeacherAvailabilities] = useState([]); // Disponibilités des enseignants
    const [timetableSessions, setTimetableSessions] = useState([]); 
    const [selectedLevel, setSelectedLevel] = useState(Cookies.get('selectedLevel') || '');
    const [SchoolId, setSchoolId] = useState(Cookies.get('SchoolId') || '');
    const [schedule, setSchedule] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [showTable, setShowTable] = useState(false); 
    const [newTimeSlot, setNewTimeSlot] = useState({ start: '', end: '' });
    const [editingTimeSlot, setEditingTimeSlot] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingaddtimeslot, setLoadingAddTimeSlot] = useState(false);
    const [loadingeditimeslot, setLoadingEditTimeSlot] = useState(false);
    const [loadingdeletetimeslot, setLoadingDeleteTimeSlot] = useState(false);


    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    // const timeslots = [
    //     { start: '08:00', end: '10:00' },
    //     { start: '10:00', end: '12:00' },
    //     { start: '14:00', end: '16:00' },
    //     { start: '16:00', end: '18:00' },
    // ];

    const [customTimeslots, setCustomTimeslots] = useState([
        { start: '08:00', end: '10:00' },
        { start: '10:00', end: '12:00' },
        { start: '14:00', end: '16:00' },
        { start: '16:00', end: '18:00' },
    ]);

    const handleDeleteAvailability = async (availabilityId) => {
        setLoadingAddTimeSlot(true);
        try {
            await deleteTeacherAvailability(availabilityId);
            // Rafraîchir la liste des disponibilités après suppression
            setTeacherAvailabilities((prevAvailabilities) =>
                prevAvailabilities.filter((availability) => availability.id !== availabilityId)
            );
        } catch (error) {
            console.error("Erreur lors de la suppression de la disponibilité:", error);
        } finally {
            setLoadingAddTimeSlot(false);
        }
    };

    const exportTimetableToXLSX = (levelName, schedule) => {
        const workbook = XLSX.utils.book_new();
        const data = [];
        
        // En-tête des jours de la semaine
        const headerRow = ['Heure/Jour', ...days];
        data.push(headerRow);
    
        // Ajout des lignes de créneaux horaires
        timeSlots.forEach((slot) => {
            const row = [`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`];
            days.forEach((day) => {
                const session = schedule[day]?.[slot.start_time];
                if (session) {
                    row.push(`${session.subject}\n${session.teacherName}\n${session.classroom}`);
                } else {
                    row.push('Pas de session');
                }
            });
            data.push(row);
        });
    
        // Création de la feuille de calcul
        const worksheet = XLSX.utils.aoa_to_sheet(data);
    
        // Application du style de base (bordures, alignements, mise en forme)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellAddress = { c: C, r: R };
                const cellRef = XLSX.utils.encode_cell(cellAddress);
    
                if (!worksheet[cellRef]) continue;
    
                // Appliquer du style basique pour chaque cellule
                worksheet[cellRef].s = {
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } },
                    },
                    font: {
                        name: 'Arial',
                        sz: 10,
                        bold: R === 0, // Appliquer le gras sur l'en-tête
                    },
                    fill: R === 0
                        ? { fgColor: { rgb: '007bff' } } // Arrière-plan bleu pour l'en-tête
                        : undefined,
                };
            }
        }
    
        // Ajuster les largeurs des colonnes
        worksheet['!cols'] = [
            { wch: 15 }, // Heure/Jour
            ...days.map(() => ({ wch: 20 })) // Largeur pour chaque jour
        ];
    
        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, levelName);
    
        // Télécharger le fichier
        XLSX.writeFile(workbook, `${levelName}_Emploi_du_Temps.xlsx`);
    };
    
    
    

    const loadTimeSlots = async () => {
        try {
            const fetchedTimeSlots = await fetchTimeSlots(SchoolId);
            setTimeSlots(fetchedTimeSlots);
        } catch (error) {
            console.error('Erreur lors de la récupération des créneaux horaires:', error);
        } finally {
            setLoading(false); // Fin du chargement, même en cas d'erreur
        }
    };
    

    useEffect(() => {
        loadTimeSlots();
    }, [SchoolId]);

    // Handle adding a new timeslot
    const handleAddTimeSlot = async () => {
        if (!newTimeSlot.start || !newTimeSlot.end) {
            alert('Veuillez saisir les heures de début et de fin.');
            return;
        }
        setLoadingAddTimeSlot(true);
        try {
            const createdTimeSlot = await createTimeSlot(SchoolId, newTimeSlot.start, newTimeSlot.end);
            setTimeSlots([...timeSlots, createdTimeSlot]);
            setNewTimeSlot({ start: '', end: '' }); // Reset input fields
        } catch (error) {
            console.error('Erreur lors de l\'ajout du créneau horaire:', error);
        } finally {
            setLoadingAddTimeSlot(false);
        }
    };

    useEffect(() => {
        const initializeSubjects = async () => {
            if (selectedLevel) {
                try {
                    const subjects = await fetchSubjectsByEducationLevel(selectedLevel);
                    setFilteredSubjects(subjects);
                } catch (error) {
                    console.error("Erreur lors de l'initialisation des matières :", error);
                }
            }
        };
    
        initializeSubjects();
    }, [selectedLevel]);
    

    // Handle editing a timeslot
    const handleEditTimeSlot = async (id, start, end) => {
        setLoadingEditTimeSlot (true);
        try {
            const updatedTimeSlot = await updateTimeSlot(id, start, end, SchoolId); // Inclure SchoolId
            setTimeSlots(timeSlots.map(ts => (ts.id === id ? updatedTimeSlot : ts)));
            setEditingTimeSlot(null); // Réinitialiser l'état d'édition
        } catch (error) {
            console.error('Erreur lors de la mise à jour du créneau horaire:', error.response?.data || error.message);
        } finally {
            setLoadingEditTimeSlot(false);
        }
    };

    // Handle deleting a timeslot
    const handleDeleteTimeSlot = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce créneau horaire ?')) return;
        setLoadingDeleteTimeSlot(true);
        try {
            await deleteTimeSlot(id);
            setTimeSlots(timeSlots.filter(ts => ts.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression du créneau horaire:', error);
        } finally {
            setLoadingDeleteTimeSlot(false);
        }
    };
    
    useEffect(() => {
    console.log("Available Teachers Updated:", availableTeachers);
}, [availableTeachers]);



    const fetchTimetableSessions = async () => {
        try {
            const response = await axios.get(`https://scolara-backend.onrender.com/api/timetable-sessions/?school_id=${SchoolId}`);
            setTimetableSessions(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions d'emploi du temps:", error);
        } finally {
            setLoading(false); // Fin du chargement
        }
    };

    

    const fetchTeacherAvailabilitiesData = async () => {
        try {
            const availabilities = await fetchTeacherAvailabilities(); // Appel à l'API pour récupérer les disponibilités
            setTeacherAvailabilities(availabilities); // Stocker les disponibilités dans l'état
        } catch (error) {
            console.error('Erreur lors de la récupération des disponibilités des enseignants:', error);
        }
    };
    
    useEffect(() => {
        fetchTimetableSessions(); // Récupération des sessions d'emploi du temps
        fetchTeacherAvailabilitiesData(); // Récupération des disponibilités des enseignants
    }, [SchoolId]);
    
    

    const handleCreateTimetable = async () => {
        if (!selectedLevel) {
            return;
        }
        setLoadingAddTimeSlot(true);
        try {
            const payload = { education_level: selectedLevel, school: parseInt(SchoolId, 10) };
            const response = await axios.post('https://scolara-backend.onrender.com/api/timetables/', payload);
            const newTimetable = response.data;

            Cookies.set('TimetableID', newTimetable.id, { expires: 7 });
            setShowTable(true);
        } catch (error) {
            console.error("Erreur lors de la création de l'emploi du temps:", error);
        } finally {
            setLoadingAddTimeSlot(false);
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const levelsResponse = await axios.get(`https://scolara-backend.onrender.com/api/educationlevel/?school_id=${SchoolId}`);
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

    const handleLevelChange = async (event) => {
        const level = event.target.value;
        setSelectedLevel(level);
        Cookies.set('selectedLevel', level, { expires: 7 });
    
        if (level) {
            try {
                const subjects = await fetchSubjectsByEducationLevel(level);
                setFilteredSubjects(subjects);
            } catch (error) {
                console.error('Erreur lors de la récupération des matières:', error);
            }
        } else {
            setFilteredSubjects([]);
        }
    };
    

    
    const handlePlusClick = async (day, slot) => {
        if (!selectedLevel) {
            alert('Veuillez sélectionner un niveau d\'éducation avant d\'ajouter une séance.');
            return;
        }
    
        try {
            // Charger les matières pour le niveau sélectionné
            const subjects = await fetchSubjectsByEducationLevel(selectedLevel);
            setFilteredSubjects(subjects);
    
            // Initialiser les données pour le modal
            setModalData({
                day,
                start_time: slot.start_time,
                end_time: slot.end_time,
                subject: '',
                teacher: '',
                classroom: '',
                education_level: selectedLevel,
                school: SchoolId,
            });
    
            setShowModal(true);
        } catch (error) {
            console.error("Erreur lors du chargement des matières :", error);
        }
    };
    

    const handleCloseModal = () => {
        setShowModal(false);
        setModalData(null);
    };

    const printTimetable = (levelId) => {
        const levelName = educationLevels.find(level => level.id === parseInt(levelId))?.name || "Niveau inconnu";
        const printContents = document.getElementById(`table-${levelId}`).outerHTML;
    
        const newWindow = window.open('', '_blank', 'width=800,height=600');
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Emploi du Temps - ${levelName}</title>
                        <style>
                            @page {
                                size: landscape; /* Format paysage */
                                margin: 20mm; /* Marges */
                            }
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: flex-start; /* Aligne tout vers le haut */
                                height: calc(100vh - 40mm); /* Ajuste la hauteur en fonction des marges */
                                box-sizing: border-box;
                                color: black; /* Texte noir */
                                background-color: white; /* Arrière-plan blanc */
                            }
                            h4 {
                                margin: 10px 0 20px 0; /* Ajoute un espace de 20px en bas du titre */
                                text-align: center;
                                font-size: 24px; /* Taille pour le titre */
                                font-weight: bold;
                                color: black; /* Titre en noir */
                            }
                            table {
                                width: 100%;
                                flex-grow: 1;
                                border-collapse: collapse;
                                background-color: white; /* Arrière-plan blanc */
                            }
                            th, td {
                                border: 1px solid black; /* Bordures en noir */
                                padding: 10px;
                                text-align: center;
                                font-size: 14px;
                                vertical-align: middle;
                                color: black; /* Texte en noir */
                            }
                            th {
                                background-color: white; /* En-têtes en blanc */
                                font-weight: bold;
                            }
                            td {
                                height: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <h4>Emploi du Temps - ${levelName}</h4>
                        ${printContents}
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    };    
        

    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!modalData.subject || !modalData.teacher) {
            alert("Veuillez remplir tous les champs obligatoires avant de soumettre.");
            return;
        }
    
        setLoadingAddTimeSlot(true);
        try {
            const timetableId = Cookies.get('TimetableID');
            const sessionData = {
                timetable: timetableId,
                subject: modalData.subject,
                teacher: modalData.teacher,
                classroom: modalData.classroom || null, // Permet une valeur null si aucune salle n'est sélectionnée
                education_level: selectedLevel,
                day: modalData.day,
                start_time: modalData.start_time,
                end_time: modalData.end_time,
                school: parseInt(SchoolId, 10),
            };
    
            const response = await axios.post('https://scolara-backend.onrender.com/api/timetable-sessions/', sessionData);
            const newSession = response.data;
    
            // Mettre à jour immédiatement l'état `schedule`
            const updatedSchedule = { ...schedule };
    
            if (!updatedSchedule[newSession.day]) {
                updatedSchedule[newSession.day] = {};
            }
    
            updatedSchedule[newSession.day][newSession.start_time] = {
                subject: subjects.find((subj) => subj.id === newSession.subject)?.name || "Matière inconnue",
                teacher: teachers.find((teacher) => teacher.id === newSession.teacher) || { first_name: "Inconnu", last_name: "" },
                classroom: classrooms.find((classroom) => classroom.id === newSession.classroom)?.name || "Salle inconnue",
            };
    
            setSchedule(updatedSchedule);
    
            // Rafraîchir les sessions depuis le backend
            fetchTimetableSessions();
    
            // Fermer le modal
            handleCloseModal();
        } catch (error) {
            console.error("Erreur lors de l'ajout de la séance :", error.response?.data || error.message);
        } finally {
            setLoadingAddTimeSlot(false);
        }
    };
    
    
    useEffect(() => {
        const fetchAllSubjects = async () => {
            try {
                const allSubjects = await fetchSubjects(SchoolId);
                setSubjects(allSubjects);
            } catch (error) {
                console.error("Erreur lors de la récupération des matières :", error);
            }
        };
    
        fetchAllSubjects();
    }, [SchoolId]);
    
    
    const handleTimeslotChange = (index, field, value) => {
        const updatedTimeslots = [...customTimeslots];
        updatedTimeslots[index][field] = value;
        setCustomTimeslots(updatedTimeslots);
    };

    const handleToggleTimeSlotTable = () => {
        setActiveTable(activeTable === 'timeSlots' ? null : 'timeSlots');
        setShowTable(!showTable);
    };
    
    const handleDeleteTimeslot = (index) => {
        const updatedTimeslots = customTimeslots.filter((_, i) => i !== index);
        setCustomTimeslots(updatedTimeslots);
    };

    const printTable = (levelId) => {
        const levelName = educationLevels.find(level => level.id === parseInt(levelId))?.name || "Niveau inconnu"; // Récupérer le nom du niveau d'éducation
        const printContents = document.getElementById(`table-${levelId}`).outerHTML; // Utiliser outerHTML pour inclure la table complète
        const newWindow = window.open('', '_blank', 'width=800,height=600');
    
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Impression de l'emploi du temps</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                                font-size: 12px; /* Réduction de la taille globale de la police */
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 10px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px; /* Réduction de l'espacement */
                                text-align: center;
                                vertical-align: middle;
                                font-size: 11px; /* Réduction de la taille de la police dans les cellules */
                            }
                            th {
                                background-color: #007bff;
                                color: white;
                            }
                            td h4 {
                                color: gray;
                                font-weight: lighter;
                                font-size: 10px; /* Réduction de la taille pour les titres internes */
                            }
                            strong {
                                font-weight: bold;
                            }
                            i {
                                font-style: italic;
                                color: gray;
                                font-size: 10px; /* Réduction de la taille pour les éléments en italique */
                            }
                        </style>
                    </head>
                    <body>
                        <h4>Emploi du Temps - ${levelName}</h4> <!-- Ajouter le niveau d'éducation -->
                        ${printContents} <!-- Inclure le tableau complet -->
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    };
    

    const exportToXLSX = (levelName, schedule) => {
        const data = [];
    
        // Ajoute une ligne d'en-tête
        const headerRow = ['Heure/Jour', ...daysOfWeek];
        data.push(headerRow);
    
        // Ajoute les lignes des créneaux horaires
        timeSlots.forEach(slot => {
            const row = [slot];
            daysOfWeek.forEach(day => {
                const session = schedule[day][slot];
                if (session) {
                    row.push(`${session.subject}\n${session.teacherName}\n${session.classroom}`);
                } else {
                    row.push('Pas de session');
                }
            });
            data.push(row);
        });
    
        // Convertit les données en feuille XLSX
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, levelName);
    
        // Télécharge le fichier
        XLSX.writeFile(workbook, `${levelName}_Emploi_du_Temps.xlsx`);
    };
    

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrer les enseignants en fonction du terme de recherche
    const filteredTeachers = teachers.filter((teacher) => {
        const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const filteredAvailabilities = teacherAvailabilities.filter((availability) =>
        filteredTeachers.some((teacher) => teacher.id === availability.teacher)
    );

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setModalData({ ...modalData, [name]: value });

        if (name === "subject" && value) {
            try {
                const teachers = await fetchTeachersBySubject(value); // API pour récupérer les enseignants par matière
                console.log("Teachers fetched:", teachers); // Log pour déboguer
                setAvailableTeachers(teachers); // Mise à jour des enseignants disponibles
            } catch (error) {
                console.error("Erreur lors de la récupération des enseignants:", error);
                setAvailableTeachers([]); // Réinitialiser en cas d'erreur
            }
        }
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5); // Extrait uniquement les heures et minutes (HH:mm)
    };    

    

    // Regrouper les sessions par niveau d'éducation
    const sessionsByLevel = educationLevels.reduce((acc, level) => {
        const levelSessions = timetableSessions.filter(session => session.education_level === level.id);
    
        const levelSchedule = {};
    
        // Initialiser l'emploi du temps pour chaque jour et créneau horaire
        days.forEach(day => {
            levelSchedule[day] = {};
            timeSlots.forEach(slot => {
                levelSchedule[day][slot.start_time] = null; // Chaque cellule est initialisée à null
            });
        });
    
        // Remplir l'emploi du temps avec les sessions
        levelSessions.forEach(session => {
            const subject = subjects.find(subj => subj.id === session.subject)?.name || <PulseLoader   color="#4e7dad" size={8} />;
            const teacher = teachers.find(teach => teach.id === session.teacher);
            const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : <PulseLoader   color="#ffcc00" size={8} />;
            const classroom = classrooms.find(room => room.id === session.classroom)?.name ;
    
            // Associer la session à l'heure et au jour appropriés
            levelSchedule[session.day][session.start_time] = {
                subject,
                teacherName,
                classroom,
            };
        });
    
        acc[level.id] = levelSchedule;
        return acc;
    }, {});
    
    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    // const timeSlots = ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00"];
    return (
        <div>
            <div className="timeslot-management">
                {/* Bouton pour afficher/masquer la table */}
                <button
                    onClick={() => setActiveTable(activeTable === 'timeSlots' ? null : 'timeSlots')}
                    className="toggle-table-button"
                >
                    <MdOutlineSettings style={{ marginRight: '13px', fontSize: '28px' }} />
                    {activeTable === 'timeSlots' ? 'Masquer les Créneaux' : 'Gestion des Créneaux Horaires'}
                </button>

                {/* Afficher la table uniquement si showTable est true */}
                {activeTable === 'timeSlots' && (
                    <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th>Heure de début</th>
                                <th>Heure de fin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((slot) => (
                                <tr key={slot.id}>
                                    <td>
                                        {editingTimeSlot?.id === slot.id ? (
                                            <input
                                                type="time"
                                                value={formatTime(editingTimeSlot.start)}
                                                onChange={(e) =>
                                                    setEditingTimeSlot({ ...editingTimeSlot, start: e.target.value })
                                                }
                                            />
                                        ) : (
                                            formatTime(slot.start_time)
                                        )}
                                    </td>
                                    <td>
                                        {editingTimeSlot?.id === slot.id ? (
                                            <input
                                                type="time"
                                                value={editingTimeSlot.end}
                                                onChange={(e) =>
                                                    setEditingTimeSlot({ ...editingTimeSlot, end: e.target.value })
                                                }
                                            />
                                        ) : (
                                            formatTime(slot.end_time)
                                        )}
                                    </td>
                                    
                                    <td>
                                        {editingTimeSlot?.id === slot.id ? (
                                            <div className="button-group">
                                                <button
                                                    className="edit-student-button"
                                                    onClick={() =>
                                                        handleEditTimeSlot(slot.id, editingTimeSlot.start, editingTimeSlot.end)
                                                    }
                                                >
                                                    Sauvegarder
                                                </button>
                                                <button
                                                    onClick={() => setEditingTimeSlot(null)}
                                                    className="student-button-delete"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="button-group">
                                                <button
                                                    onClick={() =>
                                                        setEditingTimeSlot({ ...slot, start: slot.start_time, end: slot.end_time })
                                                    }
                                                    className="edit-student-button"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTimeSlot(slot.id)}
                                                    className="student-button-delete"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td>
                                    <input
                                        type="time"
                                        value={newTimeSlot.start}
                                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="time"
                                        value={newTimeSlot.end}
                                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                                    />
                                </td>
                                <td>
                                    <button onClick={handleAddTimeSlot} className='add-timeslot-button'>Ajouter</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
            <div className='whitetext'>Scolara</div>
            <div className="student-list-title">
                <h3>Créer Emploi du Temps</h3>
            </div>

            <select value={selectedLevel} onChange={handleLevelChange} className="student-input-education-level">
                <option value="">Sélectionner un niveau d'éducation</option>
                {educationLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                ))}
            </select>

            <button onClick={handleCreateTimetable} className="education-level-button">
                <i className="fas fa-plus icon-yellow"></i> Créer Emploi du Temps
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
                            {timeSlots.map((slot) => (
                                <tr key={slot.id}>
                                    <td>{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</td>
                                    {days.map((day) => (
                                        <td key={day}>
                                            {schedule[day] && schedule[day][slot.start_time] ? (
                                                <>
                                                    <div><strong>{schedule[day][slot.start_time].subject}</strong></div>
                                                    <div>{`${schedule[day][slot.start_time].teacher.first_name} ${schedule[day][slot.start_time].teacher.last_name}`}</div>
                                                    <div><i>{schedule[day][slot.start_time].classroom}</i></div>
                                                </>
                                            ) : (
                                                <button onClick={() => handlePlusClick(day, slot)}>
                                                    <i className="fas fa-plus icon-yellow"></i>
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

            <div className='whitetext'>Scolara</div>
            <div className='whitetext'>Scolara</div>

            {/* Affichage des sessions par niveau d'éducation */}
            <div className="student-list-title">
                <h3>Emploi du Temps par Niveau d'Éducation</h3>
            </div>

            {educationLevels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                    {/* Aucun niveau d'éducation disponible. */}
                </div>
            ) : (
                Object.entries(sessionsByLevel).map(([levelId, schedule]) => {
                    const levelName = educationLevels.find(level => level.id === parseInt(levelId))?.name || "Niveau inconnu";

                    return (
                        <div key={levelId} style={{ marginBottom: '20px' }}>
                            <div className='timetable-action-buttons'>
                                <h4>{levelName}</h4>
                                <button
                                    onClick={() => exportTimetableToXLSX(levelName, schedule)}
                                    className="timetable-xlsx-download-button"
                                    style={{ marginBottom: '10px' }}
                                >
                                    Exporter en XLSX
                                </button>
                                <button
                                    onClick={() => printTimetable(levelId)}
                                    className="timetable-print-button"
                                >
                                    <FontAwesomeIcon icon={faPrint} /> Imprimer
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                    <PuffLoader color="#007bff" size={60} />
                                </div>
                            ) : (
                                <table
                                    id={`table-${levelId}`}
                                    border="1"
                                    style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Heure/Jour</th>
                                            {days.map(day => (
                                                <th key={day}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.length === 0 || Object.keys(schedule).length === 0 ? (
                                            <tr>
                                                <td colSpan={days.length + 1} style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                                                    Aucune session disponible.
                                                </td>
                                            </tr>
                                        ) : (
                                            timeSlots.map(slot => (
                                                <tr key={slot.start_time}>
                                                    <td>{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</td>
                                                    {days.map(day => (
                                                        <td key={day}>
                                                            {schedule[day][slot.start_time] ? (
                                                                <>
                                                                    <div><strong>{schedule[day][slot.start_time].subject}</strong></div>
                                                                    <div>{schedule[day][slot.start_time].teacherName}</div>
                                                                    <div><i>{schedule[day][slot.start_time].classroom}</i></div>
                                                                </>
                                                            ) : (
                                                                "Pas de session"
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    );
                })
            )}


            
            {showModal && modalData && (
                <div className="modal" style={modalStyle}>
                    <div className="modal-content" style={modalContentStyle}>
                        <h3>Ajouter une séance</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Jour: </label>
                                <input type="text" value={modalData.day} readOnly />
                            </div>
                            <div>
                                <label>Heure de début: </label>
                                <input type="time" value={modalData.start_time} readOnly />
                            </div>
                            <div>
                                <label>Heure de fin: </label>
                                <input type="time" value={modalData.end_time} readOnly />
                            </div>
                            <div>
                                <label>Matière: </label>
                                <select name="subject" value={modalData.subject} onChange={handleInputChange} required>
                                    <option value="">Sélectionnez une matière</option>
                                    {filteredSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Enseignant: </label>
                                <select name="teacher" value={modalData.teacher} onChange={handleInputChange}>
                                    <option value="">Sélectionnez un enseignant</option>
                                    {availableTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
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

            <div className='whitetext'>Scolara</div>
            <div className='whitetext'>Scolara</div>
            <div>
                <div className='student-list-title'>
                    <h3>Disponibilités des Enseignants</h3>
                </div>
                <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un enseignant..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Enseignant</th>
                            <th>Jour</th>
                            <th>Heure de début</th>
                            <th>Heure de fin</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAvailabilities.length > 0 ? (
                            filteredAvailabilities.map((availability, index) => {
                                const teacher = teachers.find(t => t.id === availability.teacher); // Trouver l'enseignant correspondant
                                return (
                                    <tr key={index}>
                                        <td>{teacher ? `${teacher.first_name} ${teacher.last_name}` : "Inconnu"}</td>
                                        <td>{availability.day}</td>
                                        <td>{availability.start_time}</td>
                                        <td>{availability.end_time}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteAvailability(availability.id)}
                                                className='delete-availability'
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                                    Aucune disponibilité trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        <div className='whitetext'>Scolara</div>
        <div className='whitetext'>Scolara</div>
        {loadingaddtimeslot && (
            <div className="overlay-loader">
                <div className="CRUD-loading-container">
                    <MoonLoader size={50} color="#ffcc00" loading={loadingaddtimeslot} />
                </div>
            </div>
        )}
        {loadingeditimeslot && (
            <div className="overlay-loader">
                <div className="CRUD-loading-container">
                    <MoonLoader size={50} color="#ffcc00" loading={loadingeditimeslot} />
                </div>
            </div>
        )}
        {loadingdeletetimeslot && (
            <div className="overlay-loader">
                <div className="CRUD-loading-container">
                    <MoonLoader size={50} color="#ffcc00" loading={loadingdeletetimeslot} />
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
