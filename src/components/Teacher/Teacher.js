import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchTeachers, fetchEducationLevelsBySchool, fetchSubjects, createTeacher,fetchSubjectsByEducationLevel, updateTeacher, deleteTeacher } from '../../APIServices';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../Student/Student.css';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import XLSX
import { ClockLoader } from 'react-spinners';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import {PuffLoader ,PulseLoader} from 'react-spinners';


const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [subjects, setSubjects] = useState([]); // Nouvel état pour les matières
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const itemsPerPage = 4; // Nombre d'étudiants par page
  const [error, setError] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false); // Nouvel état pour rafraîchir les données
  const [newTeacherData, setNewTeacherData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    school: null,
    education_level: '',
    subject: '',  // Assurez-vous que subject est dans le state
  });
  const [editTeacherData, setEditTeacherData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleRowClick = (teacherId) => {
    navigate(`/teacher/${teacherId}`);
  };

  useEffect(() => {
    const getTeachersAndEducationLevelsAndSubjects = async () => {
        try {
            setLoading(true);
            const teachersData = await fetchTeachers();
            setTeachers(teachersData);

            const schoolId = Cookies.get('SchoolId');
            if (schoolId) {
                const levelsData = await fetchEducationLevelsBySchool(schoolId);
                setEducationLevels(levelsData);

                const subjectsData = await fetchSubjects(schoolId);
                setSubjects(subjectsData);
            } else {
                setError('Aucun ID d\'école trouvé dans les cookies.');
            }
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue lors de la récupération des enseignants.');
        } finally {
            setLoading(false);
        }
    };

    getTeachersAndEducationLevelsAndSubjects();
}, [shouldRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersData = await fetchTeachers();
        setTeachers(teachersData);

        const schoolId = Cookies.get('SchoolId');
        if (schoolId) {
          const levelsData = await fetchEducationLevelsBySchool(schoolId);
          setEducationLevels(levelsData);
        } else {
          setError('Aucun ID d\'école trouvé dans les cookies.');
        }
      } catch (err) {
        console.error(err);
        setError('Une erreur est survenue lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubjectsForLevel = async () => {
      if (newTeacherData.education_level) {
        try {
          const subjectsData = await fetchSubjectsByEducationLevel(newTeacherData.education_level);
          setSubjects(subjectsData);
        } catch (error) {
          console.error('Erreur lors de la récupération des matières:', error);
        }
      } else {
        setSubjects([]); // Réinitialiser si aucun niveau n'est sélectionné
      }
    };

    fetchSubjectsForLevel();
  }, [newTeacherData.education_level]);


  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });


  const getEducationLevelName = (levelId) => {
      if (loading) {
          return <PulseLoader   color="#4e7dad" size={8}/>;
      }
      if (levelId === null) {
          return <PulseLoader   color="#4e7dad" size={8}/>;
      }
      const level = educationLevels.find((lvl) => lvl.id === levelId);
      return level ? level.name : <PulseLoader   color="#4e7dad" size={8}/>;
  };

  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };  

  if (loading) {
    return (
        <div className="loading-container">
            <PuffLoader size={60} color="#ffcc00" loading={loading} />
        </div>
    );
}


  const getSubjectName = (subjectId) => {
    if (loading) {
        return <PulseLoader   color="#ffcc00" size={8}/>;
    }
    if (!subjectId) {
        return <PulseLoader   color="#ffcc00" size={8}/>;
    }
    const subject = subjects.find((subj) => subj.id === subjectId);
    return subject ? subject.name : <PulseLoader   color="#ffcc00" size={8}/>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convertir le subject et l'education_level en entier si c'est le champ qui est modifié
    const formattedValue = (name === 'subject' || name === 'education_level') ? parseInt(value, 10) : value;

    // Ajouter console.log pour déboguer les valeurs
    console.log(`Modification du champ ${name} avec la valeur ${formattedValue}`);

    setNewTeacherData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }));
  };

  const getPaymentStatus = (paid) => {
    return (
      <button
        className={`payment-status-button ${paid ? 'paid' : 'unpaid'}`}
        disabled
      >
        {paid ? 'Payé' : 'Non payé'}
      </button>
    );
  };
  

  const downloadCSV = () => {
    const csvHeader = "Prénom,Nom,Email,Téléphone,Statut de Paiement,Niveau d'Éducation,Matière\n"; // Ajouter l'en-tête pour le statut de paiement
    const csvContent = csvHeader + teachers.map(teacher => 
        `${teacher.first_name},${teacher.last_name},${teacher.email},${teacher.phone_number},${teacher.paid ? 'Payé' : 'Non Payé'},${getEducationLevelName(teacher.education_level)},${getSubjectName(teacher.subject)}`
    ).join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Teachers.csv");
    document.body.appendChild(link);
    link.click();
};

