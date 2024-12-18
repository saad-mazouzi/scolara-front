import React from 'react';
import NavbarSignup from '../../Navbarsignup/NavbarSignup';
import Footer from '../../Footer/Footer';
import './AdminSignup.css';
import AdminSignup from './AdminSignup';

const AdminSignupPage = () => {
    return (
        <div>
            <NavbarSignup />
            {/* <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div> */}

            {/* <div></div> */}
            <AdminSignup/>
            <div className='whitetext'> saad </div>
            <Footer /> {/* Ajoutez le footer ici */}
        </div>
    );
};

export default AdminSignupPage;
