--nouvelle table pour stocker les tokens oauth  2025-09-09
CREATE TABLE oauth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  scope TEXT,
  token_type VARCHAR(50),
  expiry_date BIGINT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
--ajoustement faites dans la tables documents 025-09-09
ALTER TABLE documents ADD COLUMN   lien_fichier VARCHAR(100)
ALTER TABLE documents ADD COLUMN   drive_file_id VARCHAR(255)
---ajoustement faites dans la tables CLASSE 025-09-09
ALTER TABLE classe ADD COLUMN drive_folder_id varchar(255) DEFAULT NULL
