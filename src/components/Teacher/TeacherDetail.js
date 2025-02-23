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
import { ScaleLoader, MoonLoader } from 'react-spinners';
import axios from 'axios';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [sessionSalary, setSessionSalary] = useState(null);
  const [educationLevels, setEducationLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicateEducationLevels, setDuplicateEducationLevels] = useState([]);
  const [duplicateSubjects, setDuplicateSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [absenceCount, setAbsenceCount] = useState(0);
  const [monthlySalary, setMonthlySalary] = useState(null); // Changement de 'salary' en 'monthlySalary'
  const [profilePicture, setProfilePicture] = useState(null);
  const [loadingform, setLoadingForm] = useState(false);

  useEffect(() => {
    const getTeacherData = async () => {
      try {
        setLoading(true);
        const teacherData = await fetchTeacherById(id);
        setTeacher(teacherData);

        const schoolId = Cookies.get('SchoolId');
        if (schoolId) {
          await fetchDuplicateData(teacherData.first_name, teacherData.last_name);
        } else {
          setError("Aucun ID d'école trouvé dans les cookies.");
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données de l\'enseignant:', err);
        setError('Impossible de récupérer les données.');
      } finally {
        setLoading(false);
      }
    };

    getTeacherData();
  }, [id]);

  useEffect(() => {
    if (teacher && teacher.absences_number !== undefined) {
      setAbsenceCount(teacher.absences_number);
    }
  }, [teacher]);

  useEffect(() => {
    if (teacher && teacher.monthly_salary !== undefined) {
      setMonthlySalary(teacher.monthly_salary);
    }
  }, [teacher]);
  
  

  const fetchDuplicateData = async (firstName, lastName) => {
    try {
      // Appel pour récupérer les niveaux d'éducation
      const educationResponse = await axios.get('https://scolara-backend.onrender.com/api/duplicate-teacher-education-levels/', {
        params: { first_name: firstName, last_name: lastName },
      });
      setDuplicateEducationLevels(educationResponse.data);

      // Appel pour récupérer les matières
      const subjectResponse = await axios.get('https://scolara-backend.onrender.com/api/duplicate-teacher-subjects/', {
        params: { first_name: firstName, last_name: lastName },
      });
      setDuplicateSubjects(subjectResponse.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des doublons :', err);
    }
  };

  
  const handleSessionSalarySubmit = async () => {
    setLoadingForm(true);
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
    } finally {
        setLoadingForm(false);  
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
    setLoadingForm(true);
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
    } finally {
        setLoadingForm(false);
    }
};

  const handleSalarySubmit = async () => {
    setLoadingForm(true);
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
    } finally{
        setLoadingForm(false);
    }
  };

  const handlePaymentStatusUpdate = async (isPaid) => {
  setLoadingForm(true);
  try {
    // Mettez à jour le statut de paiement de l'enseignant
    const updatedTeacher = {
      ...teacher,
      paid: isPaid,
    };

    await updateTeacher(id, updatedTeacher);

    // Si le statut est marqué comme payé, créez une transaction
    if (isPaid) {
      await markTeacherAsPaid(id, teacher.monthly_salary || 0);
    }

    // Rafraîchissez les données après la mise à jour
    const refreshedTeacher = await fetchTeacherById(id);
    setTeacher(refreshedTeacher);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut de paiement ou de la transaction :', err);
  } finally {
    setLoadingForm(false);
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
      setLoadingForm(true);
  
      try {
          await updateTeacherProfilePicture(id, formData);
  
          const refreshedTeacher = await fetchTeacherById(id);
          setTeacher(refreshedTeacher);
      } catch (err) {
          console.error("Erreur lors de la mise à jour de la photo de profil :", err);
      } finally {
          setLoadingForm(false);
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
      setLoadingForm(true);
      try {
        const updatedTeacher = { ...teacher }; // Supprimer next_payment_date
    
        await updateTeacher(id, updatedTeacher);
        const refreshedTeacher = await fetchTeacherById(id);
        setTeacher(refreshedTeacher);
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'enseignant :", err);
      } finally {
        setLoadingForm(false);
      }
  };

  

  const handleAbsenceAndSalaryUpdate = async (newAbsenceCount) => {
    // Si la valeur est vide ou négative, on ignore la mise à jour
    if (isNaN(newAbsenceCount) || newAbsenceCount < 0) {
      console.warn("Valeur d'absence non valide.");
      return;
    }
  
    // Vérifiez que les données nécessaires sont disponibles
    if (!teacher || !teacher.session_salary) {
      console.error("Salaire par séance manquant ou données enseignant indisponibles.");
      return;
    }
  
    // Calculez la différence d'absences
    const absenceDifference = newAbsenceCount - absenceCount;
  
    // Si le nombre d'absences ne change pas, on arrête ici
    if (absenceDifference === 0) return;
  
    // Calculez le nouveau salaire mensuel
    const newMonthlySalary = Math.max(
      (teacher.monthly_salary || 0) - teacher.session_salary * absenceDifference,
      0 // Le salaire ne peut pas être négatif
    );
  
    setLoadingForm(true);
  
    try {
      // Mettez à jour uniquement le nombre d'absences
      const updatedTeacher = {
        ...teacher,
        absences_number: newAbsenceCount,
        monthly_salary: newMonthlySalary,
      };
  
      await updateTeacher(id, updatedTeacher);
  
      // Rafraîchir les données après la mise à jour
      const refreshedTeacher = await fetchTeacherById(id);
      setTeacher(refreshedTeacher);
      setAbsenceCount(newAbsenceCount);
      setMonthlySalary(newMonthlySalary);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des absences et du salaire :", err);
    } finally {
      setLoadingForm(false);
    }
  };


  return (
    <div className="teacher-profile-container">
      {teacher && (
         <div className="student-profile-test">
            <div className="student-profile-picture">
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
                        className="student-edit-icon"
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
                    <button className='student-modify-profile-picture' onClick={handleProfilePictureSubmit}>Mettre à jour la photo de profil</button>
                    <div className="teacher-details">
                      <p className="teacher-name">{teacher.last_name} {teacher.first_name}</p>
                      <p className="teacher-description">
                        <strong>{teacher.first_name} {teacher.last_name}</strong> est un(e) enseignant(e) à l'école. 
                        Le(s) niveau(x) d'éducation enseigné(s) est (sont) <strong>
                          {duplicateEducationLevels.length > 0
                            ? duplicateEducationLevels.map((level) => level.education_level__name).join(', ')
                            : 'Aucun niveau trouvé'}
                        </strong>.
                        Avec un nombre d'absences de <strong>{absenceCount}</strong>, 
                        {teacher.first_name} enseigne la (les) matière(s) <strong>
                          {duplicateSubjects.length > 0
                            ? duplicateSubjects.map((subject) => subject.subject__name).join(', ')
                            : 'Aucune matière trouvée'}
                        </strong>, 
                        et le statut de paiement est <strong style={paymentStatusStyle}>{teacher.paid ? 'Payé' : 'Non payé'}</strong>.
                        Le salaire mensuel est de <strong>{monthlySalary !== null ? `${monthlySalary} DH` : 'Non spécifié'}</strong>.
                        Le salaire par séance est de <strong>{teacher.session_salary !== null ? `${teacher.session_salary} DH` : 'Non spécifié'}</strong>.
                      </p>
            <p>
              <strong>Nombre d'absences :</strong>
              <input
                type="number"
                value={absenceCount}
                min="0"  // Empêche les valeurs négatives
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setAbsenceCount(0);  // Définit par défaut à 0 si l'utilisateur efface
                  } else {
                    handleAbsenceAndSalaryUpdate(parseInt(value, 10));
                  }
                }}
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
            <p><strong>Matière(s) enseignée(s) :</strong> <strong><p>
                  {duplicateSubjects.length > 0
                    ? duplicateSubjects.map((subject) => subject.subject__name).join(', ')
                    : 'Aucune matière trouvée'}
                </p>
                </strong> </p>
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

    </div>
  );
};

export default TeacherProfile;
