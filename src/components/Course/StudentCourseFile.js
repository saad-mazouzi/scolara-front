import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudentCourseFiles } from '../../APIServices';
import './Course.css';
import image1 from '../../images/test4.jpg'; // Exemple d'image
import { FaTimes } from 'react-icons/fa'; // Icône pour fermer la modal

// Liste d'images pour générer des images aléatoires
const images = [image1];

const StudentCourseFiles = () => {
    const { courseId } = useParams(); // Récupère l'ID du cours depuis l'URL
    const [courseFiles, setCourseFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null); // Fichier sélectionné pour l'aperçu
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (courseId) {
                    const files = await fetchStudentCourseFiles(courseId);
                    setCourseFiles(files);
                } else {
                    setError("ID du cours non fourni dans l'URL.");
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des fichiers de cours :", err);
                setError("Impossible de charger les fichiers.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    // Fonction pour obtenir une image aléatoire
    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    };

    // Fonction pour ouvrir la modal avec les détails du fichier
    const openModal = (file) => {
        setSelectedFile(file);
    };

    // Fonction pour fermer la modal
    const closeModal = () => {
        setSelectedFile(null);
    };

    // Fonction pour afficher un aperçu en fonction du type de fichier
    const renderFilePreview = (file) => {
        const fileType = file.file.split('.').pop().toLowerCase(); // Obtenir l'extension du fichier
    
        if (fileType === 'pdf') {
            return (
                <a href={file.file} target="_blank" rel="noopener noreferrer" className="download-link">
                    Voir l'aperçu du fichier PDF dans un nouvel onglet
                </a>
            );
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            return <img src={file.file} alt="Aperçu de l'image" className="preview-image" />;
        } else {
            return (
                <p>
                    Aperçu non disponible pour ce type de fichier. <br />
                    <a href={file.file} target="_blank" rel="noopener noreferrer" className="download-link">
                        Télécharger le fichier
                    </a>
                </p>
            );
        }
    };

    if (loading) return <p>Chargement des fichiers...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="course-files-container">
            {courseFiles.length > 0 ? (
                <div className="files-grid">
                    {courseFiles.map((file) => (
                        <div 
                            className="file-card" 
                            key={file.id} 
                            onClick={() => openModal(file)} // Ouvrir la modal au clic
                        >
                            <img src={getRandomImage()} alt="Course illustration" className="card-image" />
                            <div className="file-type">{file.file_type || "Non spécifié"}</div>
                            <div className="file-name">{file.file.split('/').pop()}</div>
                            <p><strong>Date d'upload :</strong> {new Date(file.uploaded_at).toLocaleDateString()}</p>
                            <a href={file.file} download className="download-button">Télécharger</a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Aucun fichier disponible pour ce cours.</p>
            )}

            {/* Modal d'aperçu du fichier */}
            {selectedFile && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <FaTimes 
                            className="close-icon" 
                            onClick={closeModal} 
                            title="Fermer" 
                        />
                        <h4>Aperçu du fichier</h4>
                        {renderFilePreview(selectedFile)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourseFiles;
