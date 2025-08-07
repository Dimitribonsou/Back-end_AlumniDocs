function obtenirAnneeScolaire() {
    const dateActuelle = new Date();
    const moisActuel = dateActuelle.getMonth() + 1; // Les mois commencent à 0
    const anneeActuelle = dateActuelle.getFullYear();
  
    let anneeScolaire;
  
    if (moisActuel >= 9) {
      // Si nous sommes en août ou après, l'année scolaire commence cette année
      anneeScolaire = `${anneeActuelle}/${anneeActuelle + 1}`;
    } else {
      // Sinon, l'année scolaire a commencé l'année dernière
      anneeScolaire = `${anneeActuelle - 1}/${anneeActuelle}`;
    }
  
    return anneeScolaire;
  }
 const fonction={
    obtenirAnneeScolaire
 }
  export default fonction;
 