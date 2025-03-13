import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { createHomeworkBook, fetchHomeworkBooks, deleteHomeworkBook } from '../../APIServices';
import './HomeworkBook.css'; // Assure-toi de créer ce fichier pour le styling
import { PuffLoader, MoonLoader } from 'react-spinners';

const AddHomeworkBook = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [homeworkDueDate, setHomeworkDueDate] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [homeworkBooks, setHomeworkBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    // Charger les valeurs depuis les cookies
    useEffect(() => {
        const levelFromCookie = Cookies.get('TeacherEducationLevel');
        const teacherIdFromCookie = Cookies.get('TeacherId');
        const subjectFromCookie = Cookies.get('selectedSubject');
        
        if (levelFromCookie) {
            setEducationLevel(levelFromCookie);
        }
        if (teacherIdFromCookie) {
            setTeacherId(teacherIdFromCookie);
        }
        if (subjectFromCookie) {
            setSubjectId(subjectFromCookie);
        }
    }, []);

    // Charger les cahiers de textes filtrés par education_level et subjectId
    useEffect(() => {
        const getHomeworkBooks = async () => {
            setLoading(true);
            if (educationLevel && subjectId) {
                try {
                    const data = await fetchHomeworkBooks(educationLevel, subjectId);
                    setHomeworkBooks(data);
                } catch (error) {
                    console.error('Erreur lors de la récupération des cahiers de textes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        getHomeworkBooks();
    }, [educationLevel, subjectId, successMessage]);

    // Fonction pour gérer l'ajout du HomeworkBook
    const handleSubmit = async (e) => {
        setLoadingForm(true);
        e.preventDefault();
        const homeworkBookData = {
            title,
            content,
            homework_due_date: homeworkDueDate,
            education_level: educationLevel,
            subject: subjectId,
            teacher: teacherId
        };

        try {
            await createHomeworkBook(homeworkBookData);
            setSuccessMessage('Le cahier de texte a été ajouté avec succès !');
            setTitle('');
            setContent('');
            setHomeworkDueDate('');
        } catch (error) {
            console.error('Échec de l\'ajout du cahier de texte:', error);
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

    // Fonction pour gérer la suppression
    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce cahier de texte ?')) {
            try {
                await deleteHomeworkBook(id);
                setHomeworkBooks(homeworkBooks.filter((book) => book.id !== id));
            } catch (error) {
                console.error('Échec de la suppression du cahier de texte:', error);
            }
        }
    };

    return (
        <div>
            <h3 className="student-list-title">Cahier de Texte</h3>
            <div className="form-container">
                <h2>Ajouter un Cahier de Texte</h2>
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Titre :</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contenu :</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date limite des devoirs :</label>
                        <input
                            type="date"
                            value={homeworkDueDate}
                            onChange={(e) => setHomeworkDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Ajouter le Cahier de Texte
                    </button>
                </form>
            </div>

            <h3 className="homework-list-title">Liste des Cahiers de Texte</h3>
            <div className="homework-list">
                {homeworkBooks.length > 0 ? (
                    <ul>
                        {homeworkBooks
                            .filter(book => 
                                book.education_level.toString() === educationLevel &&
                                book.subject.toString() === subjectId
                            )
                            .map((book) => (
                                <li key={book.id} className="homework-item">
                                    <h4>{book.title}</h4>
                                    <p>{book.content}</p>
                                    <p><strong>Date limite :</strong> {book.homework_due_date}</p>
                                    <span 
                                        className="homework-delete-icon" 
                                        onClick={() => handleDelete(book.id)}
                                    >
                                        &#128465;
                                    </span>
                                </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun cahier de texte trouvé pour ce niveau d'éducation et cette matière.</p>
                )}
            </div>
            {loadingForm && (
                <div className="overlay-loader">
                    <div className="CRUD-loading-container">
                        <MoonLoader size={50} color="#ffcc00" loading={loadingForm} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddHomeworkBook;
