const express = require('express');
const app = express();
const port = 3005;
app.use(express.json());

// Simple middleware for logging each incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);
  next();
});

const fetch = global.fetch || require('node-fetch');

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/test';

let authToken = null;
let tokenExpiry = null;

/**
 * Fetches and caches the auth token.
 * Uses the /auth endpoint by sending client credentials.
 */
async function getAuthToken() {
  const now = Date.now();
  if (authToken && tokenExpiry && now < tokenExpiry) {
    return authToken;
  }
  
  console.log(`[${new Date().toISOString()}] Fetching new auth token...`);
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
  
  // Assume tokenData.expires_in is in seconds.
  authToken = tokenData.access_token;
  tokenExpiry = now + tokenData.expires_in * 1000;
  console.log(`[${new Date().toISOString()}] New auth token received, valid until ${new Date(tokenExpiry).toISOString()}`);
  
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
    console.log(`[${new Date().toISOString()}] GET /users called`);
    // Fetch all users from the test server
    const usersResponse = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users`);
    const usersData = await usersResponse.json();
    
    // Adjust based on the expected structure: use usersData.users
    const usersObj = usersData.users || usersData;
    let usersArray = [];
    for (const [id, name] of Object.entries(usersObj)) {
      usersArray.push({ id, name });
    }
    
    // Concurrently fetch posts for each user to get their post count
    const userPostsCounts = await Promise.all(usersArray.map(async (user) => {
      const postsRes = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users/${user.id}/posts`);
      const postsData = await postsRes.json();
      const posts = postsData.posts || [];
      console.log(`[${new Date().toISOString()}] User ${user.id} (${user.name}) has ${posts.length} posts`);
      return {
        id: user.id,
        name: user.name,
        postsCount: posts.length
      };
    }));
    
    // Sort users by postsCount descending and return the top five
    userPostsCounts.sort((a, b) => b.postsCount - a.postsCount);
    console.log(`[${new Date().toISOString()}] Returning top 5 users`);
    res.json(userPostsCounts.slice(0, 5));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /users:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /posts
 * Query parameter: type (Accepted values: "latest" or "popular")
 * - For "latest": Returns the most recent posts (newest first, limited to 10).
 * - For "popular": Returns the post(s) with the highest number of comments.
 */
app.get('/posts', async (req, res) => {
  try {
    const type = req.query.type;
    console.log(`[${new Date().toISOString()}] GET /posts called with type=${type}`);
    if (!type || (type !== 'latest' && type !== 'popular')) {
      return res.status(400).json({ error: "Please provide query parameter type=popular or type=latest" });
    }
    
    // Fetch all users to aggregate posts
    const usersResponse = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users`);
    const usersData = await usersResponse.json();
    const usersObj = usersData.users || usersData;
    let allPosts = [];
    
    // Concurrently fetch posts for each user; attach user name for context
    const postsPromises = Object.entries(usersObj).map(async ([id, name]) => {
      const postsRes = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/users/${id}/posts`);
      const postsData = await postsRes.json();
      const posts = postsData.posts || [];
      posts.forEach(post => {
        post.userName = name;
      });
      console.log(`[${new Date().toISOString()}] Fetched ${posts.length} posts for user ${id}`);
      return posts;
    });
    
    // Flatten the resulting array of arrays
    const postsResults = await Promise.all(postsPromises);
    allPosts = postsResults.flat();

    if (type === 'latest') {
      // Sort posts by id descending (using id as a proxy for recency)
      allPosts.sort((a, b) => b.id - a.id);
      console.log(`[${new Date().toISOString()}] Returning ${Math.min(allPosts.length, 10)} latest posts`);
      res.json({ posts: allPosts.slice(0, 10) });
    } else if (type === 'popular') {
      // Concurrently fetch comments count for each post
      const postsWithComments = await Promise.all(allPosts.map(async (post) => {
        const commentsRes = await fetchWithAuth(`${TEST_SERVER_BASE_URL}/posts/${post.id}/comments`);
        const commentsData = await commentsRes.json();
        // Use the key "comments" or "coments" (as shown in sample response)
        const comments = commentsData.comments || commentsData.coments || [];
        return {
          ...post,
          commentsCount: comments.length
        };
      }));
      
      // Determine the maximum comment count
      let maxComments = 0;
      postsWithComments.forEach(post => {
        if (post.commentsCount > maxComments) {
          maxComments = post.commentsCount;
        }
      });
      console.log(`[${new Date().toISOString()}] Maximum comments found: ${maxComments}`);
      
      // Filter and return posts that have the maximum comment count
      const popularPosts = postsWithComments.filter(post => post.commentsCount === maxComments);
      console.log(`[${new Date().toISOString()}] Returning ${popularPosts.length} popular posts`);
      res.json({ posts: popularPosts });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server is running on port ${port}`);
});
