import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axiosInstance from '../../axiosConfig';
import './Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


const Navbar = () => {
    const [cookies, , removeCookie] = useCookies([
        'userFirstName', 'jwtToken', 'refreshToken',
        'profilePicture', 'SchoolName', 'TeacherId', 'UserRole'
    ]);
    const userFirstName = cookies.userFirstName;
    const teacherId = cookies.TeacherId;
    const userRole = cookies.UserRole;
    const SchoolName = cookies.SchoolName;

    const [profilePicture, setProfilePicture] = useState('');
    const [notifications, setNotifications] = useState([]); // Stocker les notifications
    const [showNotifications, setShowNotifications] = useState(false); // Contrôle d'affichage de la liste
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.profilePicture) {
            setProfilePicture(decodeURIComponent(`http://127.0.0.1:8000${cookies.profilePicture}`));
        }

        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get('/notifications/');
                setNotifications(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications :", error);
            }
        };

        fetchNotifications();
    }, [cookies.profilePicture]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('users/logout/');
            removeCookie('userFirstName', { path: '/' });
            removeCookie('SchoolName', { path: '/' });
            removeCookie('jwtToken', { path: '/' });
            removeCookie('refreshToken', { path: '/' });
            removeCookie('profilePicture', { path: '/' });
            removeCookie('TeacherId', { path: '/' });
            removeCookie('UserRole', { path: '/' });
            navigate('/login');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const handleNotificationClick = async () => {
        if (showNotifications) {
            // Supprimer les notifications de la DB lorsque l'utilisateur ferme la liste
            try {
                for (const notification of notifications) {
                    await axiosInstance.delete(`/notifications/${notification.id}/`);
                }
                setNotifications([]); // Réinitialiser les notifications dans l'état
            } catch (error) {
                console.error("Erreur lors de la suppression des notifications :", error);
            }
        }
        setShowNotifications(!showNotifications); // Alterner l'affichage de la liste
    };

    const handleNotificationItemClick = async (chatRoomId, notificationId) => {
        try {
            // Supprimer la notification de la base de données
            await axiosInstance.delete(`/notifications/${notificationId}/`);
            // Rediriger vers la page de chat
            navigate(`/chat/${chatRoomId}`);
        } catch (error) {
            console.error("Erreur lors de la gestion de la notification :", error);
        }
    };
    
    

    const handleProfileClick = () => {
        if (userRole === 1) {
            navigate(`/admin/${teacherId}`);
        } else if (userRole === 3) {
            navigate(`/teacher-profile/${teacherId}`);
        } else if (userRole === 2) {
            navigate(`student-profile/${teacherId}`);
        } else if (userRole === 4) {
            navigate(`parent-profile/${teacherId}`);
        } else if (userRole === 5) {
            navigate(`transport-station/${teacherId}`);
        } else {
            console.warn("Rôle inconnu ou utilisateur non authentifié");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {userFirstName && teacherId && (
                    <div
                        className="navbar-user-link"
                        onClick={handleProfileClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="navbar-user">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Profile"
                                    className="navbar-profile-picture"
                                />
                            ) : (
                                <div className="navbar-placeholder-picture">Photo</div>
                            )}
                            <span>Bonjour, <strong>{userFirstName}</strong></span>
                        </div>
                    </div>
                )}
            </div>
            <div className="navbar-center">
                {SchoolName && (
                    <div className="navbar-school-name">
                        <h3>{SchoolName}</h3>
                    </div>
                )}
            </div>
            <div className="navbar-right">
                <div className="notification-container">
                    <div className="notification-icon" onClick={handleNotificationClick}>
                        <i className={`fas fa-bell ${notifications.length > 0 && !showNotifications ? 'has-events' : ''}`}></i>
                        {notifications.length > 0 && !showNotifications && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}
                    </div>
                    {showNotifications && (
                        <div className="notification-dropdown">
                            {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <div key={index} className="notification-item">
                                        {notif.message}
                                    </div>
                                ))
                            ) : (
                                <div className="notification-item">Aucune notification</div>
                            )}
                        </div>
                    )}
                </div>
                {userFirstName ? (
                    <button className="navbar-link logout-button" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt logout-icon"></i> Déconnexion
                    </button>
                ) : (
                    <>
                        <button
                            className="navbar-link"
                            onClick={() => navigate('/register')}
                        >
                            Inscription
                        </button>
                        <button
                            className="navbar-link"
                            onClick={() => navigate('/login')}
                        >
                            Connexion
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
