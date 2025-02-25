import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa'; 
import {
  fetchStudentById,
  updateStudentAbsence,
  updateStudentProfilePicture,
  updateStudent,
  fetchEducationLevelsBySchool,
  markStudentAsPaid,
  updateStudentSalary,
  fetchParents,
  createParent,
  sendSMS
} from '../../APIServices';
import Cookies from 'js-cookie';
import './Student.css';
import { ScaleLoader,MoonLoader } from 'react-spinners';
import axios from 'axios';

const StudentProfile = () => {
  const API_URL = 'https://scolara-backend.onrender.com/api';  
  const { id } = useParams();
  const [parentName, setParentName] = useState(null);
  const [remark, setRemark] = useState(""); // État pour la remarque
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parents, setParents] = useState([]);
  const today = new Date().toLocaleDateString('fr-FR'); 
  const [absenceCount, setAbsenceCount] = useState(0);
  const [school, setSchool] = useState('null');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [educationLevels, setEducationLevels] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loadingform, setLoadingForm] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [newParent, setNewParent] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [useExistingParent, setUseExistingParent] = useState(true);
  const schoolName = Cookies.get('SchoolName');
  const schoollogo = Cookies.get('SchoolLogo');
  const [showSMSPopup, setShowSMSPopup] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');


  useEffect(() => {
    const getStudentData = async () => {
      const schoolId = Cookies.get('SchoolId');
      try {
        const studentData = await fetchStudentById(id);
        setStudent(studentData);
        setRemark(studentData.remark || ""); 
        setAbsenceCount(studentData.absences_number || 0);
        setMonthlyPayment(studentData.monthly_payment || 0);
    
        // Charger les niveaux d'éducation
        const levelsData = await fetchEducationLevelsBySchool(schoolId);
        setEducationLevels(levelsData);
        setSelectedLevel(studentData.education_level);
        setProfilePicture(studentData.profile_picture);
    
        // Charger le nom du parent
        if (studentData.parent) {
          const parentData = await fetchParents(schoolId);
          const parentDetails = parentData.find(parent => parent.id === studentData.parent);
          if (parentDetails) {
            setParentName(`${parentDetails.first_name} ${parentDetails.last_name}`);
          }
        } else {
          setParentName("Non spécifié");
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données de l\'étudiant:', err);
        setError('Impossible de récupérer les données.');
      } finally {
        setLoading(false);
      }

      const fetchSchoolData = async () => {
        try {
            const response = await axios.get(`${API_URL}/school/${schoolId}/`);
            setSchool(response.data);
        } catch (err) {
            console.error("Error fetching school data:", err);
            setError("Unable to load school information.");
        }
    };
    };
    

    getStudentData();
  }, [id]);

  useEffect(() => {
    const getData = async () => {
      try {
        const studentData = await fetchStudentById(id);
        setStudent(studentData);

        const parentsData = await fetchParents(Cookies.get('SchoolId')); // Récupère les parents existants
        setParents(parentsData);

        setSelectedParent(studentData.parent_id || null); // Initialiser avec le tuteur actuel
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  const handlePaymentReminder = async () => {
      setLoadingForm(true);
      try {
          if (student.parent) {
              const parentData = await fetchParents(Cookies.get('SchoolId'));
              const parentDetails = parentData.find(parent => parent.id === student.parent);

              if (parentDetails && parentDetails.phone_number) {
                  setParentPhoneNumber(parentDetails.phone_number);
                  setSmsMessage(`Bonjour, ceci est un rappel de paiement pour la mensualité de votre enfant ${student.first_name} ${student.last_name}. Merci de régulariser le paiement dès que possible.`);
                  setShowSMSPopup(true);
              } else {
                  alert("Le numéro de téléphone du tuteur est manquant.");
              }
          } else {
              alert("Aucun tuteur associé à cet étudiant.");
          }
      } catch (error) {
          console.error('Erreur lors de l\'envoi du rappel de paiement :', error);
          alert('Erreur lors de l\'envoi du rappel de paiement.');
      } finally {
          setLoadingForm(false);
      }
  };


  const handleParentSubmit = async () => {
    setLoadingForm(true);
  
    try {
      let parentId = selectedParent;
  
      if (!useExistingParent) {
        // Ajouter SchoolId au nouveau parent
        const schoolId = Cookies.get('SchoolId');
        const createdParent = await createParent({ ...newParent, school: schoolId });
        parentId = createdParent.id;
        window.location.reload();

      }
  
      const updatedStudent = {
        ...student,
        parent: parentId, // Utilisez "parent" pour associer le tuteur
      };
  
      await updateStudent(id, updatedStudent);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
  
      alert('Le tuteur a été ajouté avec succès.');

    } catch (err) {
      console.error('Erreur lors de la mise à jour du tuteur :', err);
    } finally {
      setLoadingForm(false);
    }
  };
  
  

  const handleRemarkSubmit = async () => {
    setLoadingForm(true);
    try {
      const updatedStudent = {
        ...student,
        remark,
      };

      await updateStudent(id, updatedStudent);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
      setRemark(refreshedStudent.remark || "");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la remarque :", err);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleLevelTransfer = async () => {
    if (!selectedLevel) return;

    setLoadingForm(true);
    try {
      const updatedStudent = {
        ...student,
        education_level: selectedLevel,
      };

      await updateStudent(id, updatedStudent);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
      alert("Le transfert de l'étudiant a été effectué avec succès.");
    } catch (err) {
      console.error('Erreur lors du transfert de l\'étudiant :', err);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleProfilePictureSubmit = async () => {
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);

    Object.keys(student).forEach((key) => {
      if (key !== 'profile_picture') {
        formData.append(key, student[key]);
      }
    });

    setLoadingForm(true);
    try {
      await updateStudentProfilePicture(id, formData);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la photo de profil :', err);
    } finally {
      setLoadingForm(false);
    } 
  };

  const handleAbsenceSubmit = async () => {
      setLoadingForm(true);
      try {
          const updatedStudent = {
              ...student,
              absences_number: absenceCount,
          };

          await updateStudentAbsence(id, updatedStudent);
          const refreshedStudent = await fetchStudentById(id);
          setStudent(refreshedStudent);

          // Récupérer la date du jour
          const today = new Date().toLocaleDateString('fr-FR'); 

          // Envoyer un SMS si un parent est associé
          if (refreshedStudent.parent) {
              const parentData = await fetchParents(Cookies.get('SchoolId'));
              const parentDetails = parentData.find(parent => parent.id === refreshedStudent.parent);

              if (parentDetails && parentDetails.phone_number) {
                  setParentPhoneNumber(parentDetails.phone_number);
                  setSmsMessage(`Bonjour, votre enfant ${refreshedStudent.first_name} ${refreshedStudent.last_name} a été absent(e) le ${today}. Le nombre total d'absences est de ${refreshedStudent.absences_number}.`);
                  setShowSMSPopup(true);
              }
          }
      } catch (err) {
          console.error('Erreur lors de la mise à jour du nombre d\'absences:', err);
      } finally {
          setLoadingForm(false);
      }
  };

    const normalizePhoneNumber = (number) => {
      if (!number.startsWith('+')) {
          // Supposons que les numéros commencent par 0 pour le Maroc
          if (number.startsWith('0')) {
              return '+212' + number.substring(1);
          }
          return '+212' + number; // Si l'utilisateur oublie le 0
      }
      return number; // Le numéro est déjà au bon format
  };

  const handleSendSMS = async () => {
    try {
        // Récupérer le schoolId depuis les cookies
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
            alert("L'identifiant de l'école n'a pas été trouvé. Veuillez réessayer.");
            return;
        }

        // Formater le numéro de téléphone
        const formattedNumber = normalizePhoneNumber(parentPhoneNumber);

        // Appel à la fonction sendSMS avec schoolId, phoneNumber et message
        await sendSMS(schoolId, formattedNumber, smsMessage);
        alert('✅ SMS envoyé avec succès au tuteur.');
        setShowSMSPopup(false);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        alert(`❌ ${error.message}`);
    }
};



  const handlePaymentStatusUpdate = async (isPaid) => {
    setLoadingForm(true);
    try {
        if (isPaid) {
            await markStudentAsPaid(student.id); // Appeler l'API pour marquer comme payé
            generatePaymentReceipt(student);
        } else {
            const updatedStudent = {
                ...student,
                paid: isPaid,
            };
            await updateStudentSalary(student.id, updatedStudent); // Si non payé, utiliser l'API de mise à jour
        }

        // Rafraîchir les données après la mise à jour
        const refreshedStudent = await fetchStudentById(student.id);
        setStudent(refreshedStudent);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du statut de paiement :", err);
    } finally {
        setLoadingForm(false);
    }
  };

  const handleToggleTransportation = async () => {
    setLoadingForm(true);
    try {
      const updatedTransportation = !student.transportation_service;
      await updateStudent(id, { ...student, transportation_service: updatedTransportation });
      setStudent((prevStudent) => ({
        ...prevStudent,
        transportation_service: updatedTransportation,
      }));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du service de transport :", err);
    } finally {
      setLoadingForm(false);
    }
  };

  const generatePaymentReceipt = (student) => {
    const receiptWindow = window.open('', '_blank', 'width=800,height=600');
  
    if (receiptWindow) {
      receiptWindow.document.open();
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Reçu de Paiement</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                padding: 0;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
              .logo {
                width: 80px;
                height: auto;
              }
              .school-info {
                text-align: right;
                font-size: 14px;
              }
              .receipt-container {
                border: 1px solid #000;
                padding: 20px;
                width: 100%;
                max-width: 600px;
                margin: auto;
              }
              .receipt-title {
                text-align: center;
                font-weight: bold;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
              }
              .signature {
                text-align: left;
                margin-top: 50px;
                margin-left:340px;
              }
              .signature-box {
                border: 1px solid #000;
                margin-left:320px;
                height: 110px;
                width: 200px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div>
                  <img src="${schoollogo}" alt="Logo de l'école" class="logo" id="schoolLogo"/>
                </div>
                <div class="school-info">
                  <strong>${schoolName}</strong><br>
                  Année Scolaire: 2024/2025<br>
                  Classe: ${getEducationLevelName(student.education_level) || 'Non spécifiée'}<br>
                  Date de Paiement: ${new Date().toLocaleDateString()}
                </div>
              </div>
  
              <div class="receipt-title">Reçu n° ${Math.floor(Math.random() * 10000)}</div>
  
              <table>
                <tr>
                  <th>Nom de l'étudiant</th>
                  <td>${student.first_name} ${student.last_name}</td>
                </tr>
                <tr>
                  <td>Mensualité - ${new Date().toLocaleString('default', { month: 'long' })}</td>
                  <td>${student.monthly_payment || 'Non spécifié'} DH</td>
                </tr>
                <tr>
                  <td><strong>Total TTC :</strong></td>
                  <td><strong>${student.monthly_payment || 'Non spécifié'} DH</strong></td>
                </tr>
              </table>
  
              <div class="signature">
                Signature et Cachet:
              </div>
              <div class="signature-box"></div>

            </div>
  
            <script>
              // Attendre que l'image soit chargée avant d'imprimer
              const logo = document.getElementById('schoolLogo');
              if (logo.complete) {
                window.print();
              } else {
                logo.onload = () => window.print();
              }
            </script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    }
  };
  
  
  const handleMonthlyPaymentSubmit = async () => {
    setLoadingForm(true);
    try {
      const updatedStudent = {
        ...student,
        monthly_payment: parseFloat(monthlyPayment),
      };

      await updateStudent(id, updatedStudent);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du montant mensuel :', err);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    setLoadingForm(true);
    try {
      const updatedStudent = {
        ...student,
        [field]: value,
      };

      await updateStudent(id, updatedStudent);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du champ ${field} :`, err);
    } finally {
      setLoadingForm(false);
    }
  };

  const getEducationLevelName = (levelId) => {
    if (!levelId) return 'Niveau d\'éducation non défini';
    const level = educationLevels.find((lvl) => lvl.id === levelId);
    return level ? level.name : 'Niveau d\'éducation non défini';
  };

  if (loading) {
      return (
          <div className="loading-container">
              <ScaleLoader size={60} color="#ffcc00" loading={loading} />
          </div>
      );
  }

  if (error) return <p>{error}</p>;

  const paymentStatusStyle = {
    color: student.paid ? 'green' : 'red',
    fontWeight: 'bold',
  };

  return (
    <div className="student-profile-container">
      {student && (
        <div className="student-profile-test">
          <div className="student-profile-picture">
            {student.profile_picture ? (
              <img
                src={`${student.profile_picture}`}
                alt={`${student.first_name} ${student.last_name}`}
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            ) : (
              <span>Aucune photo de profil</span>
            )}
            <FaEdit
              className="student-edit-icon"
              onClick={() => document.getElementById('fileInput').click()}
              style={{ cursor: 'pointer', position: 'absolute', bottom: '10px', right: '10px', fontSize: '20px' }}
            />
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
          <button className="student-modify-profile-picture" onClick={handleProfilePictureSubmit}>
            Mettre à jour la photo de profil
          </button>
          <div className="student-details">
            <p className="student-name">{student.last_name} {student.first_name}</p>
            <p className="student-description">
              <strong>{student.first_name} {student.last_name}</strong> est un(e) étudiant(e) à l'école. 
              Le niveau d'éducation de l'étudiant(e) est <strong>{getEducationLevelName(student.education_level)}</strong>.
              Avec un nombre d'absences de <strong>{absenceCount}</strong>.
            </p>
            <p><strong>Nombre d'absences :</strong>
              <input
                type="number"
                value={absenceCount}
                onChange={(e) => setAbsenceCount(parseInt(e.target.value, 10))}
                style={{ marginLeft: '10px', width: '60px' }}
              />
              <button className="update-button" onClick={handleAbsenceSubmit} style={{ marginLeft: '10px' }}>
                Mettre à jour
              </button>
            </p>
            <p>
              <strong>Montant mensuel à payer :</strong>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
              <button className="update-button" onClick={handleMonthlyPaymentSubmit} style={{ marginLeft: '10px' }}>
                Mettre à jour
              </button>
            </p>
            <p>
              <strong>Email :</strong> {student.email || 'Non spécifié'}
            </p>
            <p>
              <strong>Tuteur :</strong> {parentName || "Non spécifié"}
            </p>

            <p>
              <strong>Numéro de téléphone :</strong> {student.phone_number || 'Non spécifié'}
            </p>
            <p>
              <strong>Adresse :</strong> {student.address || 'Non spécifiée'}
            </p>
            {/* <p>
              <strong>Date du prochain paiement :</strong>
              <input
                type="date"
                value={student.next_payment_date || ''}
                onChange={(e) => handleFieldUpdate('next_payment_date', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </p> */}
            <p>
              <strong>Statut de paiement :</strong>
              <button
                style={{
                  backgroundColor: student.paid ? 'green' : 'lightgray',
                  color: 'white',
                  padding: '5px 10px',
                  margin: '0 10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => handlePaymentStatusUpdate(true)} // Met le statut à "Payé"
              >
                Payé
              </button>
              <button
                style={{
                  backgroundColor: !student.paid ? 'red' : 'lightgray',
                  color: 'white',
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => handlePaymentStatusUpdate(false)} // Met le statut à "Non Payé"
              >
                Non Payé
              </button>
              <button
                  style={{
                      backgroundColor: '#ffcc00', // orange pour attirer l'attention
                      color: 'white',
                      padding: '5px 10px',
                      marginLeft: '10px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                  }}
                  onClick={handlePaymentReminder}
                  className="reminder-button"
              >
                  📩 Envoyer un rappel de paiement
              </button>
            </p>
            <div className="student-profile-test">
                <div className="transportation-toggle">
                    <div className="student-transportation-test-test">
                    <p><strong>Transport :</strong></p>
                    </div> 
                    <label className="switch">
                    <input
                        type="checkbox"
                        checked={student.transportation_service}
                        onChange={handleToggleTransportation}
                    />
                    <span className="slider round"></span>
                    </label>
                    
                    <span>{student.transportation_service ? 'Activé' : 'Désactivé'}</span>
                    </div>
                </div>  
                <p>
                  <strong>Clé secrète des parents :</strong> {student.parent_key || 'Non spécifiée'}
                </p>
                <p>
                  <strong>Remarques :</strong>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "10px",
                      padding: "5px",
                      resize: "vertical",
                    }}
                    placeholder="Ajoutez une remarque pour l'étudiant (ex. : maladie, conditions particulières)"
                  />
                  <button
                    className="update-button"
                    onClick={handleRemarkSubmit}
                    disabled={loadingform || remark === student.remark} // Désactiver si aucun changement
                    style={{
                      marginTop: "10px",
                      cursor: loadingform || remark === student.remark ? "not-allowed" : "pointer",
                      opacity: loadingform || remark === student.remark ? 0.6 : 1,
                    }}
                  >
                    {loadingform ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </p>
                <p>
              <strong>Niveau d'éducation actuel :</strong> {educationLevels.find(level => level.id === student.education_level)?.name || 'Non défini'}
            </p>
            <p>
              <strong>Transférer vers un nouveau niveau :</strong>
              <select
                value={selectedLevel || ""}
                onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                style={{
                  display: "block",
                  marginTop: "10px",
                  padding: "5px",
                  width: "100%",
                }}
              >
                <option value="" disabled>Choisir un niveau</option>
                {educationLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              <button
                className="update-button"
                onClick={handleLevelTransfer}
                disabled={loadingform || selectedLevel === student.education_level}
                style={{
                  marginTop: "10px",
                  cursor: loadingform || selectedLevel === student.education_level ? "not-allowed" : "pointer",
                  opacity: loadingform || selectedLevel === student.education_level ? 0.6 : 1,
                }}
              >
                {loadingform ? "Transfert en cours..." : "Transférer"}
              </button>
            </p>
            <p>
              <strong>Gestion du tuteur :</strong>
            </p>
            <div className="transport-student-label">
              <label>
                <input
                  type="checkbox"
                  checked={useExistingParent}
                  onChange={() => setUseExistingParent(!useExistingParent)}
                />
                Utiliser un tuteur existant
              </label>
            </div>

            <div className="transport-student-label">
              <label>
                <input
                  type="checkbox"
                  checked={!useExistingParent}
                  onChange={() => setUseExistingParent(!useExistingParent)}
                />
                Créer un nouveau tuteur
              </label>
            </div>


            {useExistingParent ? (
              <div>
                <select
                  value={selectedParent || ''}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  style={{
                    display: 'block',
                    marginTop: '10px',
                    padding: '5px',
                    width: '100%',
                  }}
                >
                  <option value="">Choisir un tuteur</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name} ({parent.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="parent-creation-form">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Prénom"
                  value={newParent.first_name}
                  onChange={(e) => setNewParent({ ...newParent, first_name: e.target.value })}
                  className="student-input-lastname"
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Nom"
                  value={newParent.last_name}
                  onChange={(e) => setNewParent({ ...newParent, last_name: e.target.value })}
                  className="student-input-lastname"
                  required
                />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Téléphone"
                  value={newParent.phone_number}
                  onChange={(e) => setNewParent({ ...newParent, phone_number: e.target.value })}
                  className="student-input-lastname"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newParent.email}
                  onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                  className="student-input-lastname"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const generatedEmail = `${newParent.first_name.toLowerCase()}.${newParent.last_name.toLowerCase()}@scolara.com`;
                    setNewParent({ ...newParent, email: generatedEmail });
                  }}
                  className="generate-password-button"
                >
                  <FaEdit /> Générer un email
                </button>
                <input
                  type="text"
                  name="password"
                  placeholder="Mot de passe"
                  value={newParent.password}
                  readOnly
                  className="student-input-lastname"
                />
                <button
                  type="button"
                  onClick={() => {
                    const generatedPassword = Array.from({ length: 8 }, () =>
                      Math.random().toString(36).charAt(2)
                    ).join('');
                    setNewParent({ ...newParent, password: generatedPassword });
                  }}
                  className="generate-password-button"
                >
                  <FaEdit /> Générer un mot de passe
                </button>
                <button
                  type="button"
                  onClick={handleParentSubmit}
                  className="create-student-button"
                  disabled={loadingform}
                >
                  {loadingform ? (
                    <MoonLoader size={20} color="#fff" loading={loadingform} />
                  ) : (
                    'Créer le tuteur'
                  )}
                </button>
              </div>
            )}

            <button
              className="update-button"
              onClick={handleParentSubmit}
              disabled={loadingform}
              style={{
                marginTop: '10px',
                cursor: loadingform ? 'not-allowed' : 'pointer',
                opacity: loadingform ? 0.6 : 1,
              }}
            >
              {loadingform ? 'Mise à jour...' : 'Mettre à jour le tuteur'}
            </button>
  
          </div>
        </div>
      )}
      {loadingform && (
          <div className="overlay-loader">
              <div className="CRUD-loading-container">
                  <MoonLoader size={50} color="#ffcc00" loading={loadingform} />
              </div>
          </div>
      )}
      {showSMSPopup && (
        <div className="sms-popup-overlay">
            <div className="sms-popup">
                <h3>Envoyer un SMS au tuteur 📲</h3>
                <p><strong>Numéro :</strong> {parentPhoneNumber}</p>
                <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows="4"
                    style={{ width: '100%', padding: '10px' }}
                ></textarea>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={handleSendSMS} style={{ marginRight: '10px' }}>
                        Envoyer le SMS
                    </button>
                    <button onClick={() => setShowSMSPopup(false)} style={{ backgroundColor: 'red', color: 'white' }}>
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    )}

    </div>
    
  );
};

export default StudentProfile;
