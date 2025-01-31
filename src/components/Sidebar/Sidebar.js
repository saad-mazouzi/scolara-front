import React, { useState } from 'react';
import './Sidebar.css'; // Importation du fichier CSS
import logo from '../../images/logo.png';
import { RiPagesFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdCastForEducation } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";
import { SiGoogleclassroom   } from "react-icons/si";
import { Link, useLocation } from 'react-router-dom'; // Importer Link et useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser,faChartLine,faCalendarDays } from '@fortawesome/free-solid-svg-icons'; // Changez ici pour solid
import { RiParentFill } from "react-icons/ri";
import { MdOutlineSubject } from "react-icons/md";
import { BsTruckFront } from "react-icons/bs";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { GrTableAdd } from "react-icons/gr";
import driverIcon from '../../images/icons/driver_icon.png'
import { FaFileInvoiceDollar } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { LuNewspaper } from "react-icons/lu";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FaRegNoteSticky } from "react-icons/fa6";




// import Navbar from '../Navbar/Navbar';
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation(); // Utiliser useLocation pour obtenir le chemin actuel
    const [activeLink, setActiveLink] = useState(location.pathname); // État pour le lien actif
   
    const isDashboardActive = () => {
        const paths = [
            '/dashboard', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isTeacherActive = () => {
        const paths = [
            '/teachers',
            '/teacher' // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isStudentActive = () => {
        const paths = [
            '/students',
            '/student' // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isParenttActive = () => {
        const paths = [
            '/parents',
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isTimetableActive = () => {
        const paths = [
            '/timetable', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isEducationLevelActive = () => {
        const paths = [
            '/education-level', 
            '/education-level-students' // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isNoticeActive = () => {
        const paths = [
            '/notices', 
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isSubjectActive = () => {
        const paths = [
            '/subjects', 
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isClassroomActive = () => {
        const paths = [
            '/classrooms'
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isCoursesActive = () => {
        const paths = [
            '/courses', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isGradesActive = () => {
        const paths = [
            '/grades', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isBulletinsActive = () => {
        const paths = [
            '/bulletins', // Chemin principal
            '/bulletin', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isChatActive = () => {
        const paths = [
            '/chat', // Chemin principal
            '/users', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isDriverActive = () => {
        const paths = [
            '/drivers', // Chemin principal
            '/driver', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isTransportActive = () => {
        const paths = [
            '/transports', // Chemin principal
            '/transport', // Préfixe des sous-chemins
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isExpensesActive = () => {
        const paths = [
            '/expenses', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    const isearningsActive = () => {
        const paths = [
            '/earnings', // Chemin principal
        ];
        return paths.some(path => location.pathname.startsWith(path));
    };

    return (
        <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
            <div className="toggle-button" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isOpen ? faArrowLeft : faArrowRight} />
            </div>
        <div className="sidebar">
            {/* <Navbar/> */}
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link
                            to="/dashboard"
                            className={`sidebar-button ${isDashboardActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/dashboard')}
                        >
                    <FontAwesomeIcon icon={faChartLine} size="lg" style={{ color: "#4e7dad", marginRight: '13px' }} />
                    Tableau de bord
                        </Link>
                    </li>   
                    <li>
                        <Link
                            to="/teachers"
                            className={`sidebar-button ${isTeacherActive()? 'active' : ''}`}
                            onClick={() => setActiveLink('/teachers')}
                        >
                            <FontAwesomeIcon icon={faChalkboardUser} size="lg" style={{ color: "#4e7dad" ,marginRight: '13px'}} />
                             Enseignants
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/students"
                            className={`sidebar-button ${isStudentActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/students')}
                        >
                            <PiStudentBold style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Étudiants
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/parents"
                            className={`sidebar-button ${isParenttActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/parents')}
                        >   
                        <RiParentFill style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            {/* <img src={parentsIcon} alt="Parents" style={{ width: '40px', marginRight: '10px' }} /> */}
                            Parents
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/education-level"
                            className={`sidebar-button ${isEducationLevelActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/education-level')}
                        >
                            <MdCastForEducation style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Niveaux d'éducation
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/subjects"
                            className={`sidebar-button ${isSubjectActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/subjects')}
                        >
                            <MdOutlineSubject style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Matières
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/classrooms"
                            className={`sidebar-button ${isClassroomActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/classrooms')}
                        >
                            <SiGoogleclassroom style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }} />
                            Salles
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses"
                            className={`sidebar-button ${isCoursesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/courses')}
                        >
                        <RiPagesFill style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                        Cours
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/timetable"
                            className={`sidebar-button ${isTimetableActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/timetable')}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px',fontSize: '26px' }}/>
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/grades"
                            className={`sidebar-button ${isGradesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/grades')}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/bulletins"
                            className={`sidebar-button ${isBulletinsActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/bulletins')}
                        >
                            <LuNewspaper style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Bulletins
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat"
                            className={`sidebar-button ${isChatActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat')}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Chat
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/drivers"
                            className={`sidebar-button ${isDriverActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chauffeur')}
                        >
                            <img src={driverIcon} alt="Chauffeur Icon" style={{ width: '24px', marginRight: '13px' }} />
                            Chauffeurs
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/transports"
                            className={`sidebar-button ${isTransportActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/transports')}
                        >
                            <BsTruckFront style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Transports
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/expenses"
                            className={`sidebar-button ${isExpensesActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/expenses')}
                        >
                            <FaFileInvoiceDollar style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Dépenses
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/earnings"
                            className={`sidebar-button ${isearningsActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/earnings')}
                        >
                            <FaMoneyBillTrendUp style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Revenus
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/notices"
                            className={`sidebar-button ${isNoticeActive() ? 'active' : ''}`}
                            onClick={() => setActiveLink('/notices')}
                        >
                            <FaRegNoteSticky style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Avis
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className='whitetext'>Scolara</div>
        </div>
        </div>
    );
};

export default Sidebar;