const downloadXLSX = () => {
  const worksheet = XLSX.utils.json_to_sheet(teachers.map(teacher => ({
      'Prénom': teacher.first_name,
      'Nom': teacher.last_name,
      'Email': teacher.email,
      'Téléphone': teacher.phone_number,
      'Statut de paiement': teacher.paid ? 'Payé' : 'Non Payé', // Ajouter le statut de paiement
      'Niveau d\'éducation': getEducationLevelName(teacher.education_level),
      'Matière': getSubjectName(teacher.subject)
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enseignants');
  XLSX.writeFile(workbook, 'teachers.xlsx');
};

  const handleGenerateEmail = () => {
    const email = `${newTeacherData.first_name.toLowerCase()}.${newTeacherData.last_name.toLowerCase()}@scolara.com`;
    setNewTeacherData((prevData) => ({
      ...prevData,
      email
    }));
  };

  const generatePassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };


  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewTeacherData((prevData) => ({
      ...prevData,
      password
    }));
  };

  const handleDeleteClick = async (teacherId) => {
    try {
      await deleteTeacher(teacherId);
      const updatedTeachers = teachers.filter(teacher => teacher.id !== teacherId);
      setTeachers(updatedTeachers);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      const schoolId = Cookies.get('SchoolId');
      if (!schoolId) {
          console.error('Aucun ID d\'école trouvé dans les cookies.');
          return;
      }

      const teacherData = new FormData();
      teacherData.append('first_name', newTeacherData.first_name);
      teacherData.append('last_name', newTeacherData.last_name);
      teacherData.append('email', newTeacherData.email);
      teacherData.append('phone_number', newTeacherData.phone_number);
      teacherData.append('school', schoolId);
      teacherData.append('education_level', newTeacherData.education_level);
      teacherData.append('subject', newTeacherData.subject);
      teacherData.append('password', newTeacherData.password); // Vérifiez si le mot de passe est bien inclus

      console.log('Données envoyées à l\'API :', Object.fromEntries(teacherData.entries()));

      try {
          if (editTeacherData) {
              await updateTeacher(editTeacherData.id, teacherData);
          } else {
              await createTeacher(teacherData);
          }

          setShowForm(false);
          setNewTeacherData({
              first_name: '',
              last_name: '',
              email: '',
              phone_number: '',
              school: null,
              education_level: '',
              subject: '',
          });
          setEditTeacherData(null);

          // Déclencher un rafraîchissement des données
          setShouldRefresh((prev) => !prev);
      } catch (error) {
          console.error('Erreur lors de la création ou de la modification de l\'enseignant:', error);
      }
  };


  const handleEditClick = (teacher) => {
    setEditTeacherData(teacher);
    setNewTeacherData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone_number: teacher.phone_number,
      education_level: teacher.education_level,
      subject: teacher.subject,
    });
    setShowForm(true);
  };



  if (loading) {
    return     
    <div className="loader-container">
      <ClockLoader color="#4e7dad" />
    </div>
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <button onClick={() => downloadCSV()} className="csv-download-button">Exporter CSV</button>
      <button onClick={() => downloadXLSX()} className="xlsx-download-button">Exporter XLSX</button>
      <div className="student-list-title">
        <h3>Table des Enseignants</h3>
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
      <div className='whitetext'>Scolara</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Photo de Profil</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Niveau d'éducation</th>
            <th>Matière</th>
            <th>Téléphone</th>
            <th>Statut de Paiement</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
           {paginatedTeachers.map((teacher) => (
           <tr key={teacher.id} onClick={() => handleRowClick(teacher.id)} style={{ cursor: 'pointer' }}>
              <td>
                {teacher.profile_picture ? (
                  <img
                    src={`${teacher.profile_picture}`}
                    alt={`${teacher.first_name} ${teacher.last_name}`}
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                ) : (
                  <span>Aucune photo</span>
                )}
              </td>
              <td>{teacher.first_name}</td>
              <td>{teacher.last_name}</td>
              <td>{getEducationLevelName(teacher.education_level)}</td>
              <td>{getSubjectName(teacher.subject)}</td>
              <td>{teacher.phone_number}</td>
              <td>{getPaymentStatus(teacher.paid)}</td> {/* Statut de paiement */}
              <td>
                <div className="action-buttons">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(teacher); }} className="edit-student-button">
                    Modifier
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(teacher.id); }} className="student-button-delete">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='whitetext'>Scolara</div>
      <div className="pagination-controls-student">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active-page' : ''}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>
      </div>

      {showForm ? (
        <button className="cancel-student-button" onClick={() => setShowForm(false)}>
          <i className="fas fa-times"></i> Annuler
        </button>
      ) : (
        <button className="create-student-button" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Créer un Nouvel Enseignant
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={newTeacherData.first_name}
            onChange={handleInputChange}
            className="student-input-firstname"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={newTeacherData.last_name}
            onChange={handleInputChange}
            className="student-input-lastname"
            required
          />
          
          <input
            type="text"
            name="phone_number"
            placeholder="Téléphone"
            value={newTeacherData.phone_number}
            onChange={handleInputChange}
            className="student-input-phone"
            required
          />
          <select
          name="education_level"
          className="student-input-phone"
          value={newTeacherData.education_level}
          onChange={handleInputChange}
          required
          >
            <option value="" disabled>Sélectionner un Niveau d'Éducation</option>
            {educationLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          <select
            name="subject"
            value={newTeacherData.subject}
            className="student-input-phone"
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Sélectionner une matière</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newTeacherData.email}
            onChange={handleInputChange}
            className="student-input-email"
            required
          />
          <button type="button" onClick={handleGenerateEmail} className="generate-password-button">
            <FontAwesomeIcon icon={faRobot} className="icon" />
            Générer un e-mail
          </button>
          <input
            type="text"
            name="password"
            placeholder="Mot de passe généré"
            value={newTeacherData.password}
            readOnly
            className="student-input-firstname"
          />
          <button type="button" onClick={handleGeneratePassword} className="generate-password-button">
            <FontAwesomeIcon icon={faRobot} className="icon" />
            Générer un mot de passe
          </button>
          <button type="submit" className="create-student-button">
            {editTeacherData ? 'Modifier l\'Enseignant' : 'Créer l\'Enseignant'}
          </button>
        </form>
      )}
      <div className='whitetext'>Scolara</div>
    </div>
  );
};

export default TeacherList;