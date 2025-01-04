import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchBulletinGrades , fetchSubjectStatistics , fetchGeneralAverage , fetchGeneralEducationLevelAverage} from '../../APIServices';
import axios from 'axios';
import './BulletinHeader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône d'impression
import { PuffLoader } from 'react-spinners';

const API_URL = 'https://scolara-backend.onrender.com/api';

const BulletinHeader = React.forwardRef((props, ref) => {
    const { studentId } = useParams();
    const [school, setSchool] = useState(null);
    const [student, setStudent] = useState(null);
    const [className, setClassName] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [coefficients, setCoefficients] = useState({});
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appreciation, setAppreciation] = useState('');
    const [generalAverage, setGeneralAverage] = useState(null); // État pour la moyenne générale
    const [generalEducationLevelAverage, setGeneralEducationLevelAverage] = useState(null); // État pour la moyenne générale

    const educationlevelId = Cookies.get('selectedEducationLevel');
    const schoolId = Cookies.get('SchoolId');
    const [honors, setHonors] = useState({
        felicitations: false,
        tableauHonneur: false,
        encouragements: false,
    });    
    

    useEffect(() => {
        const calculateSchoolYear = () => {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const startYear = currentMonth < 7 ? currentYear - 1 : currentYear;
            const endYear = startYear + 1;
            setSchoolYear(`${startYear}-${endYear}`);
        };

        calculateSchoolYear();

        const fetchSchoolData = async () => {
            try {
                const response = await axios.get(`${API_URL}/school/${schoolId}/`);
                setSchool(response.data);
            } catch (err) {
                console.error("Error fetching school data:", err);
                setError("Unable to load school information.");
            }
        };

        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`${API_URL}/users/${studentId}/`);
                setStudent(response.data);

                const educationLevelId = response.data.education_level;
                if (educationLevelId) {
                    const educationLevelResponse = await axios.get(`${API_URL}/educationlevel/${educationLevelId}/`);
                    setClassName(educationLevelResponse.data.name || 'Non spécifiée');

                    const subjectsResponse = await axios.get(`${API_URL}/subjects/?education_level_id=${educationLevelId}`);
                    setSubjects(subjectsResponse.data);

                    const gradesPromises = subjectsResponse.data.map(async (subject) => {
                        const subjectGrades = await fetchBulletinGrades(studentId, subject.id);
                        return { subjectId: subject.id, grades: subjectGrades };
                    });

                    const allGrades = await Promise.all(gradesPromises);
                    setGrades(allGrades);
                    const statisticsPromises = subjectsResponse.data.map(async (subject) => {
                        const stats = await fetchSubjectStatistics(subject.id);
                        return { subjectId: subject.id, ...stats };
                    });

                    const allStatistics = await Promise.all(statisticsPromises);
                    const statisticsMap = allStatistics.reduce((acc, stat) => {
                        acc[stat.subject_id] = stat;
                        return acc;
                    }, {});
                    setStatistics(statisticsMap);
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
                setError("Toutes les notes ne sont pas encore prêtes. Veuillez vérifier ultérieurement.");
            }
        };

        const fetchGeneralAverageData = async () => {
            try {
                const average = await fetchGeneralAverage(studentId);
                setGeneralAverage(average);
            } catch (err) {
                console.error("Error fetching general average:", err);
                setGeneralAverage('N/A'); // En cas d'erreur
            }
        };

        const fetchGeneralEducationLevelAverageData = async () => {
            try {
                const educationlevelaverage = await fetchGeneralEducationLevelAverage(educationlevelId);
                setGeneralEducationLevelAverage(educationlevelaverage);
            } catch (err) {
                console.error("Error fetching general education level average:", err);
                setGeneralEducationLevelAverage('N/A'); // En cas d'erreur
            }
        };

        const fetchData = async () => {
            if (schoolId && studentId) {
                await Promise.all([fetchSchoolData(), fetchStudentData(),fetchGeneralAverageData(),fetchGeneralEducationLevelAverageData()]);
            } else {
                setError("Missing School ID or Student ID.");
            }
            setLoading(false);
        };

        fetchData();
    }, [schoolId, studentId]);


    const printBulletin = () => {

        const printableHonors = `
        <table class="summary-average-table">
            <tbody>
                <tr>
                    <td class='bulletin-td'>Moyenne Générale </td>
                    <td class='bulletin-td'><strong>${generalAverage || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class='bulletin-td'>Moyenne Générale de la classe </td>
                    <td class='bulletin-td'><strong>${generalEducationLevelAverage || 'N/A'}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="flex-container">
            <table class="summary-table">
                <tbody>
                    <tr>
                        <td>Nombre d'absences :</td>
                        <td>${student ? student.absences_number : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Appréciation de l'Équipe Pédagogique :</td>
                        <td>
                            <div>
                                <p>${appreciation}</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table class="honor-table">
                <tbody>
                    <tr>
                        <td class="honor-box">${honors.felicitations ? '☑' : '☐'}</td>
                        <td>Félicitations</td>
                    </tr>
                    <tr>
                        <td class="honor-box">${honors.tableauHonneur ? '☑' : '☐'}</td>
                        <td>Tableau d'honneur</td>
                    </tr>
                    <tr>
                        <td class="honor-box">${honors.encouragements ? '☑' : '☐'}</td>
                        <td>Encouragements</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class='signature-chef'><strong>Signature du Chef d'Etablissement ou de son Adjointe</strong></div>
    `;

        
        const printContents = document.getElementById('bulletin').innerHTML;
        const newWindow = window.open('', '_blank', 'width=800,height=600');

        
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Bulletin</title>
                        <style>
                            /* General Styles */
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
    
                            /* Page Setup for A4 */
                            @page {
                                size: A4;
                                margin: 20mm;
                            }
    
                            html, body {
                                width: 210mm;
                                height: 297mm;
                            }
    
                            /* Bulletin Styles */
                            .bulletin-header {
                                border: 1px solid #000;
                                padding: 10px;
                                font-size: 12px;
                                line-height: 1.5;
                                background-color: #fff;
                                margin-bottom: 10px;
                                position: relative;
                            }
    
                            .bulletin-header-title {
                                text-align: center;
                                font-size: 16px;
                                font-weight: bold;
                                margin-bottom: 10px;
                            }

                            .signature-chef{
                                margin-right: 40px;
                                margin-bottom: 200px;
                                text-align: right;
                                font-size:10px;
                            }


                            .student-grades-table{
                                /* border-collapse: collapse; */
                                width: auto;
                                margin-bottom: 10px;
                                margin-top: 50px;
                                margin-left:450px;
                                font-size: 14px;
                                text-align: center;   
                            }
    
                            .bulletin-header-content {
                                display: flex;
                                justify-content: space-between;
                            }
    
                            .bulletin-header-left,
                            .bulletin-header-right {
                                width: 45%;
                            }
    
                            .bulletin-header-left {
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                            }
    
                            .bulletin-header-right {
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                                text-align: left;
                            }
                            
                            .whitetext {
                                color:white;
                            }

                            .action-buttons{
                                display: flex;
                                justify-content: center;
                                gap: 10px;
                            }

                            .bulletin-student-name {
                                font-weight: bold;
                                font-size: 14px;
                                margin-bottom: 70px;
                                margin-left:200px;
                                margin-top:-55px;
                            }
    
                            .bulletin-student-info-1 {
                                margin-top: 30px;
                                margin-left:-120px;
                            }
    
                            .bulletin-student-info-2 {
                                margin-top: 0px;
                                margin-left: 120px;
                            }
    
                            .bulletin-logo {
                                width: 60px;
                                height: auto;
                                margin-top: -50px;
                                margin-bottom : 30px;
                            }
    
                            .bulletin-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 50px;
                                border: 1px solid black;
                            }
    
                            .bulletin-th, .bulletin-td {
                                border: 1px solid black;
                                padding: 10px;
                                text-align: center;
                            }
    
                            .bulletin-th {
                                background-color: white;
                                color: black;
                                font-weight: bold;
                                font-size:12px;
                            }
    
                            .bulletin-td {
                                background-color: #f9f9f9;
                            }
    
                            .bulletin-table tr:nth-child(even) .bulletin-td {
                                background-color: #f1f1f1;
                            }

                            .honor-section {
                                margin-top: 20px;
                                display: flex;
                                justify-content: center;
                            }

                            .honor-table {
                                border-collapse: collapse;
                                width: 50px;
                                margin-bottom: 100px;
                                margin-top: 57px;
                                margin-right:100px;
                                font-size: 14px;
                                text-align: left;
                            }

                            .honor-table td {
                                padding: 5px 10px;
                                border: 1px solid black;
                            }

                            .honor-box input[type="checkbox"] {
                                width: 20px;
                                height: 20px;
                                margin: 0;
                            }

                            .summary-section {
                                margin-top: 20px;
                                display: flex;
                                justify-content: center;
                            }

                            .summary-table {
                                width: 60%;
                                border: 1px solid black;
                                border-collapse: collapse;
                                font-size: 14px;
                                margin-left:100px;
                                margin-top:65px;
                                text-align: left;
                            }

                            .summary-average-table {
                                width: 30%;
                                border: 1px solid black;
                                border-collapse: collapse;
                                font-size: 14px;
                                margin-left:300px;
                                margin-top:65px;
                                text-align: left;
                            }
                            
                            .bulletin-th-comments {
                                width: 45%; /* Ajustez ce pourcentage selon vos besoins */
                            }

                            .summary-table td {
                                border: 1px solid black;
                                padding: 10px;
                                vertical-align: top;
                            }

                            .summary-table td:first-child {
                                font-weight: bold;
                                width: 50%;
                            }

                            .flex-container {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                gap: 40px; /* Espace entre les deux sections */
                                margin-top: 10px;
                            }

                            .honor-section, .summary-section {
                                flex: 1; /* Permet aux deux sections de prendre une largeur égale */
                                max-width: 48%; /* Ajuste la largeur maximale des sections */
                            }

                            /* Ensure footer or extra content doesn't overflow */
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 0;
                                }
                                .bulletin-header, .bulletin-table {
                                    page-break-inside: avoid;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContents}
                        ${printableHonors}
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    };
    
    const handleHonorChange = (key) => {
        setHonors((prevState) => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    const calculateFinalGrade = (subjectGrades, coefficient = 1) => {
        let totalGrade = 0;
        let totalCoefficient = 0;

        subjectGrades.forEach((grade) => {
            totalGrade += grade.score * coefficient;
            totalCoefficient += coefficient;
        });

        return totalCoefficient ? (totalGrade / totalCoefficient).toFixed(2) : 'N/A';
    };  

    const handleCoefficientChange = (subjectId, value) => {
        setCoefficients((prev) => ({
            ...prev,
            [subjectId]: parseFloat(value) || 0, // Ensure valid number or default to 0
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center',
                fontSize: '18px',
                color: '#666',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
            }}>
                {error}
            </div>
        );
    }
    

    return (
        <div ref={ref}>
            <button onClick={printBulletin} className="print-button">
                <FontAwesomeIcon icon={faPrint} /> Imprimer Bulletin
            </button>
            <div id="bulletin">
            <div className="bulletin-header">
                <div className="bulletin-header-title">
                    <h3>{school.name}</h3>
                </div>
                <div className="bulletin-header-content">
                    <div className="bulletin-header-left">
                        {school.logo ? (
                            <img src={school.logo} alt={`${school.name} logo`} className="bulletin-logo" />
                        ) : (
                            <p>No logo available</p>
                        )}
                        <p><strong>{school.address || 'Adresse non spécifiée'}</strong></p>
                        <p><strong>{school.phone_number ? `Téléphone : ${school.phone_number}` : 'Téléphone non spécifié'}</strong></p>
                    </div>
                    <div className="bulletin-header-right">
                        <div className="bulletin-student-name">
                            <p>
                                {/* <strong>Nom et Prénom :</strong>{' '} */}
                                {student ? `${student.last_name} ${student.first_name}` : 'N/A'}
                            </p>
                        </div>
                        <div className="action-buttons">
                            <p className='bulletin-student-info-1'><strong>Classe :</strong> {className}</p>
                            <div className='bulletin-student-info-2'>
                                <p ><strong>Année scolaire :</strong> {schoolYear}</p>
                                <p ><strong>Semestre:</strong> {school?.semestre || 'Non spécifié'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="subjects-table">
                <table className='bulletin-table'>
                    <thead>
                        <tr>
                            <th className='bulletin-th' rowSpan="2">Matière</th>
                            <th className='bulletin-th' rowSpan="2">Notes</th>
                            <th className='bulletin-th' rowSpan="2">Coéfficient</th>
                            <th className='bulletin-th' colSpan="3">Classe</th>
                            <th className='bulletin-th bulletin-th-comments' rowSpan="2">Appréciations des professeurs</th>
                            </tr>
                        <tr>
                            <th className='bulletin-th'>Moy</th>
                            <th className='bulletin-th'>Mini</th>
                            <th className='bulletin-th'>Maxi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length > 0 ? (
                            subjects.map((subject) => {
                                const stats = statistics[subject.id] || { avg_grade: 'N/A', min_grade: 'N/A', max_grade: 'N/A' };
                                const subjectGrades = grades.find((g) => g.subjectId === subject.id)?.grades || [];
                                const coefficient = coefficients[subject.id] || 1; // Default coefficient to 1
                                const finalGrade = calculateFinalGrade(subjectGrades, coefficient);
                                return (
                                    <tr key={subject.id}>
                                        <td className='bulletin-td'>{subject.name}</td>
                                        <td className='bulletin-td'><strong>{finalGrade}</strong></td>
                                        <td className='bulletin-td'>{subject.coefficient}</td>
                                        <td className='bulletin-td'>{stats.avg_grade}</td>
                                        <td className='bulletin-td'>{stats.min_grade}</td>
                                        <td className='bulletin-td'>{stats.max_grade}</td>
                                        <td className='bulletin-td comments-column'>{subjectGrades.comments }</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7">Aucune matière trouvée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>
            <table className="student-grades-table">
                <tbody>
                    <tr>
                        <td className='bulletin-td'>Moyenne Générale </td>
                        <td className='bulletin-td'><strong>{generalAverage || 'N/A'}</strong></td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td className='bulletin-td'>Moyenne Générale de la classe </td>
                        <td className='bulletin-td'><strong>{generalEducationLevelAverage || 'N/A'}</strong></td>
                    </tr>
                </tbody>
            </table>
            <div className="flex-container">
                <div className="summary-section">
                <table className="summary-table">
                    <tbody>
                        <tr>
                            <td>Nombre d'absences :</td>
                            <td><strong>{student ? student.absences_number : '0'}</strong></td>
                        </tr>
                        <tr>
                            <td>Appréciation de l'Équipe Pédagogique :</td>
                            <td>
                                <textarea
                                    value={appreciation}
                                    onChange={(e) => setAppreciation(e.target.value)}
                                    rows="4"
                                    placeholder="Saisissez l'appréciation ici..."
                                    style={{ width: '80%', padding: '15px', fontSize: '14px' }}
                                ></textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>

                <div className="honor-section">
                    <table className="honor-table">
                        <tbody>
                            <tr>
                                <td className="honor-box">
                                    <input
                                        type="checkbox"
                                        checked={honors.felicitations}
                                        onChange={() => handleHonorChange('felicitations')}
                                    />
                                </td>
                                <td>Félicitations</td>
                            </tr>
                            <tr>
                                <td className="honor-box">
                                    <input
                                        type="checkbox"
                                        checked={honors.tableauHonneur}
                                        onChange={() => handleHonorChange('tableauHonneur')}
                                    />
                                </td>
                                <td>Tableau d'honneur</td>
                            </tr>
                            <tr>
                                <td className="honor-box">
                                    <input
                                        type="checkbox"
                                        checked={honors.encouragements}
                                        onChange={() => handleHonorChange('encouragements')}
                                    />
                                </td>
                                <td>Encouragements</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='signature-chef'><strong>Signature du Chef d'Etablissement ou de son Adjointe</strong></div>
            <div className='scolara'>scolra</div>
        </div>
        
    );
});

export default BulletinHeader;