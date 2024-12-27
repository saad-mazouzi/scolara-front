import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { fetchRoles } from '../../APIServices';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import { PuffLoader } from 'react-spinners';

const RolesCards = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const currentUserRole = Cookies.get('UserRole'); // Récupérer le rôle de l'utilisateur connecté depuis les cookies

    // Mapper les noms des rôles
    const mapRoleName = (roleName) => {
        const roleMapping = {
            Administrateur: "Administration",
            Enseignant: "Enseignants",
            Étudiant: "Étudiants",
            Parent: "Parents",
            Chauffeur: "Chauffeurs",
        };
        return roleMapping[roleName] || roleName;
    };

    // Récupérer les rôles depuis l'API
    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const fetchedRoles = await fetchRoles();

                let filteredRoles = fetchedRoles;

                if (currentUserRole === '4') {
                    // Si l'utilisateur est Parent, afficher uniquement Administration et Enseignants
                    const allowedRoles = ["Administrateur", "Enseignant","Chauffeur"];
                    filteredRoles = fetchedRoles.filter((role) =>
                        allowedRoles.includes(role.name)
                    );
                } else if (currentUserRole === '2') {
                    // Si l'utilisateur est Étudiant, afficher certains rôles
                    const allowedRoles = ["Administrateur", "Enseignant", "Étudiant","Chauffeur"];
                    filteredRoles = fetchedRoles.filter((role) =>
                        allowedRoles.includes(role.name)
                    );
                } else if (currentUserRole === '1') {
                    // Exclure le rôle Administrateur si l'utilisateur est Admin
                    filteredRoles = fetchedRoles.filter(
                        (role) => role.name !== 'Administrateur'
                    );
                } else if (currentUserRole === '3') {
                    // Exclure le rôle Chauffeur si l'utilisateur est Enseignant
                    filteredRoles = fetchedRoles.filter(
                        (role) => role.name !== 'Chauffeur'
                    );
                }

                setRoles(filteredRoles);
            } catch (err) {
                console.error("Erreur lors de la récupération des rôles :", err);
                setError("Impossible de charger les rôles.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllRoles();
    }, [currentUserRole]);

    // Gestionnaire de clic sur une carte de rôle
    const handleRoleClick = (roleId) => {
        if (currentUserRole === '2'){
            navigate(`/users-student?role_id=${roleId}`);
        } else if (currentUserRole === '1' && roleId === 2) {
            // Redirige vers /users si le rôle connecté est Admin et le rôle cliqué est Étudiant
            navigate(`/users?role_id=${roleId}`);
        } else if (currentUserRole === '3') {
            // Redirige vers /users-teacher si le rôle connecté est Teacher
            navigate(`/users-teacher?role_id=${roleId}`);
        }else if (currentUserRole === '4') {
            // Redirige vers /users-teacher si le rôle connecté est Teacher
            navigate(`/users-parent?role_id=${roleId}`);
        } else if (currentUserRole === '5') {
            // Redirige vers /users-teacher si le rôle connecté est Teacher
            navigate(`/users-driver?role_id=${roleId}`);
        } else {
            // Redirige vers /users pour tous les autres cas
            navigate(`/users?role_id=${roleId}`);
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

    return (
        <div className="roles-container">
            {roles.map((role) => (
                <div
                    key={role.id}
                    className="role-card"
                    onClick={() => handleRoleClick(role.id)}
                    style={{ cursor: 'pointer' }}
                >
                    <h3>{mapRoleName(role.name)}</h3>
                </div>
            ))}
        </div>
    );
};

export default RolesCards;
