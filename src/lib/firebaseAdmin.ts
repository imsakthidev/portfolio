import crypto from 'crypto';

/**
 * Generates a Firebase email verification link using the Identity Toolkit
 * REST API directly — no firebase-admin package needed.
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set');
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
}

/**
 * Create a signed JWT and exchange it for a Google OAuth2 access token.
 */
async function getAccessToken(): Promise<string> {
  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/cloud-platform',
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(sa.private_key, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth2 token exchange failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Generate an email verification link via the Identity Toolkit REST API.
 * Uses `returnOobLink: true` so we get the link back (instead of Firebase sending its own email).
 */
export async function generateVerificationLink(email: string, continueUrl: string): Promise<string> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requestType: 'VERIFY_EMAIL',
        email,
        continueUrl,
        returnOobLink: true,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`generateVerificationLink failed: ${err}`);
  }

  const data = await res.json();
  return data.oobLink;
}
