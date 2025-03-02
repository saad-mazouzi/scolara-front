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
import {PuffLoader ,PulseLoader, MoonLoader} from 'react-spinners';
import axios from 'axios';


const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [subjects, setSubjects] = useState([]); // Nouvel état pour les matières
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const itemsPerPage = 5; // Nombre d'étudiants par page
  const [error, setError] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [duplicateEducationLevels, setDuplicateEducationLevels] = useState({});
  const [duplicateSubjects, setDuplicateSubjects] = useState({});
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
        const filteredTeachers = filterDuplicateTeachers(teachersData);
        setTeachers(filteredTeachers);
  
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
  }, []);
    

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

  useEffect(() => {
    const getTeachersAndData = async () => {
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
        }

        // Charger les doublons pour les niveaux d'éducation
        const educationLevelPromises = teachersData.map((teacher) =>
          fetchDuplicateEducationLevels(teacher.first_name, teacher.last_name)
        );
        const educationLevelData = await Promise.all(educationLevelPromises);

        const educationLevelMap = {};
        educationLevelData.forEach((data, index) => {
          const teacher = teachersData[index];
          const duplicateKey = `${teacher.first_name}_${teacher.last_name}`;
          educationLevelMap[duplicateKey] = data;
        });
        setDuplicateEducationLevels(educationLevelMap);

        // Charger les doublons pour les sujets
        const subjectPromises = teachersData.map((teacher) =>
          fetchDuplicateSubjects(teacher.first_name, teacher.last_name)
        );
        const subjectData = await Promise.all(subjectPromises);

        const subjectMap = {};
        subjectData.forEach((data, index) => {
          const teacher = teachersData[index];
          const duplicateKey = `${teacher.first_name}_${teacher.last_name}`;
          subjectMap[duplicateKey] = data;
        });
        setDuplicateSubjects(subjectMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTeachersAndData();
  }, []);

  const fetchDuplicateEducationLevels = async (firstName, lastName) => {
    try {
      const response = await axios.get('https://scolara-backend.onrender.com/api/duplicate-teacher-education-levels/', {
        params: { first_name: firstName, last_name: lastName },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des doublons des niveaux d\'éducation:', error);
      return [];
    }
  };

  // Fonction pour récupérer les doublons des sujets
  const fetchDuplicateSubjects = async (firstName, lastName) => {
    try {
      const response = await axios.get('https://scolara-backend.onrender.com/api/duplicate-teacher-subjects/', {
        params: { first_name: firstName, last_name: lastName },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des doublons des sujets:', error);
      return [];
    }
  };



  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    const subjectName = subjects.find(subject => subject.id === teacher.subject)?.name?.toLowerCase() || '';
    const educationLevelName = educationLevels.find(level => level.id === teacher.education_level)?.name?.toLowerCase() || '';
  
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      subjectName.includes(searchTerm.toLowerCase()) ||
      educationLevelName.includes(searchTerm.toLowerCase())
    );
  });
  

  const filterDuplicateTeachers = (teachers) => {
    const uniqueTeachers = {};
  
    teachers.forEach((teacher) => {
      // Nettoyer et normaliser la clé
      const normalizedFirstName = teacher.first_name.trim().toLowerCase();
      const normalizedLastName = teacher.last_name.trim().toLowerCase();
      const key = `${normalizedFirstName}_${normalizedLastName}`;
  
      // Si l'entrée n'existe pas ou si l'enseignant actuel a un ID plus petit (plus ancien)
      if (!uniqueTeachers[key] || uniqueTeachers[key].id > teacher.id) {
        uniqueTeachers[key] = teacher;
      }
    });
  
    return Object.values(uniqueTeachers);
  };
  
  

  const paginatedTeachers = filterDuplicateTeachers(filteredTeachers).slice(
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
    const csvHeader = "Prénom,Nom,Email,Téléphone,Statut de Paiement,Niveaux d'Éducation,Matières\n";
    
    const csvContent = csvHeader + teachers.map((teacher) => {
        const duplicateKey = `${teacher.first_name}_${teacher.last_name}`;
        const educationLevels = duplicateEducationLevels[duplicateKey] || [];
        const subjects = duplicateSubjects[duplicateKey] || [];
        
        const educationLevelsString = educationLevels.map((level) => level.education_level__name).join(", ");
        const subjectsString = subjects.map((subject) => subject.subject__name).join(", ");
        
        return `${teacher.first_name},${teacher.last_name},${teacher.email},${teacher.phone_number},${teacher.paid ? 'Payé' : 'Non Payé'},"${educationLevelsString}","${subjectsString}"`;
    }).join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Teachers.csv");
    document.body.appendChild(link);
    link.click();
};

const downloadXLSX = () => {
  const formattedData = teachers.map((teacher) => {
      const duplicateKey = `${teacher.first_name}_${teacher.last_name}`;
      const educationLevels = duplicateEducationLevels[duplicateKey] || [];
      const subjects = duplicateSubjects[duplicateKey] || [];

      const educationLevelsString = educationLevels.map((level) => level.education_level__name).join(", ");
      const subjectsString = subjects.map((subject) => subject.subject__name).join(", ");

      return {
          'Prénom': teacher.first_name,
          'Nom': teacher.last_name,
          'Email': teacher.email,
          'Téléphone': teacher.phone_number,
          'Statut de paiement': teacher.paid ? 'Payé' : 'Non Payé',
          'Niveaux d\'éducation': educationLevelsString,
          'Matières': subjectsString,
      };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enseignants');
  XLSX.writeFile(workbook, 'Teachers.xlsx');
};

  const handleGenerateEmail = () => {
    // Fonction pour générer l'acronyme du niveau d'éducation
    const generateEducationAcronym = (educationLevel) => {
      if (!educationLevel) return 'level';

      let words = educationLevel.split(/\s+/);
      
      // Garder le premier chiffre si présent (ex: "1ère", "2ème", etc.)
      let acronym = words[0].match(/\d+/) ? words[0].match(/\d+/)[0] : '';

      // Ajouter les initiales des mots suivants (ex: "année collège" → "AC")
      words.slice(1).forEach(word => {
        acronym += word.charAt(0).toUpperCase();
      });

      return acronym;
    };

    // Fonction pour générer l'acronyme de la matière (4 premières lettres de chaque mot)
    const generateSubjectAcronym = (subject) => {
      if (!subject) return 'gen';

      let words = subject.split(/\s+/); // Séparer les mots
      let acronym = words.map(word => word.substring(0, 4).toLowerCase()).join(''); // Prendre les 4 premières lettres de chaque mot

      return acronym.length > 6 ? acronym.slice(0, 6) : acronym; // Limiter à 6 lettres max pour éviter des acronymes trop longs
    };

    // Trouver le nom du sujet sélectionné et générer son acronyme
    const selectedSubject = subjects.find(subject => subject.id === newTeacherData.subject);
    const subjectName = selectedSubject ? generateSubjectAcronym(selectedSubject.name) : 'gen';

    // Trouver le nom du niveau d'éducation sélectionné et générer son acronyme
    const selectedEducationLevel = educationLevels.find(level => level.id === newTeacherData.education_level);
    const educationLevelName = selectedEducationLevel ? generateEducationAcronym(selectedEducationLevel.name) : 'level';

    // Générer l'email avec nom, prénom, niveau d'éducation et matière
    const email = `${newTeacherData.first_name.toLowerCase()}.${newTeacherData.last_name.toLowerCase()}.${educationLevelName}.${subjectName}@scolara.com`;

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
    setLoadingDelete(true); // Activer le loader
    try {
        await deleteTeacher(teacherId);

        // Rafraîchir la page après suppression
        window.location.reload();
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'enseignant:', error);
    } finally {
        setLoadingDelete(false); // Désactiver le loader
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

    setLoadingForm(true); // Démarrer le spinner

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

        // Rafraîchir la page après ajout
        window.location.reload();
    } catch (error) {
        console.error('Erreur lors de la création ou de la modification de l\'enseignant:', error);
    } finally {
        setLoadingForm(false); // Arrêter le spinner
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
            <th>Prénom</th>
            <th>Nom</th>
            <th>Niveaux d'éducation</th>
            <th>Matière(s)</th>
            <th>Téléphone</th>
            <th>Statut de Paiement</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTeachers.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
                Aucun enseignant disponible.
              </td>
            </tr>
          ) : (
            paginatedTeachers.map((teacher) => {
              const duplicateKey = `${teacher.first_name}_${teacher.last_name}`;
              const educationLevels = duplicateEducationLevels[duplicateKey] || [];
              const subjects = duplicateSubjects[duplicateKey] || [];

              return (
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
                  <td>
                  {educationLevels.length > 0
                    ? educationLevels.map((level) => level.education_level__name).join(', ')
                    : <div><PulseLoader size={8} color='#ffcc00' /></div>}
                  </td>
                  <td>
                    {subjects.length > 0 ? (
                      <ul>
                        {[...new Set(subjects.map(subject => subject.subject__name))].map((uniqueSubject, index) => (
                          <div key={index}>{uniqueSubject}</div>
                        ))}
                      </ul>
                    ) : (
                      <div><PulseLoader color="#4e7dad" size={8}/></div>
                    )}
                  </td>

                  <td>{teacher.phone_number}</td>
                  <td>{getPaymentStatus(teacher.paid)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(teacher);
                        }}
                        className="edit-student-button"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(teacher.id);
                        }}
                        className="student-button-delete"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
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
          <i className="fas fa-plus"></i> Ajouter un Nouvel Enseignant
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
          <button type="submit" className="create-student-button" disabled={loadingForm}>
              {loadingForm ? (
                    <div className="overlay-loader">
                        <div className="CRUD-loading-container">
                            <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                        </div>
                    </div>
              ) : (
                  editTeacherData ? 'Modifier l\'Enseignant' : 'Créer l\'Enseignant'
              )}
          </button>
        </form>
      )}
      {loadingDelete && (
          <div className="overlay-loader">
              <div className="CRUD-loading-container">
                  <MoonLoader size={50} color="#ffcc00" loading={loadingDelete} />
              </div>
          </div>
      )}

      <div className='whitetext'>Scolara</div>
    </div>
  );
};

export default TeacherList;