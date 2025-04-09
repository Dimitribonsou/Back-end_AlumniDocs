-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 09 avr. 2025 à 08:59
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bd_alumnidocs`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `statut_compte` tinyint(1) DEFAULT NULL,
  `code_access` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

DROP TABLE IF EXISTS `annonces`;
CREATE TABLE IF NOT EXISTS `annonces` (
  `id_annonce` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `image` varchar(50) DEFAULT NULL,
  `date_publication` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` tinyint(1) DEFAULT NULL,
  `id_admin` int DEFAULT NULL,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_annonce`),
  KEY `id_admin` (`id_admin`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorie_requete`
--

DROP TABLE IF EXISTS `categorie_requete`;
CREATE TABLE IF NOT EXISTS `categorie_requete` (
  `id_categorie` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_categorie`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classe`
--

DROP TABLE IF EXISTS `classe`;
CREATE TABLE IF NOT EXISTS `classe` (
  `id_classe` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  `numero_salle` int DEFAULT NULL,
  `classe_sup` int DEFAULT NULL,
  `id_niveau` int DEFAULT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_classe`),
  KEY `fk_classe_niveau` (`id_niveau`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `documents`
--

DROP TABLE IF EXISTS `documents`;
CREATE TABLE IF NOT EXISTS `documents` (
  `id_document` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  `date_creation` datetime DEFAULT NULL,
  `statut_document` tinyint(1) DEFAULT NULL,
  `id_etudiant` int DEFAULT NULL,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_document`),
  KEY `id_user` (`id_etudiant`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `etudiant`
--

DROP TABLE IF EXISTS `etudiant`;
CREATE TABLE IF NOT EXISTS `etudiant` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `statut_compte` tinyint(1) DEFAULT '1',
  `matricule` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `etudiant`
--

INSERT INTO `etudiant` (`id_utilisateur`, `nom`, `prenom`, `email`, `telephone`, `password`, `statut_compte`, `matricule`) VALUES
(2, 'Dimidev', 'Officiel', 'dimidev@gmail.com', '674606328', '$2b$10$sD1gPTbrBiYv6MLyCsuoxex/L6NKd8JqPJNWWsY/a4OKONyo.p2Si', 1, 'iuc2025');

-- --------------------------------------------------------

--
-- Structure de la table `filiere`
--

DROP TABLE IF EXISTS `filiere`;
CREATE TABLE IF NOT EXISTS `filiere` (
  `id_filiere` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_filiere`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `forum`
--

DROP TABLE IF EXISTS `forum`;
CREATE TABLE IF NOT EXISTS `forum` (
  `id_forum` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_admin` int DEFAULT NULL,
  `id_filiere` int DEFAULT NULL,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id_forum`),
  KEY `id_admin` (`id_admin`),
  KEY `id_filiere` (`id_filiere`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id_message` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) DEFAULT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_etudiant` int DEFAULT NULL,
  `id_forum` int DEFAULT NULL,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_message`),
  KEY `id_etudiant` (`id_etudiant`),
  KEY `fk_messages_forum` (`id_forum`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `niveau`
--

DROP TABLE IF EXISTS `niveau`;
CREATE TABLE IF NOT EXISTS `niveau` (
  `id_niveau` int NOT NULL AUTO_INCREMENT,
  `numero` int DEFAULT '1',
  `id_filiere` int DEFAULT NULL,
  PRIMARY KEY (`id_niveau`),
  KEY `id_filiere` (`id_filiere`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id_notification` int DEFAULT NULL,
  `libelle` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_user` int DEFAULT NULL,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `promotion`
--

DROP TABLE IF EXISTS `promotion`;
CREATE TABLE IF NOT EXISTS `promotion` (
  `id_classe` int NOT NULL,
  `id_etudiant` int NOT NULL,
  `annee_scolaire` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_classe`,`id_etudiant`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `publications`
--

DROP TABLE IF EXISTS `publications`;
CREATE TABLE IF NOT EXISTS `publications` (
  `id_annonce` int NOT NULL,
  `id_classe` int NOT NULL,
  `date_publication` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_classe`,`id_annonce`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `requete`
--

DROP TABLE IF EXISTS `requete`;
CREATE TABLE IF NOT EXISTS `requete` (
  `id_requete` int NOT NULL AUTO_INCREMENT,
  `objet` varchar(50) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `piece_jointe` varchar(100) DEFAULT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` tinyint(1) DEFAULT '1',
  `id_categorie` int DEFAULT NULL,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_requete`),
  KEY `id_categorie` (`id_categorie`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `signalement`
--

DROP TABLE IF EXISTS `signalement`;
CREATE TABLE IF NOT EXISTS `signalement` (
  `id_etudiant` int NOT NULL,
  `id_annonce` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_etudiant`,`id_annonce`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `super_admin`
--

DROP TABLE IF EXISTS `super_admin`;
CREATE TABLE IF NOT EXISTS `super_admin` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `statut_compte` tinyint(1) DEFAULT NULL,
  `code_access` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `telephone` varchar(25) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `statut_compte` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `validation_document`
--

DROP TABLE IF EXISTS `validation_document`;
CREATE TABLE IF NOT EXISTS `validation_document` (
  `id_admin` int NOT NULL,
  `id_document` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `annee_scolaire` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id_admin`,`id_document`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
