import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route pour servir une image spécifique depuis le dossier Annonces
router.get('/image/annonce/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../public/Fichiers/Annonces', filename);
    res.sendFile(imagePath);
});

export default router; 