// utils/urlEncoder.js
export const encodePath = (path) => {
    return btoa(path);  // Encode en Base64
};

export const decodePath = (encodedPath) => {
    try {
        return atob(encodedPath);  // Decode en Base64
    } catch (error) {
        return '/'; // Redirige vers la page d'accueil en cas d'erreur
    }
};
