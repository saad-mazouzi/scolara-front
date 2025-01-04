import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchUsersByRoleSchool, fetchMessages, checkExistingChatRoom, fetchAdminBySchool, createConversation } from '../../APIServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Chat.css';
import { PuffLoader } from 'react-spinners';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const roleId = searchParams.get('role_id');
    const navigate = useNavigate();

    const currentUserId = parseInt(Cookies.get('TeacherId'), 10);
    const currentUserRole = parseInt(Cookies.get('UserRole'), 10);
    const schoolId = Cookies.get('SchoolId');

    const mapRoleIdToName = (id) => {
        const roleMapping = {
            1: 'Administration',
            2: 'Étudiants',
            3: 'Enseignants',
            4: 'Parents',
            5: 'Chauffeurs',
        };
        return roleMapping[id] || 'Utilisateurs';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchUsersAndConversations = async () => {
            try {
                let fetchedUsers;

                // Si roleId est "1" (Administration), récupérer uniquement les administrateurs de l'école
                if (roleId === '1') {
                    const admin = await fetchAdminBySchool(schoolId);
                    fetchedUsers = admin ? [admin] : [];
                } else {
                    // Sinon, récupérer les utilisateurs selon le rôle
                    fetchedUsers = await fetchUsersByRoleSchool(schoolId,roleId);
                }

                const usersWithLastMessage = await Promise.all(
                    fetchedUsers.map(async (user) => {
                        const chatRoom = await checkExistingChatRoom(currentUserId, user.id);
                        if (chatRoom.length > 0) {
                            const messages = await fetchMessages(chatRoom[0].id);
                            const lastMessage =
                                messages.length > 0 ? messages[messages.length - 1] : null;
                            return { ...user, lastMessage };
                        }
                        return { ...user, lastMessage: null };
                    })
                );

                usersWithLastMessage.sort((a, b) => {
                    if (a.lastMessage && b.lastMessage) {
                        return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
                    } else if (a.lastMessage) {
                        return -1;
                    } else if (b.lastMessage) {
                        return 1;
                    }
                    return 0;
                });

                setUsers(usersWithLastMessage);
                setFilteredUsers(usersWithLastMessage);
                setRoleName(mapRoleIdToName(roleId));
            } catch (err) {
                console.error('Erreur lors de la récupération des utilisateurs :', err);
                setError('Impossible de charger les utilisateurs.');
            } finally {
                setLoading(false);
            }
        };

        if (roleId) {
            fetchUsersAndConversations();
        } else {
            setError('Aucun rôle sélectionné.');
            setLoading(false);
        }
    }, [roleId, currentUserRole, schoolId]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        setFilteredUsers(
            users.filter((user) =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(lowercasedSearchTerm)
            )
        );
        setCurrentPage(1);
    }, [searchTerm, users]);

    const handleUserClick = async (userId) => {
        try {
            let chatRoom = await checkExistingChatRoom(currentUserId, userId);
    
            // Si aucune salle existante, créer une nouvelle conversation
            if (chatRoom.length === 0) {
                chatRoom = await createConversation(currentUserId, userId);
            } else {
                chatRoom = chatRoom[0];
            }
    
            // Redirection selon le rôle de l'utilisateur connecté
            switch (currentUserRole) {
                case 1: // Administration
                    navigate(`/chat/${chatRoom.id}`);
                    break;
                case 2: // Étudiants
                    navigate(`/chat-student/${chatRoom.id}`);
                    break;
                case 3: // Enseignants
                    navigate(`/chat-teacher/${chatRoom.id}`);
                    break;
                case 4: // Parents
                    navigate(`/chat-parent/${chatRoom.id}`);
                    break;
                case 5:
                    navigate(`/chat-driver/${chatRoom.id}`);
                default:
                    console.error("Rôle non reconnu");
                    break;
            }
        } catch (err) {
            console.error('Erreur lors de la création ou de la récupération de la conversation :', err);
            setError('Impossible de démarrer la conversation.');
        }
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => prevPage + direction);
    };

    return (
        <div className="users-container">
            <div className="student-list-title">
                <h3>Liste des {roleName}</h3>
            </div>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className='whitetext'>Scolara</div>
            <div className="users-list">
                {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                        <div
                            key={user.id}
                            className="user-item"
                            onClick={() => handleUserClick(user.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    src={user.profile_picture || '/default-profile.png'}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    className="user-profile-picture"
                                />
                                <div className="user-info">
                                    <h3>{`${user.first_name} ${user.last_name}`}</h3>
                                    {user.lastMessage && (
                                        <p className="last-message-preview">
                                            {user.lastMessage.content || 'Fichier envoyé 📎'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {user.lastMessage && (
                                <div className="message-time">
                                    {formatTime(user.lastMessage.created_at)}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh',
                        textAlign: 'center',
                        fontSize: '18px',
                        color: '#666',
                        fontWeight: 'bold',
                    }}>
                        Aucun utilisateur trouvé.
                    </div>
                )}
            </div>

            <div className='whitetext'>Scolara</div>
            <div className="pagination-controls">
                <button
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span>
                    Page {currentPage} sur {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
};

export default UsersPage;
