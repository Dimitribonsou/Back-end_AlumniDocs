import  path from 'path';
 const NewFiles =  (req, res)  => {
    try {
        const files = req.files; // Les fichiers sont maintenant dans req.files
        const studentName = req.body.nom;

        if (!files || !files['document1'] || !files['document2']) {
            return res.status(400).json({
                message: "Les deux documents sont requis"
            });
        }
        const doc1Path = files['document1'][0].path;
        const doc2Path = files['document2'][0].path;
        
        // Ici, vous pouvez traiter les chemins des fichiers comme nécessaire
        // Par exemple, les sauvegarder dans la base de données

        res.status(200).json({
            message: "Documents téléversés avec succès",
            doc1: doc1Path,
            doc2: doc2Path
        });
        console.log("nom envoyer depuis le serveur: "+studentName);

    } catch (error) {
        console.log('Erreur lors du traitement des fichiers:', error);
        res.status(500).json({
            message: "Erreur lors du traitement des fichiers",
            error: error.message
        });
    }
};

const DownloadFiles= (req,res) => {
  const filename = req.params.filename;
  // chemin d'acces au fichier
  const filePath = path.join(__dirname, './../Images', filename);
  // Vérifier si le fichier existe avant de le télécharger
  res.download(filePath, filename, (err) => {
      if (err) {
          console.error('Erreur lors du téléchargement du fichier:', err);
          res.status(404).send('Fichier non trouvé');
      }
  });
}
const FileController={
    NewFiles,
    DownloadFiles
};
export default FileController;