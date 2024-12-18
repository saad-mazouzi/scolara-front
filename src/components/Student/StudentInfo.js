import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';

const StudentInfo = () => {
    const [student, setStudent] = useState(null);
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const secretKey = queryParams.get('secret_key');

        if (secretKey) {
            // Effectuer une requête GET pour obtenir les informations de l'étudiant
            axiosInstance.get(`/student-info/?secret_key=${encodeURIComponent(secretKey)}`)
                .then(response => {
                    if (response.data.success) {
                        setStudent(response.data.student);
                    } else {
                        setMessage('Clé secrète invalide. Veuillez réessayer.');
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des informations de l\'étudiant :', error);
                    setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
                });
        } else {
            setMessage('Aucune clé secrète fournie.');
        }
    }, [location.search]);

    if (message) {
        return <p>{message}</p>;
    }

    if (!student) {
        return <p>Chargement des informations de l'étudiant...</p>;
    }

    return (
        <div className="student-info-container">
            <h2>Informations de l'étudiant</h2>
            <p>Nom : {student.first_name} {student.last_name}</p>
            <p>Email : {student.email}</p>
            {/* Affichez d'autres informations pertinentes */}
        </div>
    );
};

export default StudentInfo;
