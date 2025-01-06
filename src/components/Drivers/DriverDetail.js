import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import {
  fetchDriverById,
  updateDriverProfilePicture,
  markDriverAsPaid,
  updateDriverSalary,
  updateDriver,
} from '../../APIServices';
import './Driver.css';
import { PuffLoader,MoonLoader } from 'react-spinners';

const DriverProfile = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState(null);
  const [loadingform, setLoadingForm] = useState(false);

  useEffect(() => {
    const getDriverData = async () => {
      try {
        const driverData = await fetchDriverById(id);
        setDriver(driverData);
        setProfilePicture(driverData.profile_picture);
        setMonthlySalary(driverData.monthly_salary || 0);
      } catch (err) {
        console.error('Erreur lors de la récupération des données du chauffeur:', err);
        setError('Impossible de récupérer les données.');
      } finally {
        setLoading(false);
      }
    };

    getDriverData();
  }, [id]);

  const handleProfilePictureSubmit = async () => {
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);
    setLoadingForm(true);

    try {
      await updateDriverProfilePicture(id, formData);
      const refreshedDriver = await fetchDriverById(id);
      setDriver(refreshedDriver);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la photo de profil :', err);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleUpdateDriver = async () => {
    setLoadingForm(true);
    try {
      const updatedDriver = {
        ...driver,
        next_payment_date: driver.next_payment_date, // Ajouter la date du prochain paiement
      };
  
      await updateDriver(id, updatedDriver);
      const refreshedDriver = await fetchDriverById(id);
      setDriver(refreshedDriver);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du chauffeur :", err);
    } finally {
      setLoadingForm(false);
    }
  };


    const handlePaymentStatusUpdate = async (isPaid) => {
        console.log("Button clicked, updating payment status to:", isPaid);
        setLoadingForm(true);
        try {
            await markDriverAsPaid(driver.id, { paid: isPaid });
            const refreshedDriver = await fetchDriverById(id);
            setDriver(refreshedDriver); // Update the local state
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut de paiement :', err);
        } finally {
            setLoadingForm(false);
        }
    };

  
  const handleSalarySubmit = async () => {
    setLoadingForm(true);
    try {
        const updatedDriver = {
            ...driver,
            monthly_salary: monthlySalary // Mise à jour de 'salary' en 'monthly_salary'
        };

        await updateDriverSalary(id, updatedDriver);

        const refreshedDriver = await fetchDriverById(id);
        setDriver(refreshedDriver);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du salaire:', err);
    } finally {
        setLoadingForm(false);
    }
  };



  if (loading) {
    return (
        <div className="loading-container">
            <PuffLoader size={60} color="#ffcc00" loading={loading} />
        </div>
    );
}
  if (error) return <p>{error}</p>;

  return (
    <div className="driver-profile-container">
      {driver && (
        <div className="driver-profile">
          <div className="driver-profile-picture">
            {driver.profile_picture ? (
              <img
                src={`${driver.profile_picture}`}
                alt={`${driver.first_name} ${driver.last_name}`}
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            ) : (
              <span>Aucune photo de profil</span>
            )}
            <FaEdit
              className="edit-icon"
              onClick={() => document.getElementById('fileInput').click()}
              style={{ cursor: 'pointer', position: 'absolute', bottom: '10px', right: '10px', fontSize: '20px' }}
            />
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
          <button className="modify-profile-picture" onClick={handleProfilePictureSubmit}>
            Mettre à jour la photo de profil
          </button>
          <div className="driver-details">
            <p className="driver-name">{driver.last_name} {driver.first_name}</p>
            <p>
              <strong>Email :</strong> {driver.email || 'Non spécifié'}
            </p>
            <p>
              <strong>Numéro de téléphone :</strong> {driver.phone_number || 'Non spécifié'}
            </p>
            <p>
              <strong>Adresse :</strong> {driver.address || 'Non spécifiée'}
            </p>
            <p>
              <strong>Salaire mensuel :</strong>
              <input
                type="number"
                value={monthlySalary} // Changement de 'salary' en 'monthlySalary'
                onChange={(e) => setMonthlySalary(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
                <button className="update-button update-salary-button" onClick={handleSalarySubmit} style={{ marginLeft: '10px' }}>Mettre à jour</button>
            </p>
            <p>
                <strong>Statut de paiement :</strong>
                <button
                    style={{
                    backgroundColor: driver.paid ? 'green' : 'lightgray',
                    color: 'white',
                    padding: '5px 10px',
                    margin: '0 10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    }}
                    onClick={() => handlePaymentStatusUpdate(true)} // Mark as paid
                >
                    Payé
                </button>
                <button
                    style={{
                    backgroundColor: !driver.paid ? 'red' : 'lightgray',
                    color: 'white',
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    }}
                    onClick={() => handlePaymentStatusUpdate(false)} // Mark as unpaid
                >
                    Non Payé
                </button>
                </p>
            <p>
              <strong>Date du prochain paiement :</strong>
              <input
                type="date"
                value={driver.next_payment_date || ""}
                onChange={(e) => setDriver({ ...driver, next_payment_date: e.target.value })}
                style={{ marginLeft: "10px" }}
              />
              <button
                className="update-button"
                onClick={() => handleUpdateDriver()}
                style={{ marginLeft: "10px" }}
              >
                Mettre à jour
              </button>
            </p>
          </div>
        </div>
      )}
      {loadingform && (
          <div className="overlay-loader">
              <div className="CRUD-loading-container">
                  <MoonLoader size={50} color="#ffcc00" loading={loadingform} />
              </div>
          </div>
      )}
    </div>
  );
};

export default DriverProfile;
