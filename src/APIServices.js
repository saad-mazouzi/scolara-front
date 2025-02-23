import axiosInstance from "./axiosConfig";
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://scolara-backend.onrender.com/api';  


export const getUserRole = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/get_role/`);
        return response.data.role; 
    } catch (error) {
        console.error('Erreur lors de la récupération du rôle de l\'utilisateur :', error);
        throw error; 
    }
};


export const updateStudent = async (studentId, studentData) => {
    try {
        const formData = new FormData();

        // Ajouter les champs de l'étudiant au FormData
        Object.keys(studentData).forEach(key => {
            if (studentData[key] !== undefined) {
                formData.append(key, studentData[key]);
            }
        });

        const response = await axiosInstance.put(
            `${API_URL}/users/${studentId}/updatestudent/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'étudiant :', error);
        throw error;
    }
};


export const deleteStudent = async (studentId) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/users/${studentId}/delete_student/`);
        return response.data; // Vous pouvez renvoyer la réponse ou un message spécifique
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'étudiant :', error);
        throw error; 
    }
};


export const deleteParent = async (parentId) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/users/${parentId}/delete_parent/`);
        return response.data; // Vous pouvez renvoyer la réponse ou un message spécifique
    } catch (error) {
        console.error('Erreur lors de la suppression du parent :', error);
        throw error; 
    }
};

export const fetchSchools = async () => {
    try {
        const response = await axios.get(`${API_URL}/school/`);
        return response.data; // Retourner la liste des écoles
    } catch (error) {
        console.error('Échec de la récupération des écoles :', error);
        throw error; // Propager l'erreur
    }
};

export const fetchStudents = async () => {
    try {
        const schoolId = Cookies.get('SchoolId');
      
        if (!schoolId) {
          throw new Error("Le cookie 'SchoolId' est introuvable.");
        }
        
        const response = await axios.get(`${API_URL}/users/get_students/?school_id=${schoolId}`);
        return response.data;  // Retourne la liste des étudiants
    } catch (error) {
        console.error('Erreur lors de la récupération des étudiants :', error);
        throw error; 
    }
};

export const fetchParents = async () => {
    const schoolId = Cookies.get('SchoolId');
      
    if (!schoolId) {
    throw new Error("Le cookie 'SchoolId' est introuvable.");
    }

    try {
        const response = await axiosInstance.get(`${API_URL}/users/get_parents/?school_id=${schoolId}`);
        return response.data;  // Retourne la liste des étudiants
    } catch (error) {
        console.error('Erreur lors de la récupération des étudiants :', error);
        throw error; 
    }
};



export const fetchTeachers = async () => {
    try {
      // Récupérer le SchoolId depuis les cookies
      const schoolId = Cookies.get('SchoolId');
      
      if (!schoolId) {
        throw new Error("Le cookie 'SchoolId' est introuvable.");
      }
  
      // Effectuer la requête avec le cookie SchoolId en tant qu'en-tête
      const response = await axiosInstance.get(`${API_URL}/users/get_teacher/?school_id=${schoolId}`);
  
      return response.data;  // Retourne la liste des enseignants
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants :', error);
      throw error;
    }
  };

export const fetchRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles/`); // Modifiez le chemin selon votre configuration
        return response.data; // Supposant que response.data est une liste de rôles
    } catch (error) {
        console.error('Erreur lors de la récupération des rôles:', error);
        throw error;
    }
};



export const fetchNoticesForUser = async (schoolId) => {
    try {
      const cookies = document.cookie.split(';');
      const roleCookie = cookies.find(cookie => cookie.trim().startsWith('UserRole='));
      const userRole = roleCookie ? parseInt(roleCookie.split('=')[1], 10) : null;
  
      if (!userRole) {
        console.warn("Aucun rôle trouvé dans les cookies.");
        return [];
      }
  
      const url = schoolId ? `notices/?school_id=${schoolId}` : `notices/`;
      const response = await axiosInstance.get(url);
  
      return response.data.filter(notice => notice.roles.includes(userRole));
    } catch (error) {
      console.error("Erreur lors de la récupération des avis :", error);
      return [];
    }
  };
  
export const deleteNotice = async (noticeId) => {
    try {
        const response = await axiosInstance.delete(`notices/${noticeId}/delete/`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis :", error);
        throw error;
    }
};

// CRUD functions for Teacher Availability
export const fetchTeacherAvailabilities = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/teacher-availability/`);
        return response.data; // Returns the list of availabilities
    } catch (error) {
        console.error('Erreur lors de la récupération des disponibilités des enseignants :', error);
        throw error;
    }
};

