'use client';

import React, { useEffect, useState } from 'react';
import PostCard from '../../components/PostCard';

interface Post {
  id: number;
  content: string;
  userName: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestPosts = async () => {
    try {
      const res = await fetch('/api/posts?type=latest');
      if (!res.ok) throw new Error('Failed to fetch latest posts');
      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPosts();
    const interval = setInterval(fetchLatestPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="container mx-auto p-4">Loading feed...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      <div>
        {posts.map(post => (
          <PostCard key={post.id} id={post.id} content={post.content} userName={post.userName} />
        ))}
      </div>
    </div>
  );
}
