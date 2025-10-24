// utils/driveUtils.js
import { Readable } from "stream";

/**
 * échappe une chaîne pour l'utiliser dans la query q de Drive
 */
export function escapeForQuery(name) {
  return name.replace(/'/g, "\\'");
}

/**
 * transforme Buffer -> Readable stream
 */
export function bufferToStream(buffer) {
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
}

/**
 * Cherche un dossier avec un nom donné sous un parent donné.
 * Retourne { id, name } ou null.
 */
export async function findFolderByName(drive, folderName, parentId) {
  const qParts = [
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `name='${escapeForQuery(folderName)}'`
  ];
  if (parentId) qParts.push(`'${parentId}' in parents`);

  const res = await drive.files.list({
    q: qParts.join(" and "),
    fields: "files(id, name)",
    spaces: "drive",
    pageSize: 5
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0];
  }
  return null;
}

/**
 * Crée un dossier (folder) sous parent (ou à la racine si parentId null).
 * Retourne l'id.
 */
export async function createFolder(drive, folderName, parentId) {
  const metadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : []
  };

  const res = await drive.files.create({
    requestBody: metadata,
    fields: "id, name"
  });

  return res.data;
}

/**
 * getOrCreateFolder : cherche un dossier par nom sous le parent, sinon le crée.
 * Retourne { id, name }.
 */
export async function getOrCreateFolder(drive, folderName, parentId) {
  const existing = await findFolderByName(drive, folderName, parentId);
  if (existing) return existing;
  const created = await createFolder(drive, folderName, parentId);
  return created;
}

/**
 * Normalise le nom d'étudiant pour les clés uniques (minuscules, sans accents si besoin)
 */
export function normalizeNameForKey(fullName) {
  // simple normalisation : trim + lowercase + collapse spaces
  return fullName.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Sanitize folder name (supprimer / \ ? % * : | " < >)
 */
export function sanitizeFolderName(name) {
  return name.replace(/[\/\\\?\%\*\:\|\"<>\.]+/g, " ").trim().slice(0, 200);
}