export const fetchTeachersBySubject = async (subjectId) => {
    try {
        const response = await axios.get(`https://scolara-backend.onrender.com/api/teacher-by-subject/${subjectId}/`);
        return response.data.teachers;
    } catch (error) {
        console.error("Erreur lors de la récupération des enseignants par matière:", error);
        throw error;
    }
};


export const createTeacherAvailability = async (availabilityData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/teacher-availability/`, availabilityData);
        return response.data; // Returns the created availability
    } catch (error) {
        console.error('Erreur lors de la création de la disponibilité de l\'enseignant :', error);
        throw error;
    }
};

export const updateTeacherAvailability = async (availabilityId, updatedData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/teacher-availability/${availabilityId}/`, updatedData);
        return response.data; // Returns the updated availability
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la disponibilité de l\'enseignant :', error);
        throw error;
    }
};

export const deleteTeacherAvailability = async (availabilityId) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/teacher-availability/${availabilityId}/`);
        return response.status; // Returns the HTTP status code
    } catch (error) {
        console.error('Erreur lors de la suppression de la disponibilité de l\'enseignant :', error);
        throw error;
    }
};



export const signup = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users/signup/`, userData);  // Ajouter le reste du chemin ici
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Something went wrong during signup.');
    }
};


export const fetchEducationLevels = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/educationlevel/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching education levels", error);
        throw error;
    }
};

export const fetchNotices = async (schoolId = null) => {
    try {
        const url = schoolId ? `${API_URL}/notices/?school_id=${schoolId}` : `${API_URL}/notices/`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching notices:', error);
        throw error;
    }
};

// Create a new notice
export const createNotice = async (noticeData) => {
    try {
        const response = await axios.post(`${API_URL}/notices/`, noticeData);
        return response.data;
    } catch (error) {
        console.error('Error creating notice:', error);
        throw error;
    }
};

// Update an existing notice
export const updateNotice = async (noticeId, noticeData) => {
    try {
        const response = await axios.put(`${API_URL}/notices/${noticeId}/`, noticeData);
        return response.data;
    } catch (error) {
        console.error('Error updating notice:', error);
        throw error;
    }
};


// Utilisez cette URL dans fetchTeacherById pour appeler retrieve_teacher avec l'ID de l'utilisateur.
export const fetchTeacherById = async (userId) => {
    try {
      const response = await axios.get(`https://scolara-backend.onrender.com/api/users/${userId}/retrieve_teacher/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      throw error;
    }
};

export const fetchUsersByRole = async (roleId) => {
    try {
        const response = await axios.get(`${API_URL}/users/?role_id=${roleId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users by role", error);
        throw error;
    }
};

export const fetchUsersByRoleSchool = async (schoolId,roleId) => {
    try {
        const response = await axios.get(`${API_URL}/users/?school_id=${schoolId}&role_id=${roleId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users by role & school", error);
        throw error;
    }
};

export const fetchDriverById = async (driverId) => {
    try {
      const response = await axios.get(`https://scolara-backend.onrender.com/api/users/${driverId}/retrieve_driver/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      throw error;
    }
};

export const fetchStudentById = async (userId) => {
    try {
      const response = await axios.get(`https://scolara-backend.onrender.com/api/users/${userId}/retrieve_student/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      throw error;
    }
};

// Créer un nouveau niveau d'éducation
export const createEducationLevel = async (levelData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/educationlevel/`, levelData);
        return response.data;  // Niveau d'éducation créé
    } catch (error) {
        console.error("Erreur lors de la création du niveau d'éducation :", error);
        throw error;
    }
};



// Mettre à jour un niveau d'éducation existant
export const updateEducationLevel = async (id, updatedData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/educationlevel/${id}/`, updatedData);
        return response.data;  // Niveau d'éducation mis à jour
    } catch (error) {
        console.error("Erreur lors de la mise à jour du niveau d'éducation :", error);
        throw error;
    }
};

// Supprimer un niveau d'éducation
export const deleteEducationLevel = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/educationlevel/${id}/`);
        return `Niveau d'éducation avec l'ID ${id} supprimé avec succès.`;
    } catch (error) {
        console.error("Erreur lors de la suppression du niveau d'éducation :", error);
        throw error;
    }
};

export const fetchEducationLevelsBySchool = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/educationlevel/?school_id=${schoolId}`);
        console.log("Education levels:", response.data); // Vérifiez la structure ici
        return response.data;
    } catch (error) {
        console.error("Error fetching education levels", error);
        throw error;
    }
};

export const fetchStudentsBySchool = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/get_students/?school_id=${schoolId}`);
        console.log("Education levels:", response.data); // Vérifiez la structure ici
        return response.data;
    } catch (error) {
        console.error("Error fetching education levels", error);
        throw error;
    }
};

