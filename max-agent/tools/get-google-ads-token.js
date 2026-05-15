/**
 * One-time helper to get your Google Ads OAuth2 refresh token.
 *
 * Run once locally:
 *   node tools/get-google-ads-token.js
 *
 * Then copy the refresh_token into your .env and Railway environment variables.
 * You never need to run this again — refresh tokens are long-lived.
 *
 * Prerequisites:
 * 1. Create an OAuth2 "Desktop app" credential in Google Cloud Console
 * 2. Enable the Google Ads API in the project
 * 3. Add your Google account as a test user (if the app is in Testing mode)
 * 4. Set GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET in .env
 */

'use strict';

require('dotenv').config();

const https  = require('https');
const http   = require('http');
const url    = require('url');
const crypto = require('crypto');

const CLIENT_ID     = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:8080/oauth2callback';

const SCOPE = 'https://www.googleapis.com/auth/adwords';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET in .env first.');
  process.exit(1);
}

const state = crypto.randomBytes(16).toString('hex');

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent` +
  `&state=${state}`;

console.log('\n1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Authorize access, then wait for the token output below.\n');

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname !== '/oauth2callback') {
    res.end('Not found');
    return;
  }

  const { code, state: returnedState, error } = parsed.query;

  if (error) {
    console.error('OAuth error:', error);
    res.end('Error: ' + error);
    server.close();
    return;
  }

  if (returnedState !== state) {
    console.error('State mismatch — possible CSRF');
    res.end('State mismatch');
    server.close();
    return;
  }

  // Exchange code for tokens
  const body = JSON.stringify({
    code,
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri:  REDIRECT_URI,
    grant_type:    'authorization_code',
  });

  const tokenReq = https.request(
    'https://oauth2.googleapis.com/token',
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } },
    (tokenRes) => {
      let data = '';
      tokenRes.on('data', (chunk) => (data += chunk));
      tokenRes.on('end', () => {
        const tokens = JSON.parse(data);
        console.log('\n✅ Success! Add these to your .env and Railway:\n');
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\nFull token response:', tokens);
        res.end('Done — check your terminal.');
        server.close();
      });
    },
  );

  tokenReq.write(body);
  tokenReq.end();
});

server.listen(8080, () => {
  // server ready — waiting for redirect
});
