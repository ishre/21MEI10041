const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const fetch = global.fetch || require('node-fetch');

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/test';

let authToken = null;
let tokenExpiry = null;

/**
 * Fetch and cache the auth token.
 * Uses the /auth endpoint with client credentials.
 */
async function getAuthToken() {
  const now = Date.now();
  if (authToken && tokenExpiry && now < tokenExpiry) {
    return authToken;
  }
  
  // Request a new token
  const response = await fetch(`${TEST_SERVER_BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: "VIT Bhopal",
      clientID: "2ce3046c-bf71-4936-aa9c-ec936796530e",
      clientSecret: "nEIvhyRnWCGHqHui",
      ownerName: "Shreyash Dubey",
      ownerEmail: "shreyash.dubey2021@vitbhopal.ac.in",
      rollNo: "21MEI10041"
    })
  });
  
  const tokenData = await response.json();
  authToken = tokenData.access_token;
  tokenExpiry = now + tokenData.expires_in * 1000;
  
  return authToken;
}

/**
 * Helper function to make requests with the auth token.
 */
async function fetchWithAuth(url) {
  const token = await getAuthToken();
  return await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