export const fetchStudentsByEducationLevel = async (schoolId, educationLevel) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/get_students_by_education_level/`, {
            params: { school_id: schoolId, education_level: educationLevel },
        });
        console.log("Students by education level:", response.data); // Vérifiez la structure ici
        return response.data;
    } catch (error) {
        console.error("Error fetching students by education level", error.response || error);
        throw error;
    }
};

export const fetchDriversBySchool = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/get_drivers/?school_id=${schoolId}`);
        console.log("Drivers Data:", response.data); // Vérifiez la structure ici
        return response.data;
    } catch (error) {
        console.error("Error fetching drivers", error);
        throw error;
    }
};

export const createDriver = async (driverData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/users/create_driver/`, driverData);
        console.log("Driver created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating driver", error);
        throw error;
    }
};


export const updateDriver = async (driverId, driverData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/users/${driverId}/update_driver/`, driverData);
        console.log("Driver updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating driver", error);
        throw error;
    }
};

export const deleteDriver = async (driverId) => {
    try {
        await axiosInstance.delete(`${API_URL}/users/${driverId}/delete_driver/`);
        console.log("Driver deleted successfully");
    } catch (error) {
        console.error("Error deleting driver", error);
        throw error;
    }
};



export const createStudent = async (studentData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/users/create_student/`, studentData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Assurez-vous que le type de contenu est correct si vous envoyez des fichiers
            },
        });
        return response.data; // Retourne les données de la réponse, y compris l'étudiant créé
    } catch (error) {
        console.error('Erreur lors de la création de l\'étudiant :', error);
        throw error; // Relance l'erreur pour une gestion ultérieure
    }
};

export const createParent = async (parentData) => {
    try {
        const schoolId = Cookies.get('SchoolId');
        if (!schoolId) {
            throw new Error("SchoolId introuvable dans les cookies.");
        }

        // Ajouter SchoolId directement dans parentData
        parentData.append('school', schoolId);

        // Vérifier ce qui est envoyé
        console.log("✅ Données envoyées au backend :", Object.fromEntries(parentData.entries()));

        // Envoyer la requête sans `Content-Type`, Axios le gère
        const response = await axiosInstance.post(`${API_URL}/users/create_parent/`, parentData);

        console.log("✅ Réponse du backend :", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Erreur lors de la création du parent :", error.response?.data || error.message);
        throw error;
    }
};



export const fetchClassrooms = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/classrooms/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching education levels", error);
        throw error;
    }
};

export const createClassrooms = async (levelData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/classrooms/`, levelData);
        return response.data;  // Niveau d'éducation créé
    } catch (error) {
        console.error("Erreur lors de la création du niveau d'éducation :", error);
        throw error;
    }
};

export const updateClassrooms = async (id, updatedData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/classrooms/${id}/`, updatedData);
        return response.data;  // Niveau d'éducation mis à jour
    } catch (error) {
        console.error("Erreur lors de la mise à jour du niveau d'éducation :", error);
        throw error;
    }
};

export const deleteClassrooms = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/classrooms/${id}/`);
        return `Niveau d'éducation avec l'ID ${id} supprimé avec succès.`;
    } catch (error) {
        console.error("Erreur lors de la suppression du niveau d'éducation :", error);
        throw error;
    }
};



// Fonction pour créer un nouvel enseignant
export const createTeacher = async (teacherData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/users/create_teacher/`, teacherData);
        return response.data; 
    } catch (error) {
        console.error('Erreur lors de la création de l\'enseignant :', error);
        throw error; 
    }
};

// Fonction pour récupérer les détails d'un enseignant
export const getTeacherDetails = async (teacherId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/retrieve_teacher/${teacherId}/`);
        return response.data; 
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'enseignant :', error);
        throw error; 
    }
};

// Fonction pour mettre à jour un enseignant
export const updateTeacher = async (teacherId, teacherData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/users/${teacherId}/update_teacher/`, teacherData);
        return response.data; 
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'enseignant :', error);
        throw error; 
    }
};

// Fonction pour supprimer un enseignant
export const deleteTeacher = async (teacherId) => {
    try {
        await axiosInstance.delete(`${API_URL}/users/${teacherId}/delete_teacher/`);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'enseignant :', error);
        throw error; 
    }
};


export const fetchTimetables = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/timetables/`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'emploi du temps :", error);
        throw error;
    }
};

// 2. Ajouter une nouvelle séance
export const createTimetable = async (timetableData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/timetables/`, timetableData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de la séance :", error);
        throw error;
    }
};

// 3. Modifier une séance existante
export const updateTimetable = async (id, timetableData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/timetables/${id}/`, timetableData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la séance :", error);
        throw error;
    }
};

