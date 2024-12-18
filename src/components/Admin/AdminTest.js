import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axiosInstance from '../../axiosConfig';
import './AdminProfile.css';

const AdminProfile = () => {
    const [cookies] = useCookies(['SchoolId', 'TeacherId']);
    const [schoolLogo, setSchoolLogo] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [schoolPhone, setSchoolPhone] = useState('');
    const [newSchoolAddress, setNewSchoolAddress] = useState('');
    const [newSchoolPhone, setNewSchoolPhone] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const schoolId = cookies.SchoolId;

    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                if (!schoolId) {
                    setAlertMessage('School ID not found.');
                    setAlertType('error');
                    return;
                }

                const response = await axiosInstance.get(`school/${schoolId}/`);
                const { logo, name, address, phone_number } = response.data;

                setSchoolLogo(logo ? `http://127.0.0.1:8000${logo}` : '');
                setSchoolName(name || ''); // Store the school name
                setSchoolAddress(address || '');
                setSchoolPhone(phone_number || '');
            } catch (error) {
                console.error('Error fetching school data:', error);
                setAlertMessage('Failed to load school details.');
                setAlertType('error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchoolData();
    }, [schoolId]);

    const handleAddressSubmit = async () => {
        if (!newSchoolAddress) {
            setAlertMessage('Please enter a valid address.');
            setAlertType('error');
            return;
        }

        try {
            await axiosInstance.put(`school/${schoolId}/`, {
                name: schoolName, // Include the required "name" field
                address: newSchoolAddress,
                phone_number: schoolPhone, // Include the existing phone number
            });
            setSchoolAddress(newSchoolAddress);
            setNewSchoolAddress('');
            setAlertMessage('School address updated successfully.');
            setAlertType('success');
        } catch (error) {
            console.error('Error updating school address:', error);
            setAlertMessage('Failed to update school address.');
            setAlertType('error');
        }
    };

    const handlePhoneSubmit = async () => {
        if (!newSchoolPhone) {
            setAlertMessage('Please enter a valid phone number.');
            setAlertType('error');
            return;
        }

        try {
            await axiosInstance.put(`school/${schoolId}/`, {
                name: schoolName, // Include the required "name" field
                address: schoolAddress, // Include the existing address
                phone_number: newSchoolPhone, // Correct the key to `phone_number`
            });
            setSchoolPhone(newSchoolPhone);
            setNewSchoolPhone('');
            setAlertMessage('School phone number updated successfully.');
            setAlertType('success');
        } catch (error) {
            console.error('Error updating school phone number:', error);
            setAlertMessage('Failed to update school phone number.');
            setAlertType('error');
        }
    };

    if (isLoading) {
        return <div className="admin-profile-loader">Loading...</div>;
    }

    return (
        <div className="admin-profile-container">
            {alertMessage && (
                <div className={`alert ${alertType}`}>
                    {alertMessage}
                    <span className="alert-close" onClick={() => setAlertMessage('')}>&times;</span>
                </div>
            )}
            <div className="admin-profile-content">
                <h2>School Details</h2>
                <div className="school-logo-container">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="School Logo" className="school-logo" />
                    ) : (
                        <div className="school-placeholder">No Logo</div>
                    )}
                </div>

                <div className="school-details">
                    <div>
                        <strong>Name:</strong> {schoolName || 'Not specified'}
                    </div>
                    <div>
                        <strong>Address:</strong> {schoolAddress || 'Not specified'}
                    </div>
                    <input
                        type="text"
                        placeholder="New Address"
                        value={newSchoolAddress}
                        onChange={(e) => setNewSchoolAddress(e.target.value)}
                        className="admin-input-modify"
                    />
                    <button className="modify-button" onClick={handleAddressSubmit}>
                        Update Address
                    </button>
                </div>

                <div className="school-details">
                    <div>
                        <strong>Phone:</strong> {schoolPhone || 'Not specified'}
                    </div>
                    <input
                        type="text"
                        placeholder="New Phone Number"
                        value={newSchoolPhone}
                        onChange={(e) => setNewSchoolPhone(e.target.value)}
                        className="admin-input-modify"
                    />
                    <button className="modify-button" onClick={handlePhoneSubmit}>
                        Update Phone
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
