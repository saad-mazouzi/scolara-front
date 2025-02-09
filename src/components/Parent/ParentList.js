import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchParents, createParent, deleteParent } from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight, faSearch, faRobot } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import './Parent.css';
import { PuffLoader, MoonLoader } from 'react-spinners';

const ParentList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const[loadingDelete, setLoadingDelete] = useState(false); // État pour le chargement de la suppression
  const [loadingForm, setLoadingForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [searchTerm, setSearchTerm] = useState('');
  const [newParentData, setNewParentData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const getParents = async () => {
      try {
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
          throw new Error('Aucun ID d\'école trouvé dans les cookies.');
        }
        const parentsData = await fetchParents(schoolId);
        setParents(parentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getParents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteClick = async (parentId) => {
    setLoadingDelete(true);
    try {
      await deleteParent(parentId);
      const updatedParents = parents.filter(parent => parent.id !== parentId);
      setParents(updatedParents);
    } catch (error) {
      console.error('Erreur lors de la suppression du parent:', error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
            throw new Error("ID de l'école introuvable dans les cookies.");
        }

        const parentData = new FormData();
        parentData.append('first_name', newParentData.first_name.trim());
        parentData.append('last_name', newParentData.last_name.trim());
        parentData.append('email', newParentData.email.trim());
        parentData.append('phone_number', newParentData.phone_number.trim());
        parentData.append('school', schoolId);

        if (newParentData.password) {
            parentData.append('password', newParentData.password);
        }

        console.log("🔍 Données envoyées :", Object.fromEntries(parentData.entries()));

        setLoadingForm(true);

        await createParent(parentData);

        // Recharger la liste des parents
        const updatedParents = await fetchParents(schoolId);
        setParents(updatedParents);

        // Réinitialisation du formulaire
        setShowForm(false);
        setNewParentData({
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            password: '',
        });
    } catch (error) {
        console.error("❌ Erreur lors de la création du parent:", error);
    } finally {
        setLoadingForm(false);
    }
};


  const generateEmail = () => {
    const email = `${newParentData.first_name.toLowerCase()}.${newParentData.last_name.toLowerCase()}@scolara.com`;
    setNewParentData((prevData) => ({
      ...prevData,
      email,
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredParents = parents.filter(parent => {
    const fullName = `${parent.first_name} ${parent.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const paginatedParents = filteredParents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
      return (
          <div className="loading-container">
              <PuffLoader size={60} color="#ffcc00" loading={loading} />
          </div>
      );
  }

  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewParentData((prevData) => ({
      ...prevData,
      password
    }));
  };

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(parents.map(parent => ({
      'Prénom': parent.first_name,
      'Nom': parent.last_name,
      'Email': parent.email,
      'Téléphone': parent.phone_number,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parents');
    XLSX.writeFile(workbook, 'parents.xlsx');
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      parents.map(parent => 
        `${parent.first_name},${parent.last_name},${parent.email},${parent.phone_number}`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parents.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <button onClick={downloadXLSX} className="xlsx-download-button">Exporter XLSX</button>
      <button onClick={downloadCSV} className="csv-download-button">Exporter CSV</button>
      <div className="student-list-title">
        <h3>Tableau des parents inscrits</h3>
      </div>
      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un parent..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table>
      <thead>
  <tr>
    <th>Nom</th>
    <th>Prénom</th>
    <th>Email</th>
    <th>Téléphone</th>
    <th>Enfant(s)</th> {/* Nouvelle colonne */}
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {paginatedParents.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
        Aucun parent disponible.
      </td>
    </tr>
  ) : (
    paginatedParents.map(parent => (
      <tr key={parent.id}>
        <td>{parent.last_name}</td>
        <td>{parent.first_name}</td>
        <td>{parent.email}</td>
        <td>{parent.phone_number}</td>
        <td>
          {parent.children && parent.children.length > 0 ? (
            parent.children.map(child => (
              <div key={child.id}>
                {child.first_name} {child.last_name}
              </div>
            ))
          ) : (
            <span>Non défini(es)</span>
          )}
        </td>
        <td>
          <button onClick={() => handleDeleteClick(parent.id)} className="student-button-delete">Supprimer</button>
        </td>
      </tr>
    ))
  )}
</tbody>


      </table>

      {loadingDelete && (
          <div className="overlay-loader">
              <div className="CRUD-loading-container">
                  <MoonLoader size={50} color="#ffcc00" loading={loadingDelete} />
              </div>
          </div>
      )}
      
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

      <div>
        {showForm && (
          <button className="cancel-student-button" onClick={() => setShowForm(false)}>
            <i className="fas fa-times"></i> Annuler
          </button>
        )}

        {!showForm && (
          <button className="create-student-button" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Créer un Nouveau Parent
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="first_name"
              placeholder="Prénom"
              value={newParentData.first_name}
              onChange={handleInputChange}
              required
              className="student-input-lastname"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Nom"
              value={newParentData.last_name}
              onChange={handleInputChange}
              required
              className="student-input-lastname"
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Téléphone"
              value={newParentData.phone_number}
              onChange={handleInputChange}
              required
              className="student-input-lastname"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newParentData.email}
              onChange={handleInputChange}
              required
              className="student-input-lastname"
            />
          <button type="button" onClick={generateEmail} className="generate-password-button">
            <FontAwesomeIcon icon={faRobot} className="icon" />
            Générer un e-mail
          </button>
            <input
              type="text"
              name="password"
              placeholder="Mot de passe"
              value={newParentData.password}
              readOnly
              className="student-input-lastname"
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
                  'Créer le parent'
              )}
          </button>
        </form>
        )}
        <div className='whitetext'>Scolara</div>
      </div>
    </div>
  );
};

export default ParentList;
