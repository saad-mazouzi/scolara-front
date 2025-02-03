import React, { useState, useEffect } from 'react';
import { fetchNoticesForUser, deleteNotice, createNotice, fetchRoles } from '../../APIServices';
import './Notices.css'; // Import the CSS file for styling
import { PuffLoader , MoonLoader} from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [roles, setRoles] = useState([]); // For role selection
  const [newNotice, setNewNotice] = useState({ title: '', content: '', roles: [] });
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState(null);

  const getSchoolIdFromCookies = () => {
    const cookies = document.cookie.split(';');
    const schoolCookie = cookies.find((cookie) => cookie.trim().startsWith('SchoolId='));
    console.log('School cookie:', schoolCookie); // Debugging
    return schoolCookie ? parseInt(schoolCookie.split('=')[1], 10) : null; // Ensure schoolId is an integer
  };

  const schoolId = getSchoolIdFromCookies();

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        const data = await fetchNoticesForUser(schoolId);
        setNotices(data);
      } catch (err) {
        setError('Failed to fetch notices');
      } finally {
        setLoading(false);
      }
    };

    const loadRoles = async () => {
      try {
        const data = await fetchRoles(); // Fetch roles from API
        setRoles(data);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };

    loadNotices();
    loadRoles();
  }, [schoolId]);

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(noticeId);
        setNotices((prevNotices) => prevNotices.filter((notice) => notice.id !== noticeId));
      } catch (err) {
        alert('Failed to delete notice');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice({ ...newNotice, [name]: value });
  };

  const handleRoleSelection = (roleId) => {
    setNewNotice((prevNotice) => {
      const updatedRoles = prevNotice.roles.includes(roleId)
        ? prevNotice.roles.filter((role) => role !== roleId)
        : [...prevNotice.roles, roleId];
      return { ...prevNotice, roles: updatedRoles };
    });
  };

  const handlePrintNotice = (notice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
  
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression de l'Avis</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh; /* Hauteur totale de la page */
                margin: 0;
                padding: 0;
              }
              h2 { 
                text-align: center; 
                color: #333; 
              }
              .notice-container { 
                border: 1px solid #ddd; 
                padding: 20px; 
                border-radius: 5px; 
                width: 80%; 
                max-width: 600px; 
                box-shadow: 0 0 10px rgba(0,0,0,0.1); 
                background-color: white;
              }
              .notice-content { 
                margin: 10px 0; 
                font-size: 16px; 
                margin-bottom: 20px; 
              }
              .notice-roles { 
                margin-top: 15px; 
                font-size: 14px; 
                font-weight: bold; 
              }
              .role-button { 
                display: inline-block; 
                padding: 5px 10px; 
                background-color: gray; 
                color: white; 
                border-radius: 5px; 
                margin-right: 5px; 
                font-size: 12px; 
              }
            </style>
          </head>
          <body>
            <div class="notice-container">
              <h2><u>${notice.title}</u></h2>
              <p class="notice-content">${notice.content}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
};

  

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      const noticeData = { 
        ...newNotice, 
        roles: newNotice.roles.filter((role) => !isNaN(role)), // Filter out invalid roles
        school: schoolId 
      };
      console.log('Data sent to backend:', noticeData); // Debugging
      const createdNotice = await createNotice(noticeData);
      setNotices((prevNotices) => [createdNotice, ...prevNotices]);
      setNewNotice({ title: '', content: '', roles: [] }); // Reset form
    } catch (err) {
      console.error('Error creating notice:', err.response?.data || err);
      alert('Failed to create notice');
    } finally {
      setLoadingForm(false);
    }
  };

  if (loading) {
      return (
          <div className="loading-container">
              <PuffLoader size={60} color="#ffcc00" loading={loading} />
          </div>
      );
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="notices-container">
      <h3 className="student-list-title">Avis</h3>

      <form className="notice-form" onSubmit={handleCreateNotice}>
        <div className="form-group">
          <label>Titre :</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={newNotice.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contenu :</label>
          <textarea
            name="content"
            className="form-control"
            value={newNotice.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
        <label>Rôles :</label>
        <div className="role-selection-group">
            {roles.map((role) => (
                <button
                    key={role.id}
                    type="button"
                    className={newNotice.roles.includes(role.id) ? "role-button selected" : "role-button"}
                    onClick={() => handleRoleSelection(role.id)}
                    style={{ backgroundColor: newNotice.roles.includes(role.id) ? 'green' : 'lightgray', color: 'white' }}
                >
                    {role.name}
                </button>
            ))}
        </div>
      </div>
        <button type="submit" className="submit-button">Ajouter Avis</button>
      </form>


      {notices.length > 0 ? (
        <ul className="notices-list">
          {notices.map((notice) => (          
            <li key={notice.id} className="notice-item">
              <button className="notice-print-button" onClick={() => handlePrintNotice(notice)}>
                <FontAwesomeIcon icon={faPrint} /> Imprimer
              </button>

              <h2 className="notice-title"><u>{notice.title}</u></h2>
              <p className="notice-content">{notice.content}</p>
              <p className="notice-date">Créé à: {new Date(notice.created_at).toLocaleString()}</p>
              <p className="notice-roles">
                <div className="role-selection-group">
                  {notice.roles.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <button
                        key={role.id}
                        type="button"
                        className="role-button"
                        style={{ backgroundColor: 'gray', color: 'white', cursor: 'default' }}
                        disabled
                      >
                        {role.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </p>
                <button className="notice-delete-button" onClick={() => handleDelete(notice.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>pas d'avis disponible</p>
      )}
      {loadingForm && (
          <div className="overlay-loader">
              <div className="CRUD-loading-container">
                  <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
              </div>
          </div>
      )}
    </div>
  );
};

export default Notices;

