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

/**
 * GET /users
 * Returns the top five users with the highest number of posts.
 */
app.get('/users', async (req, res) => {
    try {
      const usersResponse = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users`);
      const usersData = await usersResponse.json();
      
      // Assuming the user data is under "users" property
      const usersObj = usersData.users || usersData;
      let usersArray = [];
      for (const [id, name] of Object.entries(usersObj)) {
        usersArray.push({ id, name });
      }
      
      // Fetch posts for each user concurrently
      const userPostsCounts = await Promise.all(usersArray.map(async (user) => {
        const postsRes = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users/${user.id}/posts`);
        const postsData = await postsRes.json();
        const posts = postsData.posts || [];
        return {
          id: user.id,
          name: user.name,
          postsCount: posts.length
        };
      }));
      
      // Sort users by posts count (descending) and return top 5
      userPostsCounts.sort((a, b) => b.postsCount - a.postsCount);
      res.json(userPostsCounts.slice(0, 5));
    } catch (error) {
      console.error('Error in /users:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  /**
 * GET /posts
 * Query parameter: type (Accepted value: "latest")
 * Returns the most recent posts (newest first, limited to 10).
 */
app.get('/posts', async (req, res) => {
    try {
      const type = req.query.type;
      if (!type || type !== 'latest') {
        return res.status(400).json({ error: "Please provide query parameter type=latest" });
      }
      
      const usersResponse = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users`);
      const usersData = await usersResponse.json();
      const usersObj = usersData.users || usersData;
      let allPosts = [];
      
      const postsPromises = Object.entries(usersObj).map(async ([id, name]) => {
        const postsRes = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users/${id}/posts`);
        const postsData = await postsRes.json();
        const posts = postsData.posts || [];
        posts.forEach(post => { post.userName = name; });
        return posts;
      });
      
      const postsResults = await Promise.all(postsPromises);
      allPosts = postsResults.flat();
      
      // Sort posts by id descending (using id as a proxy for recency)
      allPosts.sort((a, b) => b.id - a.id);
      res.json({ posts: allPosts.slice(0, 10) });
    } catch (error) {
      console.error('Error in GET /posts (latest):', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
