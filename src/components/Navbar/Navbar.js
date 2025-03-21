import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axiosInstance from '../../axiosConfig';
import './Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { MoonLoader } from 'react-spinners';


const Navbar = ({ isSidebarOpen }) => {
    const [cookies, , removeCookie] = useCookies([
        'userFirstName', 'jwtToken', 'refreshToken',
        'profilePicture', 'SchoolName', 'TeacherId', 'UserRole'
    ]);
    const userFirstName = cookies.userFirstName;
    const teacherId = cookies.TeacherId;
    const userRole = cookies.UserRole;
    const SchoolName = cookies.SchoolName;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    const [profilePicture, setProfilePicture] = useState('');
    const [notifications, setNotifications] = useState([]); // Stocker les notifications
    const [showNotifications, setShowNotifications] = useState(false); // Contrôle d'affichage de la liste
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.profilePicture) {
            setProfilePicture(decodeURIComponent(`${cookies.profilePicture}`));
            console.log("Profile picture du navbar:", profilePicture);
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
        setLoading(true);
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
        } finally {
            setLoading(false);
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

    const handleNotificationItemClick = () => {
        if (userRole === 1) {
            navigate("/chat");
        } else if (userRole === 2) {
            navigate("/chat-student");
        }else if (userRole === 3) {
            navigate("/chat-teacher");
        }else if (userRole === 4) {
            navigate("/chat-parent");
        }else if (userRole === 5) {
            navigate("/chat-driver");
        }else {
            console.warn("Rôle inconnu ou utilisateur non authentifié");
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
            navigate(`driver-profile/${teacherId}`);
        } else {
            console.warn("Rôle inconnu ou utilisateur non authentifié");
        }
    };

    return (
        <>
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
                <div 
                    className="navbar-right" 
                    style={{ marginRight: isSidebarOpen ? '320px' : '50px' }}
                >
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
                                        <div
                                            key={index}
                                            className="notification-item"
                                            onClick={handleNotificationItemClick}
                                        >
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
                        navigate('/login')
                    )}
                </div>
            </nav>
    
            {loading && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loading} />
                    </div>
                </div>
            )}
        </>
    );
    

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
            <div 
                className="navbar-right" 
                style={{ marginRight: isSidebarOpen ? '320px' : '50px' }}
            >
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
                                    <div
                                        key={index}
                                        className="notification-item"
                                        onClick={handleNotificationItemClick} // Redirige directement sans ID
                                    >
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
                    navigate('/login')
                )}
            
            </div>
        </nav>
    );
};

export default Navbar;