import React, { useState } from 'react';
import './Sidebar.css'; // Réutilise le même style que le Sidebar admin
import logo from '../../images/logo.png';
import { RiPagesFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { GrTableAdd } from "react-icons/gr";
import { Link, useLocation } from 'react-router-dom';

const TeacherSidebar = () => {
    const location = useLocation(); // Utiliser useLocation pour obtenir le chemin actuel
    const [activeLink, setActiveLink] = useState(location.pathname); // État pour le lien actif


    const isTimetableActive = () => {
        const paths = [
            '/timetable-teacher', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isCoursesActive = () => {
        const paths = [
            '/courses-teacher', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isGradesActive = () => {
        const paths = [
            '/grades-teacher', // Chemin principal
            '/student-grades', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isChatActive = () => {
        const paths = [
            '/chat-teacher', // Chemin principal
            '/users-teacher', // Préfixe des sous-chemins
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
                            to="/timetable-teacher"
                            className={`sidebar-button ${isTimetableActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/timetable')}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px', fontSize: '26px' }} />
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses-teacher"
                            className={`sidebar-button ${isCoursesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/courses')}
                        >
                            <RiPagesFill style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Cours
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/grades-teacher"
                            className={`sidebar-button ${isGradesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/grades')}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat-teacher"
                            className={`sidebar-button ${isChatActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat')}
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

export default TeacherSidebar;
