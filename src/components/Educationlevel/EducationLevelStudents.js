import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { fetchStudentsByEducationLevel } from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône d'impression
import './EducationLevel.css';

const EducationLevelStudents = () => {
    const { id } = useParams(); // Récupérer l'id du niveau d'éducation depuis l'URL
    const [cookies] = useCookies(['SchoolId']); // Récupérer school_id des cookies
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const timeSlots = [
        '8:00-10:00',
        '10:00-12:00',
        '12:00-14:00',
        '14:00-16:00',
        '16:00-18:00',
    ];

    // Obtenir la date actuelle
    const currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        const getStudents = async () => {
            try {
                setLoading(true);
                const schoolId = cookies.SchoolId; // Obtenir l'ID de l'école des cookies
                const data = await fetchStudentsByEducationLevel(schoolId, id); // Appeler l'API pour récupérer les étudiants
                
                // Trier les étudiants par ordre alphabétique (nom puis prénom)
                const sortedStudents = data.sort((a, b) => {
                    const fullNameA = `${a.last_name} ${a.first_name}`.toLowerCase();
                    const fullNameB = `${b.last_name} ${b.first_name}`.toLowerCase();                    
                    return fullNameA.localeCompare(fullNameB);
                });

                setStudents(sortedStudents); // Mettre à jour la liste triée des étudiants
            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des étudiants');
            } finally {
                setLoading(false);
            }
        };
        getStudents();
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
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 10px; /* Taille de la police réduite */
                                margin: 20px;
                            }
                            .students-table {
                                width: 100%;
                                margin-top:50px;
                                border-collapse: collapse;
                            }
                            .students-table th, .students-table td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                                font-size: 10px; /* Taille de la police des cellules */
                            }
                            .students-table th {
                                background-color: #f4f4f4;
                            }
                            .student-list-title h3 {
                                text-align: center;
                                font-size: 12px; /* Taille légèrement plus grande pour le titre */
                            }
                            .middle-text {
                                text-align: center;
                                margin-bottom: 20px;
                                font-size: 10px; /* Taille pour le texte du centre */
                            }
                            
                            .signature-liste-appel {
                                margin-top: 50px;
                                margin-right : 150px;
                                text-align: right;
                                margin-bottom: 100px;
                            }

                        </style>
                    </head>
                    <body>
                        ${printContents}
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    };
    
    
    if (loading) {
        return <div>Chargement...</div>;
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
                    <p>Aucun étudiant trouvé pour ce niveau d'éducation.</p>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Nom Prénom</th>
                                {timeSlots.map((slot) => (
                                    <th key={slot} className="small-column">{slot}</th>
                                ))}
                                <th className="large-column">Remarques</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{index + 1}</td> {/* Numéro séquentiel */}
                                    <td>
                                        {student.last_name} {student.first_name}
                                    </td>
                                    {timeSlots.map((slot) => (
                                        <td key={slot} className="small-column"></td> 
                                    ))}
                                    <td className="large-column"></td>
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