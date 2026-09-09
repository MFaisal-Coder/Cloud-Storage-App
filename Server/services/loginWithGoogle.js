import { OAuth2Client } from "google-auth-library";

const client_id = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client({
  client_id,
});

export default async function loginWithGoogle(idToken) {
  const loginTicket = await googleClient.verifyIdToken({
    idToken,
    audience: client_id,
  });

  const userData = loginTicket.getPayload();
  return userData;
}
