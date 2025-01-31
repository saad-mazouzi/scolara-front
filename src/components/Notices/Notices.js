import React, { useState, useEffect } from 'react';
import { fetchNoticesForUser, deleteNotice, createNotice, fetchRoles } from '../../APIServices';
import './Notices.css'; // Import the CSS file for styling

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [roles, setRoles] = useState([]); // For role selection
  const [newNotice, setNewNotice] = useState({ title: '', content: '', roles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSchoolIdFromCookies = () => {
    const cookies = document.cookie.split(';');
    const schoolCookie = cookies.find((cookie) => cookie.trim().startsWith('SchoolId='));
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

  const handleRoleSelection = (e) => {
    const { value, checked } = e.target;
    const roleId = parseInt(value, 10); // Convert string value to integer
    if (!isNaN(roleId)) { // Ensure roleId is a valid number
      if (checked) {
        setNewNotice({ ...newNotice, roles: [...newNotice.roles, roleId] });
      } else {
        setNewNotice({ ...newNotice, roles: newNotice.roles.filter((role) => role !== roleId) });
      }
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
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
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="notices-container">
      <h3 className="student-list-title">Avis</h3>

      <form className="notice-form" onSubmit={handleCreateNotice}>
        <div className="form-group">
          <label>Title :</label>
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
          <label>Content :</label>
          <textarea
            name="content"
            className="form-control"
            value={newNotice.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
            <label>Roles :</label>
            <div className="checkbox-group">
                {roles.map((role) => (
                <label key={role.id} className="checkbox-label">
                    <input
                    type="checkbox"
                    value={role.id} // Utiliser uniquement l'ID
                    checked={newNotice.roles.includes(role.id)}
                    onChange={handleRoleSelection}
                    />
                    {role.name}
                </label>
                ))}
            </div>
        </div>
        <button type="submit" className="submit-button">Ajouter Avis</button>
      </form>

      {notices.length > 0 ? (
        <ul className="notices-list">
          {notices.map((notice) => (
            <li key={notice.id} className="notice-item">
              <h2 className="notice-title">{notice.title}</h2>
              <p className="notice-content">{notice.content}</p>
              <p className="notice-date">
                Created At: {new Date(notice.created_at).toLocaleString()}
              </p>
              <button
                className="notice-delete-button"
                onClick={() => handleDelete(notice.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notices available.</p>
      )}
    </div>
  );
};

export default Notices;
