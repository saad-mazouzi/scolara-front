import React from 'react';
import './Sidebar.css'; // Réutilise le même style que le Sidebar admin
import logo from '../../images/logo.png';
import { RiPagesFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { GrTableAdd } from "react-icons/gr";
import { Link, useLocation } from 'react-router-dom';

const StudentSidebar = () => {
    const location = useLocation(); // Utilise useLocation pour obtenir le chemin actuel

    // Fonction utilitaire pour vérifier les chemins
    const isCoursesActive = () => {
        const paths = [
            '/courses-student', // Chemin principal
            '/student-courses', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isGradesActive = () => {
        const paths = [
            '/grades-student', // Chemin principal
            '/student-grades', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isChatActive = () => {
        const paths = [
            '/chat-student', // Chemin principal
            '/users-student', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    return (
        <div className="sidebar">
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link
                            to="/student-timetable"
                            className={`sidebar-button ${location.pathname === '/student-timetable' ? 'active' : ''}`}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px', fontSize: '26px' }} />
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses-student"
                            className={`sidebar-button ${isCoursesActive() ? 'active' : ''}`}
                        >
                            <RiPagesFill style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Cours
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/grades-student"
                            className={`sidebar-button ${isGradesActive() ? 'active' : ''}`}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat-student"
                            className={`sidebar-button ${isChatActive() ? 'active' : ''}`}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Chat
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="whitetext">Scolara</div>
        </div>
    );
};

export default StudentSidebar;
