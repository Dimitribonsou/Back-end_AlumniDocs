// authClient.js
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export function createOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oAuth2Client;
}
