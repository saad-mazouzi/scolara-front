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
} from '../../APIServices';
import Cookies from 'js-cookie';
import './Student.css';
import { ScaleLoader } from 'react-spinners';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [absenceCount, setAbsenceCount] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [educationLevels, setEducationLevels] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const getStudentData = async () => {
      const schoolId = Cookies.get('SchoolId');
      try {
        const studentData = await fetchStudentById(id);
        setStudent(studentData);
        setAbsenceCount(studentData.absences_number || 0);
        setMonthlyPayment(studentData.monthly_payment || 0);
        const levelsData = await fetchEducationLevelsBySchool(schoolId);
        setEducationLevels(levelsData);
        setProfilePicture(studentData.profile_picture);
      } catch (err) {
        console.error('Erreur lors de la récupération des données de l\'étudiant:', err);
        setError('Impossible de récupérer les données.');
      } finally {
        setLoading(false);
      }
    };

    getStudentData();
  }, [id]);

  const handleProfilePictureSubmit = async () => {
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);

    Object.keys(student).forEach((key) => {
      if (key !== 'profile_picture') {
        formData.append(key, student[key]);
      }
    });

    try {
      await updateStudentProfilePicture(id, formData);
      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la photo de profil :', err);
    }
  };

  const handleAbsenceSubmit = async () => {
    try {
      const updatedStudent = {
        ...student,
        absences_number: absenceCount,
      };

      await updateStudentAbsence(id, updatedStudent);

      const refreshedStudent = await fetchStudentById(id);
      setStudent(refreshedStudent);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du nombre d\'absences:', err);
    }
  };

  const handlePaymentStatusUpdate = async (isPaid) => {
    try {
        if (isPaid) {
            await markStudentAsPaid(student.id); // Appeler l'API pour marquer comme payé
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
    }
  };

  const handleToggleTransportation = async () => {
    try {
      const updatedTransportation = !student.transportation_service;
      await updateStudent(id, { ...student, transportation_service: updatedTransportation });
      setStudent((prevStudent) => ({
        ...prevStudent,
        transportation_service: updatedTransportation,
      }));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du service de transport :", err);
    }
  };


  const handleMonthlyPaymentSubmit = async () => {
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
    }
  };

  const handleFieldUpdate = async (field, value) => {
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
        <div className="student-profile">
          <div className="student-profile-picture">
            {student.profile_picture ? (
              <img
                src={`https://scolara-backend.onrender.com${student.profile_picture}`}
                alt={`${student.first_name} ${student.last_name}`}
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            ) : (
              <span>Aucune photo de profil</span>
            )}
            <FaEdit
              className="edit-icon"
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
          <button className="modify-profile-picture" onClick={handleProfilePictureSubmit}>
            Mettre à jour la photo de profil
          </button>
          <div className="student-details">
            <p className="student-name">{student.last_name} {student.first_name}</p>
            <p className="student-description">
              <strong>{student.first_name} {student.last_name}</strong> est un(e) étudiant(e) à l'école. 
              Le niveau d'éducation de l'étudiant est <strong>{getEducationLevelName(student.education_level)}</strong>.
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
              <strong>Numéro de téléphone :</strong> {student.phone_number || 'Non spécifié'}
            </p>
            <p>
              <strong>Adresse :</strong> {student.address || 'Non spécifiée'}
            </p>
            <p>
              <strong>Date du prochain paiement :</strong>
              <input
                type="date"
                value={student.next_payment_date || ''}
                onChange={(e) => handleFieldUpdate('next_payment_date', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </p>
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
            </p>
            <div className="student-profile">
                <div className="transportation-toggle">
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
                <p>
                  <strong>Clé secrète des parents :</strong> {student.parent_key || 'Non spécifiée'}
                </p>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default StudentProfile;
