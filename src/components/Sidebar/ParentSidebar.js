import React, { useState } from 'react';
import './Sidebar.css'; // Réutilise le même style que le Sidebar admin
import logo from '../../images/logo.png';
import { RiPagesFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { GrTableAdd } from "react-icons/gr";
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const ParentSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation(); // Utiliser useLocation pour obtenir le chemin actuel
    const [activeLink, setActiveLink] = useState(location.pathname); // État pour le lien actif

    // Récupérer la clé parent_key des cookies
    const parentKey = Cookies.get('parent_key');

    const isTimetableActive = () => {
        const paths = [
            '/parent-timetable', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isGradesActive = () => {
        const paths = [
            '/parent-grades',
            '/grades-parent' ,
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isChatActive = () => {
        const paths = [
            '/chat-parent',
            '/users-parent' ,
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };
    
    return (
        <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
            <div className="toggle-button" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isOpen ? faArrowLeft : faArrowRight} />
            </div>
        <div className="sidebar">
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link
                            to={`/parent-timetable/${encodeURIComponent(parentKey)}`}
                            className={`sidebar-button ${isTimetableActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink(`/parent-timetable`)}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px', fontSize: '26px' }} />
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={`/grades-parent/${encodeURIComponent(parentKey)}`}
                            className={`sidebar-button ${isGradesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/grades-parent')}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat-parent"
                            className={`sidebar-button ${isChatActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat-parent')}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Chat
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="whitetext">Scolara</div>
        </div>
        </div>
    );
};

export default ParentSidebar;
