-- requete de creation de compte
CREATE TABLE inscription(id_inscription int PRIMARY KEY AUTO_INCREMENT , matricule varchar(50) ,id_classe int ,
bac varchar(50),annee_obtension_bac varchar(25), diplome_entrer varchar(50),annee_obtension_diplome varchar(25), 
 FOREIGN KEY (id_classe) 
REFERENCES classe(id_classe),id_etudiant int , FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_utilisateur))
-- ajouter l'id de l'etudiant dans la table requete
ALTER TABLE requete ADD COLUMN id_etudiant int REFERENCES etudiant(id_utilisateur)