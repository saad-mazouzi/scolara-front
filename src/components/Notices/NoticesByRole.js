import React, { useState, useEffect } from 'react';
import { fetchNoticesForUser } from '../../APIServices';
import './Notices.css'; // Assurez-vous que le CSS est bien appliqué

const NoticesByRole = ({ schoolId }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="notices-container">
      <h3 className="notices-title">Mes Avis</h3>
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
        <p>Aucun avis disponible pour votre rôle.</p>
      )}
    </div>
  );
};

export default NoticesByRole;
