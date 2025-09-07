import multer from "multer";

const storage = multer.memoryStorage();
// Initialise multer avec le stockage en mémoire et une limite de taille de fichier (ici 1MB)
const upload = multer({ storage, limits: { fileSize: 1 * 1024 * 1024 } }); // ex : 1MB limit

export default upload;
