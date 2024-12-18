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


// import Navbar from '../Navbar/Navbar';
const Sidebar = () => {
    const location = useLocation(); // Utiliser useLocation pour obtenir le chemin actuel
    const [activeLink, setActiveLink] = useState(location.pathname); // État pour le lien actif

    return (
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
                            className={`sidebar-button ${activeLink === '/dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/dashboard')}
                        >
                    <FontAwesomeIcon icon={faChartLine} size="lg" style={{ color: "#4e7dad", marginRight: '13px' }} />
                    Tableau de bord
                        </Link>
                    </li>   
                    <li>
                        <Link
                            to="/teachers"
                            className={`sidebar-button ${activeLink === '/teachers' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/teachers')}
                        >
                            <FontAwesomeIcon icon={faChalkboardUser} size="lg" style={{ color: "#4e7dad" ,marginRight: '13px'}} />
                             Enseignants
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/students"
                            className={`sidebar-button ${activeLink === '/students' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/students')}
                        >
                            <PiStudentBold style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Étudiants
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/parents"
                            className={`sidebar-button ${activeLink === '/parents' ? 'active' : ''}`}
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
                            className={`sidebar-button ${activeLink === '/education-level' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/education-level')}
                        >
                            <MdCastForEducation style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Niveaux d'éducation
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/subjects"
                            className={`sidebar-button ${activeLink === '/subjects' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/subjects')}
                        >
                            <MdOutlineSubject style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Matières
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/classrooms"
                            className={`sidebar-button ${activeLink === '/classrooms' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/classrooms')}
                        >
                            <SiGoogleclassroom style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }} />
                            Salles
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses"
                            className={`sidebar-button ${activeLink === '/courses' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/courses')}
                        >
                        <RiPagesFill style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                        Cours
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/timetable"
                            className={`sidebar-button ${activeLink === '/timetable' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/timetable')}
                        >
                            <GrTableAdd style={{ color: "#4e7dad", marginRight: '13px',fontSize: '26px' }}/>
                            Emploi du temps
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/grades"
                            className={`sidebar-button ${activeLink === '/grades' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/grades')}
                        >
                            <BsFileEarmarkSpreadsheet style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/bulletins"
                            className={`sidebar-button ${activeLink === '/bulletins' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/bulletins')}
                        >
                            <LuNewspaper style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Bulletins
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/chat"
                            className={`sidebar-button ${activeLink === '/chat' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chat')}
                        >
                            <IoChatbubbleEllipsesOutline style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Chat
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/drivers"
                            className={`sidebar-button ${activeLink === '/chauffeur' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/chauffeur')}
                        >
                            <img src={driverIcon} alt="Chauffeur Icon" style={{ width: '24px', marginRight: '13px' }} />
                            Chauffeurs
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/transports"
                            className={`sidebar-button ${activeLink === '/transports' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/transports')}
                        >
                            <BsTruckFront style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Transports
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/expenses"
                            className={`sidebar-button ${activeLink === '/expenses' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/expenses')}
                        >
                            <FaFileInvoiceDollar style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Dépenses
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/earnings"
                            className={`sidebar-button ${activeLink === '/earnings' ? 'active' : ''}`}
                            onClick={() => setActiveLink('/earnings')}
                        >
                            <FaMoneyBillTrendUp style={{ color: "#4e7dad", marginRight: '13px',fontSize: '28px' }}/>
                            Revenus
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className='whitetext'>Scolara</div>
        </div>
    );
};

export default Sidebar;
