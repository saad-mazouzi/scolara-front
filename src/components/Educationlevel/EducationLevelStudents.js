import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { fetchStudentsByEducationLevel, fetchTimeSlots } from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import './EducationLevel.css';
import { PuffLoader } from 'react-spinners';

const EducationLevelStudents = () => {
    const { id } = useParams(); 
    const [cookies] = useCookies(['SchoolId']); 
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formatTime = (timeString) => {
        return timeString.slice(0, 5); // Format HH:MM uniquement
    };

    useEffect(() => {
        const getStudentsAndTimeSlots = async () => {
            try {
                setLoading(true);
                const schoolId = cookies.SchoolId;

                const [studentsData, timeSlotsData] = await Promise.all([
                    fetchStudentsByEducationLevel(schoolId, id),
                    fetchTimeSlots(schoolId)
                ]);

                const sortedStudents = studentsData.sort((a, b) => {
                    const fullNameA = `${a.last_name} ${a.first_name}`.toLowerCase();
                    const fullNameB = `${b.last_name} ${b.first_name}`.toLowerCase();
                    return fullNameA.localeCompare(fullNameB);
                });

                setStudents(sortedStudents);
                setTimeSlots(timeSlotsData);

            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };
        getStudentsAndTimeSlots();
    }, [id, cookies.SchoolId]);

    const printAttendanceList = () => {
        const printContents = document.getElementById('attendance-list').innerHTML;
        const newWindow = window.open('', '_blank', 'width=800,height=600');
    
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Liste d'Appel</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 10px;
                                margin: 20px;
                            }
                            .students-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                                font-size: 12px;
                            }
                            .students-table th,
                            .students-table td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                            .signature-liste-appel {
                                margin-top: 50px;
                                margin-right : 150px;
                                text-align: right;
                                margin-bottom: 100px;
                            }
                            .middle-text {
                                color: black;
                                text-align: center;
                                margin-top: 30px;
                                margin-bottom: 40px;
                            }
                            .students-table th.small-column,
                            .students-table td.small-column {
                                width: 100px;
                            }
                            .students-table th.large-column,
                            .students-table td.large-column {
                                width: 200px;
                            }
                            .students-table th {
                                background-color: #252628;
                                font-weight: bold;
                            }
                            .students-table tr:nth-child(even) {
                                background-color: #f9f9f9;
                            }
                            .student-list-title h3 {
                                text-align: center;
                            }
                            .signature-liste-appel {
                                margin-top: 50px;
                                text-align: right;
                            }
                        </style>
                    </head>
                    <body>
                        ${printContents}
                    </body>
                    <script>
                        // Attendre que tout soit bien chargé avant impression
                        window.onload = () => {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        };
                    </script>
                </html>
            `);
            newWindow.document.close();
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
        return <div>{error}</div>;
    }

    return (
        <div className="education-level-students-container">
            <button onClick={printAttendanceList} className="print-button">
                <FontAwesomeIcon icon={faPrint} /> Imprimer la Liste
            </button>
            <div id="attendance-list">
                <div className='student-list-title'>
                    <h3>Liste d'Appel</h3>
                </div>
                <div className='middle-text'>{currentDate}</div>
                {students.length === 0 ? (
                    <div>Aucun étudiant trouvé pour ce niveau d'éducation.</div>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Nom Prénom</th>
                                {timeSlots.map((slot) => (
                                    <th key={slot.id}>{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</th>
                                ))}
                                <th>Remarques</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{index + 1}</td>
                                    <td>{student.last_name} {student.first_name}</td>
                                    {timeSlots.map((slot) => (
                                        <td key={slot.id}></td>
                                    ))}
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className='signature-liste-appel'>Signature :</div>
            </div>
        </div>
    );
};

export default EducationLevelStudents;