// 4. Supprimer une séance
export const deleteTimetable = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/timetables/${id}/`);
    } catch (error) {
        console.error("Erreur lors de la suppression de la séance :", error);
        throw error;
    }
};


export const getTimetableById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/timetables/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de la séance :", error);
        throw error;
    }
};

export const fetchStudentSubjects = async (schoolId, educationLevelId) => {
    try {
        const response = await axios.get(
            `${API_URL}/subjects/?school_id=${schoolId}&education_level_id=${educationLevelId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects", error);
        throw error;
    }
};

export const fetchSubjects = async (schoolId) => {
    try {
        const response = await axios.get(
            `${API_URL}/subjects/?school_id=${schoolId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects", error);
        throw error;
    }
};


export const updateTeacherAbsence = async (teacherId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${teacherId}/update_teacher/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du nombre d'absences :", error);
        throw error;
    }
};

export const updateAdminPassword = async (adminId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${adminId}/update_admin/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'admin:", error);
        throw error;
    }
};

export const updateTeacherpassword = async (teacherId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${teacherId}/update_teacher/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'ensignant:", error);
        throw error;
    }
};

export const updateStudentPassword = async (studentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${studentId}/updatestudent/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant:", error);
        throw error;
    }
};

export const updateParentPassword = async (parentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${parentId}/updateparent/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du parent :", error);
        throw error;
    }
};

export const updateDriverpassword = async (driverId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${driverId}/update_driver/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du chauffeur:", error);
        throw error;
    }
};

export const updateSchoolLogo = async (schoolId, formData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/school/${schoolId}/update_logo/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du logo de l\'école :', error);
        throw error;
    }
};

export const updateStudentAbsence = async (studentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${studentId}/updatestudent/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du nombre d'absences :", error);
        throw error;
    }
};


export const updateTeacherSalary = async (teacherId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${teacherId}/update_teacher/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du salaire :", error);
        throw error;
    }
};

export const updateDriverSalary = async (driverId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${driverId}/update_driver/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du salaire :", error);
        throw error;
    }
};

export const updateStudentSalary = async (studentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${studentId}/updatestudent/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du salaire :", error);
        throw error;
    }
};

export const updateTeacherSessionSalary = async (teacherId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${teacherId}/update_teacher/`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du salaire par séance :", error);
        throw error;
    }
};



export const updateTeacherProfilePicture = async (teacherId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${teacherId}/update_teacher/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};


export const updatestudentProfilePicture = async (studentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${studentId}/updatestudent/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};

export const updateParentProfilePicture = async (parentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${parentId}/updateparent/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};

export const updateAdminProfilePicture = async (adminId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${adminId}/update_admin/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};


export const updateDriverProfilePicture = async (driverId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${driverId}/update_driver/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};

export const updateStudentProfilePicture = async (studentId, updatedData) => {
    try {
        const response = await axios.put(`https://scolara-backend.onrender.com/api/users/${studentId}/updatestudent/`, updatedData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil :", error);
        throw error;
    }
};
  
  

export const fetchSubjectsByEducationLevel = async (educationLevelId) => {
    try {
        const response = await axios.get(`${API_URL}/subjects/?education_level_id=${educationLevelId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects by education level", error);
        throw error;
    }
};


export const addSubject = async (subjectData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/subjects/`, subjectData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du subject :', error);
        throw error;
    }
};

export const updateSubject = async (id, updatedData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/subjects/${id}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du subject :', error);
        throw error;
    }
};

export const deleteSubject = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/subjects/${id}/`);
    } catch (error) {
        console.error('Erreur lors de la suppression du subject :', error);
        throw error;
    }
};

export const fetchCourses = async (schoolId, educationLevelId) => {
    try {
        const response = await axios.get(`${API_URL}/course/?school_id=${schoolId}&education_level=${educationLevelId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching courses", error);
        throw error;
    }
};

export const fetchAdminCourses = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/course/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching courses", error);
        throw error;
    }
};



export const createCourse = async (courseData) => {
    try {
        const response = await axios.post(`${API_URL}/course/`, courseData);
        return response.data;
    } catch (error) {
        console.error("Error creating course", error);
        throw error;
    }
};

export const updateCourse = async (courseId, updatedCourseData) => {
    try {
        const response = await axios.put(`${API_URL}/course/${courseId}/`, updatedCourseData);
        return response.data;
    } catch (error) {
        console.error("Error updating course", error);
        throw error;
    }
};

