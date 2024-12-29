import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa'; 
import {
  fetchTeacherById,
  fetchEducationLevelsBySchool,
  fetchSubjects,
  updateTeacherAbsence,
  updateTeacherSalary,
  updateTeacherProfilePicture,
  updateTeacherSessionSalary,
  updateTeacher,
  markTeacherAsPaid,
} from '../../APIServices';
import Cookies from 'js-cookie';
import './TeacherProfile.css';
import { ScaleLoader } from 'react-spinners';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [sessionSalary, setSessionSalary] = useState(null);
  const [educationLevels, setEducationLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [absenceCount, setAbsenceCount] = useState(0);
  const [monthlySalary, setMonthlySalary] = useState(null); // Changement de 'salary' en 'monthlySalary'
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const getTeacherData = async () => {
      try {
        const teacherData = await fetchTeacherById(id);
        console.log("Données de l'enseignant récupérées :", teacherData); // Débogage
        setTeacher(teacherData);
        setAbsenceCount(teacherData.absences_number || 0);
        setMonthlySalary(teacherData.monthly_salary || 0);
        setProfilePicture(teacherData.profile_picture);
  
        const schoolId = Cookies.get('SchoolId');
        if (schoolId) {
          const levelsData = await fetchEducationLevelsBySchool(schoolId);
          const subjectsData = await fetchSubjects(schoolId);
          console.log("Niveaux et matières récupérés :", levelsData, subjectsData);
          setEducationLevels(levelsData);
          setSubjects(subjectsData);
        } else {
          setError("Aucun ID d'école trouvé dans les cookies.");
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données de l\'enseignant:', err);
        setError('Impossible de récupérer les données.');
      } finally {
        setLoading(false); // Assurez-vous que le chargement est désactivé
      }
    };
  
    getTeacherData();
  }, [id]);

  useEffect(() => {
    const checkAndResetPaymentStatus = async () => {
      if (!teacher || !teacher.next_payment_date) {
        console.log("Données de l'enseignant manquantes ou date de paiement non définie.");
        return;
      }
  
      const today = new Date().toISOString().split("T")[0];
      if (today >= teacher.next_payment_date && teacher.paid) {
        console.log("Réinitialisation automatique...");
        try {
          const updatedTeacher = {
            ...teacher,
            paid: false,
            absences_number: 0,
          };
  
          await updateTeacher(id, updatedTeacher);
          const refreshedTeacher = await fetchTeacherById(id);
          setTeacher(refreshedTeacher);
        } catch (err) {
          console.error("Erreur lors de la réinitialisation automatique :", err);
        }
      }
    };
  
    if (teacher) checkAndResetPaymentStatus();
  }, [teacher, id]);
  
  
  const handleSessionSalarySubmit = async () => {
    try {
        const updatedTeacher = {
            ...teacher,
            session_salary: sessionSalary,
        };

        await updateTeacherSessionSalary(id, updatedTeacher);

        const refreshedTeacher = await fetchTeacherById(id);
        setTeacher(refreshedTeacher);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du salaire par séance :", err);
    }
  };


  const getEducationLevelName = (levelId) => {
    if (!levelId) return 'Niveau d\'éducation non défini';
    const level = educationLevels.find((lvl) => lvl.id === levelId);
    return level ? level.name : 'Niveau d\'éducation non défini';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((subj) => subj.id === subjectId);
    return subject ? subject.name : 'Matière non définie';
  };

  const handleIconClick = () => {
    document.getElementById("fileInput").click(); // Simule le clic sur le champ de fichier masqué
  };

  const handleAbsenceSubmit = async () => {
    try {
        const updatedTeacher = {
            ...teacher,
            absences_number: absenceCount
        };

        await updateTeacherAbsence(id, updatedTeacher);

        const refreshedTeacher = await fetchTeacherById(id);
        setTeacher(refreshedTeacher);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du nombre d\'absences:', err);
    }
};

  const handleSalarySubmit = async () => {
    try {
        const updatedTeacher = {
            ...teacher,
            monthly_salary: monthlySalary // Mise à jour de 'salary' en 'monthly_salary'
        };

        await updateTeacherSalary(id, updatedTeacher);

        const refreshedTeacher = await fetchTeacherById(id);
        setTeacher(refreshedTeacher);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du salaire:', err);
    }
  };

  const handlePaymentStatusUpdate = async (isPaid) => {
    try {
        if (isPaid) {
            await markTeacherAsPaid(teacher.id); // Appeler l'API pour marquer comme payé
        } else {
            const updatedTeacher = {
                ...teacher,
                paid: isPaid,
            };
            await updateTeacherSalary(teacher.id, updatedTeacher); // Si non payé, utiliser l'API de mise à jour
        }

        // Rafraîchir les données après la mise à jour
        const refreshedTeacher = await fetchTeacherById(teacher.id);
        setTeacher(refreshedTeacher);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du statut de paiement :", err);
    }
  };
  

  const handleProfilePictureSubmit = async () => {
      const formData = new FormData();
      formData.append('profile_picture', profilePicture);
  
      Object.keys(teacher).forEach(key => {
          if (key !== 'profile_picture') { 
              formData.append(key, teacher[key]);
          }
      });
  
      try {
          await updateTeacherProfilePicture(id, formData);
  
          const refreshedTeacher = await fetchTeacherById(id);
          setTeacher(refreshedTeacher);
      } catch (err) {
          console.error("Erreur lors de la mise à jour de la photo de profil :", err);
      }
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
    color: teacher.paid ? 'green' : 'red',
    fontWeight: 'bold',
  };

  const handleUpdateTeacher = async () => {
    try {
      const updatedTeacher = {
        ...teacher,
        next_payment_date: teacher.next_payment_date, // Ajouter la date du prochain paiement
      };
  
      await updateTeacher(id, updatedTeacher);
      const refreshedTeacher = await fetchTeacherById(id);
      setTeacher(refreshedTeacher);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'enseignant :", err);
    }
  };
  

  const handleAbsenceAndSalaryUpdate = async (newAbsenceCount) => {
    // Vérifiez que les données nécessaires sont disponibles
    if (!teacher || !teacher.session_salary) {
      console.error("Salaire par séance manquant ou données enseignant indisponibles.");
      return;
    }
  
    // Calculez la différence d'absences
    const absenceDifference = newAbsenceCount - absenceCount;
    if (absenceDifference <= 0) return; // Ne rien faire si le nombre d'absences ne change pas ou diminue
  
    // Calculez le nouveau salaire mensuel
    const newMonthlySalary = Math.max(
      teacher.monthly_salary - teacher.session_salary * absenceDifference,
      0 // Le salaire ne peut pas être négatif
    );
  
    try {
      // Mettez à jour l'absence et le salaire dans l'API
      const updatedTeacher = {
        ...teacher,
        absences_number: newAbsenceCount,
        monthly_salary: newMonthlySalary,
      };
  
      await updateTeacherSalary(id, updatedTeacher);
  
      // Rafraîchir les données après la mise à jour
      const refreshedTeacher = await fetchTeacherById(id);
      setTeacher(refreshedTeacher);
      setAbsenceCount(newAbsenceCount); // Mettez à jour le state local
      setMonthlySalary(newMonthlySalary); // Mettez à jour le salaire localement
    } catch (err) {
      console.error("Erreur lors de la mise à jour des absences et du salaire :", err);
    }
  };
  

  return (
    <div className="teacher-profile-container">
      {teacher && (
        <div className="teacher-profile">
                 <div className="profile-picture">
                    {teacher.profile_picture ? (
                        <img
                        src={`${teacher.profile_picture}`}
                        alt={`${teacher.first_name} ${teacher.last_name}`}
                        style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                        />
                    ) : (
                        <span>Aucune photo de profil</span>
                    )}
                    <FaEdit
                        className="edit-icon"
                        onClick={handleIconClick}
                        style={{ cursor: 'pointer', position: 'absolute', bottom: '10px', right: '10px', fontSize: '20px' }}
                    />
                    </div>
                    <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                    />
                    <button className='modify-profile-picture' onClick={handleProfilePictureSubmit}>Mettre à jour la photo de profil</button>
          <div className="teacher-details">
            <p className="teacher-name">{teacher.last_name} {teacher.first_name}</p>
            <p className="teacher-description">
              <strong>{teacher.first_name} {teacher.last_name}</strong> est un(e) enseignant(e) à l'école. 
              Le niveau d'éducation enseigné est <strong>{getEducationLevelName(teacher.education_level)}</strong>.
              Avec un nombre d'absences de <strong>{absenceCount}</strong>, 
              {teacher.first_name} enseigne la matière <strong>{getSubjectName(teacher.subject)}</strong>, 
              et le statut de paiement est <strong style={paymentStatusStyle}>{teacher.paid ? 'Payé' : 'Non payé'}</strong>.
              Le salaire mensuel est de <strong>{monthlySalary !== null ? `${monthlySalary} DH` : 'Non spécifié'}</strong>.
              Le salaire par séance est de <strong>{teacher.session_salary !== null ? `${teacher.session_salary} DH` : 'Non spécifié'}</strong>.
            </p>
            <p>
              <strong>Nombre d'absences :</strong>
              <input
                type="number"
                value={absenceCount}
                onChange={(e) => handleAbsenceAndSalaryUpdate(parseInt(e.target.value, 10))}
                style={{ marginLeft: '10px', width: '60px' }}
              />
              <button className="update-button update-salary-button" onClick={handleAbsenceSubmit} style={{ marginLeft: '10px' }}>Mettre à jour</button>
            </p>
            <p>
              <strong>Salaire mensuel :</strong>
              <input
                type="number"
                value={monthlySalary} // Changement de 'salary' en 'monthlySalary'
                onChange={(e) => setMonthlySalary(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
            <button className="update-button update-salary-button" onClick={handleSalarySubmit} style={{ marginLeft: '10px' }}>Mettre à jour</button>
            </p>
            <p><strong>Matière enseignée :</strong> {getSubjectName(teacher.subject)}</p>
            <p>
              <strong>Statut de paiement :</strong>
              <button
                style={{
                  backgroundColor: teacher.paid ? 'green' : 'lightgray',
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
                  backgroundColor: !teacher.paid ? 'red' : 'lightgray',
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

            <p><strong>Numéro de téléphone : </strong>{teacher.phone_number}</p>
            <p><strong>Courriel : </strong>{teacher.email}</p>
            <p><strong>Adresse : </strong>{teacher.address !== '' ? teacher.address : 'Non spécifié'}</p>
            <p>
              <strong>Salaire par séance :</strong>
              <input
                type="number"
                value={sessionSalary || teacher.session_salary }
                onChange={(e) => setSessionSalary(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
              <button
                className="update-button"
                onClick={handleSessionSalarySubmit}
                style={{ marginLeft: '10px' }}
              >
                Mettre à jour
              </button>
            </p>
            <p>
              <strong>Date du prochain paiement :</strong>
              <input
                type="date"
                value={teacher.next_payment_date || ""}
                onChange={(e) => setTeacher({ ...teacher, next_payment_date: e.target.value })}
                style={{ marginLeft: "10px" }}
              />
              <button
                className="update-button"
                onClick={() => handleUpdateTeacher()}
                style={{ marginLeft: "10px" }}
              >
                Mettre à jour
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;
