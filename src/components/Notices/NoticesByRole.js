import React, { useState, useEffect } from 'react';
import { fetchNoticesForUser } from '../../APIServices';
import './Notices.css'; // Assurez-vous que le CSS est bien appliqué
import { PuffLoader } from 'react-spinners';
import Cookies from 'js-cookie';


const NoticesByRole = ({ schoolId }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const schoolId = Cookies.get('SchoolId');
    console.log("School ID reçu dans NoticesByRole:", schoolId);
    const loadNotices = async () => {
      try {
        setLoading(true);
        const data = await fetchNoticesForUser(schoolId);
        setNotices(data);
      } catch (err) {
        setError("Impossible de récupérer les avis");
      } finally {
        setLoading(false);
      }
    };
  
    loadNotices();
  }, [schoolId]);
  

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
      {notices.length > 0 ? (
        <ul className="notices-list">
          {notices.map((notice) => (
            <li key={notice.id} className="notice-item">
              <h2 className="notice-title">{notice.title}</h2>
              <p className="notice-content">{notice.content}</p>
              <p className="notice-date">Créé le: {new Date(notice.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun avis disponible.</p>
      )}
    </div>
  );
};

export default NoticesByRole;