export const deleteCourse = async (courseId) => {
    try {
        await axios.delete(`${API_URL}/course/${courseId}/`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting course", error);
        throw error;
    }
};

export const uploadCourseFile = async (fileData) => {
    try {
        const response = await axios.post(`${API_URL}/coursefile/`, fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading course file", error);
        throw error;
    }
};


export const updateCourseFile = async (fileId, updatedFileData) => {
    try {
        const response = await axios.put(`${API_URL}/coursefile/${fileId}/`, updatedFileData);
        return response.data;
    } catch (error) {
        console.error("Error updating course file", error);
        throw error;
    }
};

export const deleteCourseFile = async (fileId) => {
    try {
        await axios.delete(`${API_URL}/coursefile/${fileId}/`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting course file", error);
        throw error;
    }
};


export const fetchCourseFiles = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/coursefile/`);
        
        // Filtrer les fichiers pour obtenir uniquement ceux associés au cours spécifié
        const courseFiles = response.data.filter(file => file.course === courseId);
        
        return courseFiles;
    } catch (error) {
        console.error("Error fetching course files", error);
        throw error;
    }
};


export const fetchStudentCourseFiles = async (subjectId) => {
    try {
        const response = await axios.get(`${API_URL}/coursefile/?subject=${subjectId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers de cours :", error);
        throw error;
    }
};


export const fetchCourseDetails = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/course/${courseId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course details", error);
        throw error;
    }
};

export const fetchGrades = async (educationLevelId, subjectId) => {
    try {
        const response = await axiosInstance.get(
            `${API_URL}/grades/?education_level=${educationLevelId}&subject_id=${subjectId}`
        );
        console.log("Grades récupérés :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des notes :", error);
        throw error;
    }
};




export const fetchStudentGrades = async (userId, subjectId) => {
    try {
        const response = await axiosInstance.get(
            `/grades/?user_id=${userId}&subject_id=${subjectId}`
        );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des notes de l'étudiant :", error);
        throw error;
    }
};


export const fetchGradeById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/grades/${id}/`);
        console.log(`Détails de la note ID ${id} :`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la note ID ${id} :`, error);
        throw error;
    }
};

export const updateGrade = async (id, gradeData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/grades/${id}/`, gradeData);
        console.log(`Note ID ${id} mise à jour :`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la note ID ${id} :`, error);
        throw error;
    }
};

export const deleteGrade = async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/grades/${id}/`);
        console.log(`Note ID ${id} supprimée.`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de la note ID ${id} :`, error);
        throw error;
    }
};


export const createGrade = async (gradeData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/grades/`, gradeData);
        console.log("Note créée :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de la note :", error);
        throw error;
    }
};


export const getStudentName = async (studentId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/${studentId}/`);
        return `${response.data.first_name} ${response.data.last_name}`;
    } catch (error) {
        console.error("Erreur lors de la récupération du nom de l'étudiant :", error);
        return null;
    }
};


// Fonction pour récupérer tous les transports ou filtrer par school_id
export const getTransports = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transports/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des transports :', error);
        throw error;
    }
};

// Fonction pour récupérer un transport par ID
export const getTransportById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transports/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du transport :', error);
        throw error;
    }
};

// Fonction pour créer un nouveau transport
export const createTransport = async (transportData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/transports/`, transportData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du transport :', error);
        throw error;
    }
};

// Fonction pour mettre à jour un transport
export const updateTransport = async (id, transportData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/transports/${id}/`, transportData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du transport :', error);
        throw error;
    }
};

// Fonction pour supprimer un transport
export const deleteTransport = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/transports/${id}/`);
    } catch (error) {
        console.error('Erreur lors de la suppression du transport :', error);
        throw error;
    }
};

export const getUserNameById = async (userId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/${userId}/`);
        return response.data.username;  // Assurez-vous que l'API renvoie `username`
    } catch (error) {
        console.error('Erreur lors de la récupération du nom d\'utilisateur :', error);
        throw error;
    }
};

// Fonctions similaires pour Location
export const getLocations = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/locations/`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des locations :', error);
        throw error;
    }
};

export const createLocation = async (locationData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/locations/`, locationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la location :', error);
        throw error;
    }
};

export const updateLocation = async (id, locationData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/locations/${id}/`, locationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la location :', error);
        throw error;
    }
};

export const deleteLocation = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/locations/${id}/`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la location :', error);
        throw error;
    }
};


// Fonctions pour TransportLocation
export const getTransportLocations = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transports-locations/`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des relations transport-location :', error);
        throw error;
    }
};

export const createTransportLocation = async (transportLocationData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/transports-locations/`, transportLocationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la relation transport-location :', error);
        throw error;
    }
};

