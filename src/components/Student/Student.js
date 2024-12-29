import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchStudents, fetchEducationLevelsBySchool, createStudent, updateStudent, deleteStudent } from '../../APIServices'; // Assurez-vous d'importer la fonction updateStudent
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Pour la navigation
import './Student.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'; // Import XLSX
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { PuffLoader } from 'react-spinners';



const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const itemsPerPage = 4; // Nombre d'étudiants par page
  const [error, setError] = useState(null);
  

  
  const [newStudentData, setNewStudentData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    school: null,
    education_level: '',
    gender: '', // Ajout du champ gender
  });
  const [editStudentData, setEditStudentData] = useState(null); // État pour les données de l'étudiant à modifier
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // État pour la barre de recherche

  useEffect(() => {
    const getStudentsAndEducationLevels = async () => {
      try {
        const schoolId = Cookies.get('SchoolId');
        console.log("School ID from Cookies:", schoolId);
  
        if (!schoolId) {
          throw new Error("Aucun ID d'école trouvé dans les cookies.");
        }
  
        // Récupère uniquement les étudiants de l'école correspondante
        const studentsData = await fetchStudents(schoolId);
        console.log("Students Data:", studentsData);
        setStudents(studentsData);
  
        const levelsData = await fetchEducationLevelsBySchool(schoolId);
        console.log("Education Levels Data:", levelsData);
        setEducationLevels(levelsData);
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };
  
    getStudentsAndEducationLevels();
  }, []);

  const handleGenerateEmail = () => {
    const email = `${newStudentData.first_name.toLowerCase()}.${newStudentData.last_name.toLowerCase()}@scolara.com`;
    setNewStudentData((prevData) => ({
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

  if (loading) {
      return (
          <div className="loading-container">
              <PuffLoader size={60} color="#ffcc00" loading={loading} />
          </div>
      );
  }

  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewStudentData((prevData) => ({
      ...prevData,
      password
    }));
  };

  const getEducationLevelName = (levelId) => {
    const level = educationLevels.find((lvl) => lvl.id === levelId);
    return level ? level.name : 'N/A';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteClick = async (studentId) => {
    try {
      await deleteStudent(studentId);
      const updatedStudents = students.filter(student => student.id !== studentId);
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Met à jour l'état de la recherche
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

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()); // Filtrer les étudiants en fonction du terme de recherche
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowClick = (studentId) => {
    navigate(`/student/${studentId}`); // Navigue vers la page de profil de l'étudiant
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
            throw new Error('ID de l\'école introuvable dans les cookies.');
        }

        // Création de l'objet FormData
        const studentData = new FormData();
        studentData.append('first_name', newStudentData.first_name);
        studentData.append('last_name', newStudentData.last_name);
        studentData.append('email', newStudentData.email);
        studentData.append('phone_number', newStudentData.phone_number);
        studentData.append('school', schoolId); // Ajout de l'ID de l'école
        studentData.append('education_level', newStudentData.education_level);
        studentData.append('gender', newStudentData.gender); // Ajout du genre

        // Ajout du mot de passe s'il est généré
        if (newStudentData.password) {
            studentData.append('password', newStudentData.password);
        }

        // Débogage : afficher les données avant l'envoi
        console.log('Données envoyées:', Object.fromEntries(studentData.entries()));

        // Création ou modification de l'étudiant
        if (editStudentData) {
            const result = await updateStudent(editStudentData.id, studentData);
            console.log('Étudiant modifié avec succès:', result);
        } else {
            const result = await createStudent(studentData);
            console.log('Étudiant créé avec succès:', result);
        }

        // Mise à jour de la liste des étudiants après modification ou création
        const updatedStudents = await fetchStudents(schoolId);
        setStudents(updatedStudents);

        // Réinitialiser les champs du formulaire
        setShowForm(false);
        setNewStudentData({
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            school: null,
            education_level: null,
            gender: '',
            password: '', // Réinitialisation du mot de passe
        });
        setEditStudentData(null);
    } catch (error) {
        console.error('Erreur lors de la création ou de la modification de l\'étudiant:', error);
    }
};

  
  
  const handleEditClick = (student) => {
    setEditStudentData(student); // Définit l'étudiant à modifier
    setNewStudentData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone_number: student.phone_number,
      education_level: student.education_level,
      gender: student.gender, // Set gender for editing
    });
    setShowForm(true); // Montre le formulaire
  };

  const downloadCSV = () => {
    const csvHeader = "Prénom,Nom,Email,Téléphone,Niveau d'Éducation,Genre,Statut de Paiement\n"; // En-tête CSV avec "Statut de Paiement"
    const csvContent = csvHeader + students.map(student => 
        `${student.first_name},${student.last_name},${student.email},${student.phone_number},${getEducationLevelName(student.education_level)},${student.gender},${student.paid ? 'Payé' : 'Non Payé'}`
    ).join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
  };

  
  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
      'Prénom': student.first_name,
      'Nom': student.last_name,
      'Email': student.email,
      'Téléphone': student.phone_number,
      'Statut de paiement': student.paid ? 'Payé' : 'Non Payé', // Ajouter le statut de paiement
      'Niveau d\'éducation': getEducationLevelName(student.education_level),
      'Genre': student.gender,
    })));
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Étudiants');
    XLSX.writeFile(workbook, 'students.xlsx');
  };
  

  return (
    <div>
      <button onClick={downloadCSV} className="csv-download-button">Exporter CSV</button>
      <button onClick={downloadXLSX} className="xlsx-download-button">Exporter XLSX</button>
      <div className="student-list-title">
        <h3>Table des Étudiants</h3>
      </div>
      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Photo de Profil</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Niveau d'éducation</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Statut de Paiement</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.map(student => (
            <tr 
              key={student.id} 
              onClick={() => handleRowClick(student.id)} // Ligne cliquable
              style={{ cursor: 'pointer' }} // Curseur pointeur pour indiquer que c'est cliquable
            >
              <td>
                {student.profile_picture ? (
                  <img
                    className="student-img"
                    src={`${student.profile_picture}`}
                    alt={`${student.first_name} ${student.last_name}`}
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                ) : (
                  <span>Aucune image</span>
                )}
              </td>
              <td>{student.first_name}</td>
              <td>{student.last_name}</td>
              <td>{getEducationLevelName(student.education_level)}</td>
              <td>{student.email}</td>
              <td>{student.phone_number}</td>
              <td>{getPaymentStatus(student.paid)}</td> {/* Statut de paiement */}
              <td>
                <div className="action-buttons">
                  {/* Bouton Modifier */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation du clic
                      handleEditClick(student);
                    }} 
                    className="edit-student-button"
                  >
                    Modifier
                  </button>
                  {/* Bouton Supprimer */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation du clic
                      handleDeleteClick(student.id);
                    }} 
                    className="student-button-delete"
                  >
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
          <i className="fas fa-times"></i>
          Annuler
        </button>
      ) : (
        <button className="create-student-button" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i>
          Créer un Nouvel Étudiant
        </button>
      )}
      <div className='whitetext'>Scolara</div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={newStudentData.first_name}
            onChange={handleInputChange}
            required
            className="student-input-firstname"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={newStudentData.last_name}
            onChange={handleInputChange}
            required
            className="student-input-lastname"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Téléphone"
            value={newStudentData.phone_number}
            onChange={handleInputChange}
            required
            className="student-input-phone"
          />
          <select
            name="education_level"
            value={newStudentData.education_level}
            onChange={handleInputChange}
            required
            className="student-input-education-level"
          >
            <option value="" disabled>
              Sélectionner un Niveau d'Éducation
            </option>
            {educationLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          <select
            name="gender"
            value={newStudentData.gender}
            onChange={handleInputChange}
            required
            className="student-input-education-level"
          >
            <option value="" disabled>Sélectionner le Genre</option>
            <option value="MALE">Masculin</option>
            <option value="FEMALE">Féminin</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newStudentData.email}
            onChange={handleInputChange}
            required
            className="student-input-email"
          />
          <button type="button" onClick={handleGenerateEmail} className="generate-password-button">
            <FontAwesomeIcon icon={faRobot} className="icon" />
            Générer un e-mail
          </button>
          <input
            type="text"
            name="password"
            placeholder="Mot de passe généré"
            value={newStudentData.password}
            readOnly
            className="student-input-firstname"
          />
          <button type="button" onClick={handleGeneratePassword} className="generate-password-button">
            <FontAwesomeIcon icon={faRobot} className="icon" />
            Générer un mot de passe
          </button>
          <button type="submit" className="create-student-student-button">
            {editStudentData ? 'Modifier l\'Étudiant' : 'Créer l\'Étudiant(e)'}
          </button>
        </form>
      )}
      <div className='whitetext'>Scoalra</div>
    </div>
  );
};

export default StudentList;