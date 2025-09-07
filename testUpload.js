import { google } from "googleapis";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
async function testUpload() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: "test.txt",
    parents: [process.env.DRIVE_FOLDER_ID],
  };

  const media = {
    mimeType: "text/plain",
    body: fs.createReadStream("test.txt"),
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name",
  });

  console.log("File uploaded:", res.data);
}

testUpload().catch(console.error);