export const updateTransportLocation = async (id, transportLocationData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/transports-locations/${id}/`, transportLocationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la relation transport-location :', error);
        throw error;
    }
};

export const deleteTransportLocation = async (id) => {
    try {
        await axiosInstance.delete(`${API_URL}/transports-locations/${id}/`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la relation transport-location :', error);
        throw error;
    }
};


// Fonction pour obtenir la liste des événements
export const fetchEvents = async () => {
    try {
        const response = await axiosInstance.get('/events/');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
        throw error;
    }
};

// Fonction pour créer un nouvel événement
export const createEvent = async (eventData) => {
    try {
        const response = await axiosInstance.post('/events/', eventData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de l'événement:", error);
        throw error;
    }
};

// Fonction pour mettre à jour un événement existant
export const updateEvent = async (eventId, updatedEventData) => {
    try {
        const response = await axiosInstance.put(`/events/${eventId}/`, updatedEventData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'événement:", error);
        throw error;
    }
};

// Fonction pour supprimer un événement
export const deleteEvent = async (eventId, schoolId) => {
    try {
        await axiosInstance.delete(`/events/${eventId}/`, {
            params: { school_id: schoolId },
        });
        console.log(`Événement ${eventId} supprimé avec succès.`);
    } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        throw error;
    }
};

export const deletetodaysEvents = async (eventId, schoolId) => {
    try {
        await axiosInstance.delete(`/events/delete-today/`, {
            params: { school_id: schoolId },
        });
        console.log(`Événement ${eventId} supprimé avec succès.`);
    } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        throw error;
    }
};

export const deleteEventsByDate = async (schoolId, date) => {
    try {
        await axios.delete(`https://scolara-backend.onrender.com/events/delete-by-date/`, {
            params: { school_id: schoolId, date },
        });
        console.log(`Événements supprimés pour la date ${date}.`);
    } catch (error) {
        console.error("Erreur lors de la suppression des événements:", error);
        throw error;
    }
};


export const fetchTransactions = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transactions/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions :', error);
        throw error;
    }
};

export const fetchExpenses = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transactions/expenses/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des dépenses :', error);
        throw error;
    }
};

export const fetchEarnings = async (schoolId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/transactions/earnings/?school_id=${schoolId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des dépenses :', error);
        throw error;
    }
};

export const fetchBulletinGrades = async (userId, subjectId) => {
    try {
        const response = await axiosInstance.get(
            `${API_URL}/grades/`,
            {
                params: {
                    user_id: userId,
                    subject_id: subjectId,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching bulletin grades:", error);
        throw error;
    }
};

// Créer une nouvelle transaction pour une école spécifique
export const createTransaction = async (transactionData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/transactions/`, transactionData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la transaction :', error);
        throw error;
    }
};

export const fetchSubjectStatistics = async (subjectId) => {
    try {
        const response = await axiosInstance.get(`/grades/subject_statistics/`, {
            params: {
                subject_id: subjectId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching subject statistics:", error);
        throw error; // Re-throw the error for the caller to handle
    }
};

export const createExpense = async (transactionData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/transactions/create-expense/`, transactionData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la dépense :', error);
        throw error;
    }
};

export const createEarning = async (transactionData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/transactions/create-earning/`, transactionData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du revenu :', error);
        throw error;
    }
};


// Mettre à jour une transaction existante pour une école spécifique
export const updateTransaction = async (schoolId, transactionId, updatedData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/transactions/${transactionId}/`, {
            ...updatedData,
            school: schoolId, // Ajoute l'école à la transaction pour mise à jour
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la transaction :', error);
        throw error;
    }
};

// Supprimer une transaction pour une école spécifique
export const deleteTransaction = async (schoolId, transactionId) => {
    try {
        await axiosInstance.delete(`${API_URL}/transactions/${transactionId}/?school_id=${schoolId}`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la transaction :', error);
        throw error;
    }
};

export const markTeacherAsPaid = async (teacherId) => {
    try {
        console.log(`Appel API pour marquer comme payé : ${API_URL}/users/${teacherId}/mark-paid/`);
        const response = await axiosInstance.patch(`${API_URL}/users/${teacherId}/mark-paid/`);
        console.log("Réponse de l'API :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de paiement :", error.response?.data || error.message);
        throw error;
    }
};

export const markDriverAsPaid = async (driverId, data) => {
    try {
      console.log(`Appel API pour marquer comme payé : ${API_URL}/users/${driverId}/mark-driver-paid/`);
      const response = await axiosInstance.patch(`${API_URL}/users/${driverId}/mark-driver-paid/`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de paiement :", error.response?.data || error);
      throw error;
    }
  };
  
export const markStudentAsPaid = async (studentId) => {
    try {
        const response = await axiosInstance.patch(`${API_URL}/users/${studentId}/mark-student-paid/`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de paiement :", error.response.data);
        throw error;
    }
};

export const fetchControls = async (schoolId, teacherId, educationLevelId, subjectId) => {
    try {
        const response = await axios.get(
            `${API_URL}/controls/?school_id=${schoolId}&teacher=${teacherId}&education_level=${educationLevelId}&subject=${subjectId}`
        );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des contrôles :", error);
        throw error;
    }
};

export const fetchAdminControls = async (schoolId, educationLevelId, subjectId) => {
    try {
        const response = await axios.get(
            `${API_URL}/controls/?school_id=${schoolId}&education_level=${educationLevelId}&subject=${subjectId}`
        );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des contrôles :", error);
        throw error;
    }
};

export const fetchAdminBySchool = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/users/?role_id=1&school_id=${schoolId}`);
        // On suppose que l'API retourne une liste avec un seul administrateur
        return response.data[0]; // Retourne le premier administrateur
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'administrateur :', error);
        throw error; // Propager l'erreur pour gestion ultérieure
    }
};

export const fetchStudentControls = async (schoolId, subjectId) => {
    try {
        const response = await axios.get(
            `${API_URL}/controls/?school_id=${schoolId}&subject=${subjectId}`
        );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des contrôles :", error);
        throw error;
    }
};

export const fetchControlsById = async (controlId) => {
    try {
        const response = await axios.get(`${API_URL}/controls/${controlId}/`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du contrôle :", error);
        throw error;
    }
};


// Récupérer un contrôle spécifique par ID
export const fetchControlById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/controls/${id}/`);
        console.log(`Détails du contrôle ID ${id} :`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du contrôle ID ${id} :`, error);
        throw error;
    }
};

// Créer un nouveau contrôle
export const createControl = async (controlData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/controls/`, controlData);
        console.log("Contrôle créé :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création du contrôle :", error);
        throw error;
    }
};

// Mettre à jour un contrôle existant
export const updateControl = async (id, controlData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/controls/${id}/`, controlData);
        console.log(`Contrôle ID ${id} mis à jour :`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du contrôle ID ${id} :`, error);
        throw error;
    }
};

