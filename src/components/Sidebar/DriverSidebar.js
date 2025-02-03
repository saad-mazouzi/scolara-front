import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import logo from '../../images/logo.png';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsTruckFront } from "react-icons/bs";
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FaRegNoteSticky } from "react-icons/fa6";


const DriverSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [transportId, setTransportId] = useState(Cookies.get('SelectedTransportId')); // Récupérer l'ID des cookies

    const isChatActive = () => {
        const paths = ['/chat-driver', '/users-driver'];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isTransportActive = () => {
        const paths = ['/transport-driver'];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isNoticeActive = () => {
        const paths = [
            '/notices-driver', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    useEffect(() => {
        const selectedTransportId = Cookies.get('SelectedTransportId');
        if (selectedTransportId) {
            setTransportId(selectedTransportId);
        }
    }, []);

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
                            to={`/transport-driver/${transportId}`} // Redirection basée sur les cookies
                            className={`sidebar-button ${isTransportActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink(`/transport-driver/${transportId}`)}
                        >
                            <BsTruckFront style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Transport
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat-driver"
                            className={`sidebar-button ${isChatActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat-driver')}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px', fontSize: '28px' }} />
                            Chat
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/notices-driver"
                            className={`sidebar-button ${isNoticeActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/notices-driver')}
                        >
                            <FaRegNoteSticky style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Avis
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="whitetext">Scolara</div>
        </div>
        </div>
    );
};

export default DriverSidebar;
