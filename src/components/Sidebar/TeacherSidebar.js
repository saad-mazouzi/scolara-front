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
                            className={`sidebar-button ${activeLink === '/timetable' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/timetable')}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px', fontSize: '26px' }} />
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses-teacher"
                            className={`sidebar-button ${activeLink === '/courses' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/courses')}
                        >
                            <RiPagesFill style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Cours
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/grades-teacher"
                            className={`sidebar-button ${activeLink === '/grades' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/grades')}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat-teacher"
                            className={`sidebar-button ${activeLink === '/chat' ? 'active' : ''}`}
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