// Supprimer un contrôle
export const deleteControl = async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/controls/${id}/`);
        console.log(`Contrôle ID ${id} supprimé.`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression du contrôle ID ${id} :`, error);
        throw error;
    }
};

export const createConversation = async (user1Id, user2Id) => {
    try {
        const response = await axios.post(`${API_URL}/chatrooms/`, {
            user1: user1Id,
            user2: user2Id,
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la conversation :', error);
        throw error;
    }
};

export const fetchUserConversations = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chatrooms/?participants=${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user conversations", error);
        throw error;
    }
};

export const fetchMessages = async (chatRoomId) => {
    const url = `${API_URL}/messages/?chat_room=${chatRoomId}`;
    console.log("Fetching messages from URL:", url); // Vérifiez l'URL
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        throw error;
    }
};

export const checkExistingChatRoom = async (user1Id, user2Id) => {
    try {
        const response = await axios.get(
            `${API_URL}/chatrooms/?user1=${user1Id}&user2=${user2Id}`
        );
        return response.data; // Retourne les informations de la chatroom si elle existe
    } catch (error) {
        console.error("Erreur lors de la vérification de la chatroom :", error);
        throw error;
    }
};

export const fetchCoefficientsSum = async (studentId) => {
    const url = `https://scolara-backend.onrender.com/api/users/${studentId}/calculate_coefficients_sum/`;

    try {
        const response = await axios.get(url);
        return response.data; // Retourne la somme des coefficients
    } catch (error) {
        console.error(`Erreur lors de la récupération de la somme des coefficients pour l'étudiant ${studentId}:`, error);
        throw error; // Lance une exception pour que l'appelant puisse la gérer
    }
};

export const fetchGeneralAverage = async (studentId) => {
    try {
        const response = await axios.get(`${API_URL}/users/${studentId}/calculate_general_average/`);
        return response.data.general_average; // Retourne la moyenne générale
    } catch (error) {
        console.error("Erreur lors de la récupération de la moyenne générale :", error);
        throw error; // Relance l'erreur pour gestion côté appelant
    }
};

export const fetchGeneralEducationLevelAverage = async (educationlevelId) => {
    try {
        const response = await axios.get(`${API_URL}/grades/class_average/`, {
            params: { education_level_id: educationlevelId }, // Utilisation des query params
        });
        return response.data.class_average; // Retourne la moyenne générale
    } catch (error) {
        console.error("Erreur lors de la récupération de la moyenne générale :", error);
        throw error; // Relance l'erreur pour gestion côté appelant
    }
};

