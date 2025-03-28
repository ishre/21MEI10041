// app/trending-posts/page.tsx
import React from 'react';
import PostCard from '../../components/PostCard';

interface Post {
  id: number;
  content: string;
  userName: string;
  commentsCount: number;
}

async function getTrendingPosts(): Promise<Post[]> {
  const res = await fetch('http://localhost:3005/posts?type=popular', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch trending posts');
  const data = await res.json();
  return data.posts;
}

export default async function TrendingPostsPage() {
  const posts: Post[] = await getTrendingPosts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trending Posts</h1>
      <div>
        {posts.map(post => (
          <PostCard key={post.id} id={post.id} content={post.content} userName={post.userName} commentsCount={post.commentsCount} />
        ))}
      </div>
    </div>
  );
}