export const sendMessage = async (chatRoomId, senderId, content, file) => {
    try {
        const formData = new FormData();
        formData.append('chat_room', chatRoomId);
        formData.append('sender', senderId);

        // Inclure le contenu texte ou le fichier
        if (content) {
            formData.append('content', content);
        }
        if (file) {
            formData.append('file', file);
        }

        const response = await axios.post(`${API_URL}/messages/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message :', error);
        throw error;
    }
};



export const deleteConversation = async (chatRoomId) => {
    try {
        await axios.delete(`${API_URL}/chatrooms/${chatRoomId}/`);
    } catch (error) {
        console.error("Error deleting conversation", error);
        throw error;
    }
};

export const startConversation = async (currentUserId, userId) => {
    try {
        const response = await createConversation([currentUserId, userId]);
        return response.data;
    } catch (error) {
        console.error("Error starting conversation", error);
        throw error;
    }
};

export const sendMessageToChat = async (chatRoomId, currentUserId, content) => {
    try {
        const response = await sendMessage(chatRoomId, currentUserId, content);
        return response.data;
    } catch (error) {
        console.error("Error sending message", error);
        throw error;
    }
};

export const loadMessages = async (chatRoomId) => {
    try {
        const messages = await fetchMessages(chatRoomId);
        console.log("Messages :", messages);
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
    }
};

export const fetchTimeSlots = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/timeslots/`, {
            params: { school_id: schoolId },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des créneaux horaires:', error);
        throw error;
    }
};

// Create a new timeslot
export const createTimeSlot = async (schoolId, start_time, end_time) => {
    try {
        const response = await axios.post(`${API_URL}/timeslots/`, {
            school: schoolId,
            start_time,
            end_time,
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du créneau horaire:', error);
        throw error;
    }
};

// Update an existing timeslot
export const updateTimeSlot = async (id, start_time, end_time, school) => {
    try {
        const response = await axios.put(`${API_URL}/timeslots/${id}/`, {
            start_time,
            end_time,
            school,
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du créneau horaire:', error);
        throw error;
    }
};


// Delete a timeslot
export const deleteTimeSlot = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/timeslots/${id}/`);
        return response.status === 204;
    } catch (error) {
        console.error('Erreur lors de la suppression du créneau horaire:', error);
        throw error;
    }
};

export const fetchDriverTransports = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/driver-transports/`);
        return response.data; // Renvoie la liste des noms des transports
    } catch (error) {
        console.error('Erreur lors de la récupération des transports du chauffeur :', error);
        throw error; // Propager l'erreur pour qu'elle soit gérée dans le frontend
    }
};

export const fetchDuplicateTeacherEducationLevels = async (firstName, lastName) => {
    try {
      const response = await axios.get(`/api/duplicate-teacher-education-levels/`, {
        params: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux d\'éducation des enseignants dupliqués:', error);
      throw error;
    }
  };


  export const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await axios.post(`${API_URL}/send-sms/`, {
            phone_number: phoneNumber,
            message: message,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data; // Renvoie la réponse de l'API si l'envoi est réussi
    } catch (error) {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        if (error.response) {
            // Erreur renvoyée par le serveur
            throw new Error(error.response.data.error || 'Erreur inconnue du serveur.');
        } else if (error.request) {
            // Aucune réponse du serveur
            throw new Error('Aucune réponse du serveur.');
        } else {
            // Erreur lors de la configuration de la requête
            throw new Error('Erreur de configuration de la requête.');
        }
    }
};

export const fetchHomeworkBooks = async (educationLevel = null) => {
    try {
        const params = educationLevel ? { education_level: educationLevel } : {};
        const response = await axios.get('http://localhost:8000/api/homework-books/', {
            params: params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching HomeworkBooks:', error);
        throw error;
    }
};

export const createHomeworkBook = async (homeworkBookData) => {
    try {
        const response = await axios.post('http://localhost:8000/api/homework-books/', homeworkBookData);
        return response.data;
    } catch (error) {
        console.error('Error creating HomeworkBook:', error);
        throw error;
    }
};

export const updateHomeworkBook = async (id, updatedData) => {
    try {
        const response = await axios.put(`http://localhost:8000/api/homework-books/${id}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating HomeworkBook:', error);
        throw error;
    }
};

export const deleteHomeworkBook = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:8000/api/homework-books/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting HomeworkBook:', error);
        throw error;
    }
};


export const fetchHomeworkBooksByEducationLevel = async (educationLevel) => {
    try {
        const response = await axios.get('http://localhost:8000/api/homework-books/', {
            params: {
                education_level: educationLevel
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des cahiers de textes:', error);
        throw error;
    }
};